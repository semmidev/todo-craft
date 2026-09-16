<?php

namespace App\Http\Middleware;

use App\Models\TeamInvitation;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'currentTeam' => fn () => $user?->currentTeam ? $user->toUserTeam($user->currentTeam) : null,
            'teams' => fn () => $user?->toUserTeams(includeCurrent: true) ?? [],
            'pendingInvitations' => function () use ($user) {
                if (! $user) {
                    return [];
                }

                return TeamInvitation::query()
                    ->with(['inviter', 'team'])
                    ->whereRaw('LOWER(email) = ?', [strtolower($user->email)])
                    ->whereNull('accepted_at')
                    ->where(function ($query) {
                        $query->whereNull('expires_at')
                            ->orWhere('expires_at', '>=', now());
                    })
                    ->latest()
                    ->get()
                    ->map(function (TeamInvitation $invitation) {
                        return [
                            'code' => $invitation->code,
                            'inviterName' => $invitation->inviter?->name ?? 'Seseorang',
                            'team' => [
                                'name' => $invitation->team?->name ?? 'Tim',
                                'slug' => $invitation->team?->slug ?? '',
                            ],
                        ];
                    })
                    ->values()
                    ->toArray();
            },
            'userPermissions' => fn () => $user && $user->currentTeam ? $user->getPermissionsForTeam($user->currentTeam) : [],
            'flash' => fn () => [
                'toast' => $request->session()->get('inertia.flash_data.toast') ?? $request->session()->get('toast'),
                'success' => $request->session()->get('inertia.flash_data.success') ?? $request->session()->get('success'),
                'error' => $request->session()->get('inertia.flash_data.error') ?? $request->session()->get('error'),
                'info' => $request->session()->get('inertia.flash_data.info') ?? $request->session()->get('info'),
                'warning' => $request->session()->get('inertia.flash_data.warning') ?? $request->session()->get('warning'),
            ],
        ];
    }
}
