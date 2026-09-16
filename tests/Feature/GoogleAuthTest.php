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

    $response->assertRedirect('/dashboard');

    $this->assertAuthenticated();

    $user = User::where('email', 'user@google.com')->first();
    expect($user)->not->toBeNull();
    expect($user->google_id)->toBe('google-id-12345');
    expect($user->currentTeam)->not->toBeNull();
});
