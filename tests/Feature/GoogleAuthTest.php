<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

test('redirects to google oauth page', function () {
    $response = $this->get(route('auth.google'));

    $response->assertRedirect();
});

test('can authenticate user with google and create team if new', function () {
    $abstractUser = Mockery::mock(SocialiteUser::class);
    $abstractUser->shouldReceive('getId')->andReturn('google-id-12345');
    $abstractUser->shouldReceive('getEmail')->andReturn('user@google.com');
    $abstractUser->shouldReceive('getName')->andReturn('Google User');
    $abstractUser->shouldReceive('getNickname')->andReturn(null);
    $abstractUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar.jpg');

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticated();

    $user = User::where('email', 'user@google.com')->first();
    expect($user)->not->toBeNull();
    expect($user->google_id)->toBe('google-id-12345');
    expect($user->currentTeam)->not->toBeNull();

    $response->assertRedirect(route('dashboard', ['current_team' => $user->currentTeam->slug]));
    $response->assertSessionHas('auth.password_confirmed_at');
});

test('authenticated user can confirm identity via google oauth and return to intended url', function () {
    $user = User::factory()->create([
        'email' => 'auth-confirm@example.com',
        'google_id' => 'google-auth-99',
    ]);

    $abstractUser = Mockery::mock(SocialiteUser::class);
    $abstractUser->shouldReceive('getId')->andReturn('google-auth-99');
    $abstractUser->shouldReceive('getEmail')->andReturn('auth-confirm@example.com');
    $abstractUser->shouldReceive('getAvatar')->andReturn(null);

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->actingAs($user)
        ->withSession(['url.intended' => route('security.edit')])
        ->get(route('auth.google.callback'));

    $response->assertRedirect(route('security.edit'));
    $response->assertSessionHas('auth.password_confirmed_at');
});
