<?php

namespace App\Http\Controllers\Teams;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teams\UpdateTeamMemberRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class TeamMemberController extends Controller
{
    /**
     * Update the specified team member's role.
     */
    public function update(UpdateTeamMemberRequest $request, Team $team, User $user): RedirectResponse
    {
        Gate::authorize('updateMember', $team);

        $newRole = $request->validated('role');

        // Update membership pivot role (governs team management permissions)
        $team->memberships()
            ->where('user_id', $user->id)
            ->firstOrFail()
            ->update(['role' => $newRole]);

        // Sync Spatie Permission role (governs feature access)
        $this->syncSpatieRole($user, $team, $newRole);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member role updated.')]);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Remove the specified team member.
     */
    public function destroy(Team $team, User $user): RedirectResponse
    {
        Gate::authorize('removeMember', $team);

        abort_if($team->owner()?->is($user), 403, __('The team owner cannot be removed.'));

        // Remove scoped Spatie roles for this team
        setPermissionsTeamId($team->id);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $teamRoleNames = Role::where('team_id', $team->id)->pluck('name')->toArray();
        foreach ($teamRoleNames as $roleName) {
            if ($user->hasRole($roleName)) {
                $user->removeRole($roleName);
            }
        }

        $team->memberships()
            ->where('user_id', $user->id)
            ->delete();

        if ($user->isCurrentTeam($team)) {
            $user->switchTeam($user->personalTeam());
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Member removed.')]);

        return to_route('teams.edit', ['team' => $team->slug]);
    }

    /**
     * Sync the Spatie Permission role for the user scoped to the given team.
     */
    private function syncSpatieRole(User $user, Team $team, string $roleName): void
    {
        setPermissionsTeamId($team->id);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $role = Role::where('name', $roleName)
            ->where('team_id', $team->id)
            ->first();

        if ($role) {
            // Remove any existing scoped roles for this team then assign new one
            $existingRoleNames = Role::where('team_id', $team->id)->pluck('name')->toArray();
            $user->roles()
                ->whereIn('name', $existingRoleNames)
                ->detach();

            $user->assignRole($role);
        }
    }
}
