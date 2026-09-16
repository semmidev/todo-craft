<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Services\AvatarService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request, AvatarService $avatarService): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if (array_key_exists('avatar', $validated)) {
            $avatarValue = $validated['avatar'];

            if ($avatarValue && str_starts_with($avatarValue, 'tmp/')) {
                $oldAvatarRaw = $user->getRawOriginal('avatar');
                $permanentKey = $avatarService->storeFromTmpKey($avatarValue, $oldAvatarRaw);
                if ($permanentKey) {
                    $user->avatar = $permanentKey;
                }
            } elseif ($avatarValue === null || $avatarValue === '') {
                $oldAvatarRaw = $user->getRawOriginal('avatar');
                $avatarService->deleteAvatar($oldAvatarRaw);
                $user->avatar = null;
            }
        }

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profil berhasil diperbarui.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
