<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

test('downloads and stores google user avatar to s3 storage on login', function () {
    $diskName = config('filesystems.default', 'local');
    Storage::fake($diskName);

    Http::fake([
        'https://lh3.googleusercontent.com/avatar.jpg' => Http::response('fake-image-binary-content', 200, ['Content-Type' => 'image/jpeg']),
    ]);

    $abstractUser = Mockery::mock(SocialiteUser::class);
    $abstractUser->shouldReceive('getId')->andReturn('google-id-999');
    $abstractUser->shouldReceive('getEmail')->andReturn('avatar-user@google.com');
    $abstractUser->shouldReceive('getName')->andReturn('Avatar Google User');
    $abstractUser->shouldReceive('getNickname')->andReturn(null);
    $abstractUser->shouldReceive('getAvatar')->andReturn('https://lh3.googleusercontent.com/avatar.jpg');

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.google.callback'));

    $this->assertAuthenticated();

    $user = User::where('email', 'avatar-user@google.com')->first();
    expect($user)->not->toBeNull();
    expect($user->google_id)->toBe('google-id-999');

    $rawAvatarKey = $user->getRawOriginal('avatar');
    expect($rawAvatarKey)->toStartWith('avatars/');
    expect(Storage::disk($diskName)->exists($rawAvatarKey))->toBeTrue();
    expect(Storage::disk($diskName)->get($rawAvatarKey))->toBe('fake-image-binary-content');
});

test('can update profile avatar using presigned upload tmp key', function () {
    $diskName = config('filesystems.default', 'local');
    Storage::fake($diskName);

    $user = User::factory()->create();

    // Simulate uploaded file in tmp/ directory
    $tmpKey = 'tmp/uuid-1234/profile.jpg';
    Storage::disk($diskName)->put($tmpKey, 'uploaded-avatar-content');

    $response = $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $tmpKey,
        ]);

    $response->assertRedirect(route('profile.edit'));

    $user->refresh();
    $rawAvatarKey = $user->getRawOriginal('avatar');

    expect($rawAvatarKey)->toStartWith('avatars/');
    expect(Storage::disk($diskName)->exists($rawAvatarKey))->toBeTrue();
    expect(Storage::disk($diskName)->get($rawAvatarKey))->toBe('uploaded-avatar-content');
    expect(Storage::disk($diskName)->exists($tmpKey))->toBeFalse();
});

test('can delete user profile avatar', function () {
    $diskName = config('filesystems.default', 'local');
    Storage::fake($diskName);

    $avatarKey = 'avatars/existing-avatar.jpg';
    Storage::disk($diskName)->put($avatarKey, 'existing-avatar-content');

    $user = User::factory()->create([
        'avatar' => $avatarKey,
    ]);

    $response = $this->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => '',
        ]);

    $response->assertRedirect(route('profile.edit'));

    $user->refresh();
    expect($user->getRawOriginal('avatar'))->toBeNull();
    expect(Storage::disk($diskName)->exists($avatarKey))->toBeFalse();
});
