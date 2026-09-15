<?php

namespace App\Policies;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;

class TeamPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Team $team): bool
    {
        return $user->belongsToTeam($team);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Team $team): bool
    {
        setPermissionsTeamId($team->id);

        return $user->belongsToTeam($team)
            && ($user->ownsTeam($team) || $this->userHasPermission($user, 'teams.update'));
    }

    /**
     * Determine whether the user can leave the team.
     */
    public function leave(User $user, Team $team): bool
    {
        return ! $team->is_personal
            && $user->belongsToTeam($team)
            && ! $user->ownsTeam($team);
    }

    /**
     * Determine whether the user can add a member to the team.
     */
    public function addMember(User $user, Team $team): bool
    {
        setPermissionsTeamId($team->id);

        return $user->belongsToTeam($team)
            && ($user->ownsTeam($team) || $this->userHasPermission($user, 'teams.members.manage'));
    }

    /**
     * Determine whether the user can update a member's role in the team.
     */
    public function updateMember(User $user, Team $team): bool
    {
        setPermissionsTeamId($team->id);

        return $user->belongsToTeam($team)
            && ($user->ownsTeam($team) || $this->userHasPermission($user, 'teams.members.manage'));
    }

    /**
     * Determine whether the user can remove a member from the team.
     */
    public function removeMember(User $user, Team $team): bool
    {
        setPermissionsTeamId($team->id);

        return $user->belongsToTeam($team)
            && ($user->ownsTeam($team) || $this->userHasPermission($user, 'teams.members.manage'));
    }

    /**
     * Determine whether the user can invite members to the team.
     */
    /**
     * Determine whether the user can invite members to the team.
     */
    public function inviteMember(User $user, Team $team): bool
    {
        setPermissionsTeamId($team->id);

        return $user->belongsToTeam($team)
            && ($user->ownsTeam($team) || $this->isAtLeastAdmin($user, $team) || $this->userHasPermission($user, 'teams.invitations.manage'));
    }

    /**
     * Determine whether the user can cancel invitations.
     */
    public function cancelInvitation(User $user, Team $team): bool
    {
        setPermissionsTeamId($team->id);

        return $user->belongsToTeam($team)
            && ($user->ownsTeam($team) || $this->isAtLeastAdmin($user, $team) || $this->userHasPermission($user, 'teams.invitations.manage'));
    }

    /**
     * Check if user role is at least Admin.
     */
    private function isAtLeastAdmin(User $user, Team $team): bool
    {
        $role = $user->teamRole($team);
        if ($role instanceof TeamRole) {
            return $role->isAtLeast(TeamRole::Admin);
        }

        return in_array($role, ['owner', 'admin'], true);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Team $team): bool
    {
        setPermissionsTeamId($team->id);

        return ! $team->is_personal
            && $user->belongsToTeam($team)
            && ($user->ownsTeam($team) || $this->userHasPermission($user, 'teams.delete'));
    }

    /**
     * Safely check if user has permission without throwing PermissionDoesNotExist exception.
     */
    private function userHasPermission(User $user, string $permission): bool
    {
        try {
            return $user->hasPermissionTo($permission);
        } catch (PermissionDoesNotExist) {
            return false;
        }
    }
}
