<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Teams\CreateTeam;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AvatarService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleController extends Controller
{
    public function __construct(
        private CreateTeam $createTeam,
        private AvatarService $avatarService,
    ) {}

    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handle callback from Google authentication.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable $e) {
            $target = Auth::check() ? route('password.confirm') : route('login');

            return redirect()->to($target)->withErrors([
                'email' => 'Gagal melakukan otentikasi dengan Google. Silakan coba lagi.',
            ]);
        }

        // Always mark password confirmed in session when Google authentication succeeds
        session(['auth.password_confirmed_at' => time()]);

        if (Auth::check()) {
            $currentUser = Auth::user();

            if (strtolower($currentUser->email) !== strtolower($googleUser->getEmail())) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Email akun Google ('.$googleUser->getEmail().') harus sama dengan email akun Anda ('.$currentUser->email.').',
                ]);

                return redirect()->route('security.edit');
            }

            $existingUserWithGoogle = User::where('google_id', $googleUser->getId())
                ->where('id', '!=', $currentUser->id)
                ->first();

            if ($existingUserWithGoogle) {
                Inertia::flash('toast', [
                    'type' => 'error',
                    'message' => 'Akun Google ini sudah terhubung dengan pengguna lain.',
                ]);

                return redirect()->route('security.edit');
            }

            $updates = ['google_id' => $googleUser->getId()];

            $googleAvatarUrl = $googleUser->getAvatar();
            if (! $currentUser->avatar && $googleAvatarUrl) {
                $storedAvatar = $this->avatarService->downloadAndStoreFromUrl($googleAvatarUrl);
                $updates['avatar'] = $storedAvatar ?? $googleAvatarUrl;
            }

            $currentUser->update($updates);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Akun Google berhasil dihubungkan.',
            ]);

            return redirect()->route('security.edit');
        } else {
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            $googleAvatarUrl = $googleUser->getAvatar();

            if ($user) {
                $updates = [];
                if (! $user->google_id) {
                    $updates['google_id'] = $googleUser->getId();
                }

                if (! $user->avatar && $googleAvatarUrl) {
                    $storedAvatar = $this->avatarService->downloadAndStoreFromUrl($googleAvatarUrl);
                    $updates['avatar'] = $storedAvatar ?? $googleAvatarUrl;
                }

                if (! empty($updates)) {
                    $user->update($updates);
                }
            } else {
                $user = DB::transaction(function () use ($googleUser, $googleAvatarUrl) {
                    $storedAvatar = $googleAvatarUrl ? $this->avatarService->downloadAndStoreFromUrl($googleAvatarUrl) : null;

                    $newUser = User::create([
                        'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Pengguna Google',
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'avatar' => $storedAvatar ?? $googleAvatarUrl,
                        'email_verified_at' => now(),
                        'password' => null,
                    ]);

                    $this->createTeam->handle($newUser, $newUser->name."'s Team", isPersonal: true);

                    return $newUser;
                });
            }

            Auth::login($user, remember: true);
        }

        $team = $user->currentTeam ?? $user->personalTeam() ?? $user->teams()->first();

        if ($team) {
            if (! $user->current_team_id) {
                $user->update(['current_team_id' => $team->id]);
            }

            URL::defaults(['current_team' => $team->slug]);

            return redirect()->intended(route('dashboard', ['current_team' => $team->slug]));
        }

        return redirect()->intended(route('home'));
    }

    /**
     * Disconnect Google account from user profile.
     */
    public function disconnect(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasPassword()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'Anda harus mengatur kata sandi terlebih dahulu sebelum memutuskan sambungan akun Google.',
            ]);

            return back();
        }

        $user->update(['google_id' => null]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Sambungan akun Google berhasil diputuskan.',
        ]);

        return back();
    }
}
