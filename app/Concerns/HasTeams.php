<?php

namespace App\Concerns;

use App\Data\TeamPermissions;
use App\Data\UserTeam;
use App\Enums\TeamRole;
use App\Models\Membership;
use App\Models\Team;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\URL;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;

trait HasTeams
{
    /**
     * Get all of the teams the user belongs to.
     *
     * @return BelongsToMany<Team, $this>
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_members', 'user_id', 'team_id')
            ->withPivot(['role'])
            ->withTimestamps();
    }

    /**
     * Get all of the teams the user owns.
     *
     * @return HasManyThrough<Team, Membership, $this>
     */
    public function ownedTeams(): HasManyThrough
    {
        return $this->hasManyThrough(
            Team::class,
            Membership::class,
            'user_id',
            'id',
            'id',
            'team_id',
        )->where('team_members.role', TeamRole::Owner->value);
    }

    /**
     * Get all of the memberships for the user.
     *
     * @return HasMany<Membership, $this>
     */
    public function teamMemberships(): HasMany
    {
        return $this->hasMany(Membership::class, 'user_id');
    }

    /**
     * Get the user's current team.
     *
     * @return BelongsTo<Team, $this>
     */
    public function currentTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'current_team_id');
    }

    /**
     * Get the user's personal team.
     */
    public function personalTeam(): ?Team
    {
        return $this->ownedTeams()
            ->where('teams.is_personal', true)
            ->first();
    }

    /**
     * Switch to the given team.
     */
    public function switchTeam(Team $team): bool
    {
        if (! $this->belongsToTeam($team)) {
            return false;
        }

        $this->update(['current_team_id' => $team->id]);
        $this->setRelation('currentTeam', $team);

        URL::defaults(['current_team' => $team->slug]);

        return true;
    }

    /**
     * Determine if the user belongs to the given team.
     */
    public function belongsToTeam(Team $team): bool
    {
        return $this->teams()->where('teams.id', $team->id)->exists();
    }

    /**
     * Determine if the given team is the user's current team.
     */
    public function isCurrentTeam(Team $team): bool
    {
        return $this->current_team_id === $team->id;
    }

    /**
     * Determine if the user is the owner of the given team.
     */
    public function ownsTeam(Team $team): bool
    {
        $role = $this->teamRole($team);

        return $role === TeamRole::Owner || $role === TeamRole::Owner->value;
    }

    /**
     * Get the user's role on the given team.
     */
    public function teamRole(Team $team): TeamRole|string|null
    {
        $membership = $this->teamMemberships()
            ->where('team_id', $team->id)
            ->first();

        if (! $membership) {
            return null;
        }

        $role = $membership->role;

        if (is_string($role)) {
            return TeamRole::tryFrom($role) ?? $role;
        }

        return $role;
    }

    /**
     * Get the user's teams as a collection of UserTeam objects.
     *
     * @return Collection<int, UserTeam>
     */
    public function toUserTeams(bool $includeCurrent = false): Collection
    {
        return $this->teams()
            ->get()
            ->map(fn (Team $team) => ! $includeCurrent && $this->isCurrentTeam($team) ? null : $this->toUserTeam($team))
            ->filter()
            ->values();
    }

    /**
     * Get the user's team as a UserTeam object.
     */
    public function toUserTeam(Team $team): UserTeam
    {
        $role = $this->teamRole($team);
        $roleValue = $role instanceof TeamRole ? $role->value : $role;
        $roleLabel = $role instanceof TeamRole ? $role->label() : ucfirst($role ?? '');

        return new UserTeam(
            id: $team->id,
            name: $team->name,
            slug: $team->slug,
            isPersonal: $team->is_personal,
            role: $roleValue,
            roleLabel: $roleLabel,
            isCurrent: $this->isCurrentTeam($team),
        );
    }

    /**
     * Get the standard permissions for a team as a TeamPermissions object.
     */
    public function toTeamPermissions(Team $team): TeamPermissions
    {
        setPermissionsTeamId($team->id);
        $isOwner = $this->ownsTeam($team);

        return new TeamPermissions(
            canUpdateTeam: $isOwner || $this->hasTeamPermission($team, 'teams.update'),
            canDeleteTeam: ! $team->is_personal && ($isOwner || $this->hasTeamPermission($team, 'teams.delete')),
            canAddMember: $isOwner || $this->hasTeamPermission($team, 'teams.members.manage'),
            canUpdateMember: $isOwner || $this->hasTeamPermission($team, 'teams.members.manage'),
            canRemoveMember: $isOwner || $this->hasTeamPermission($team, 'teams.members.manage'),
            canCreateInvitation: $isOwner || $this->hasTeamPermission($team, 'teams.invitations.manage'),
            canCancelInvitation: $isOwner || $this->hasTeamPermission($team, 'teams.invitations.manage'),
        );
    }

    public function fallbackTeam(?Team $excluding = null): ?Team
    {
        return $this->teams()
            ->when($excluding, fn ($query) => $query->where('teams.id', '!=', $excluding->id))
            ->orderByRaw('LOWER(teams.name)')
            ->first();
    }

    /**
     * Determine if the user has the given permission on the team.
     */
    public function hasTeamPermission(Team $team, string $permission): bool
    {
        setPermissionsTeamId($team->id);

        if (! $this->belongsToTeam($team)) {
            return false;
        }

        try {
            return $this->hasPermissionTo($permission);
        } catch (PermissionDoesNotExist) {
            return false;
        }
    }

    /**
     * Get all permission names granted to the user for the given team.
     *
     * @return array<string>
     */
    public function getPermissionsForTeam(Team $team): array
    {
        if ($this->ownsTeam($team)) {
            return RoleAndPermissionSeeder::PERMISSIONS;
        }

        setPermissionsTeamId($team->id);

        try {
            return $this->getAllPermissions()->pluck('name')->values()->toArray();
        } catch (\Throwable) {
            return [];
        }
    }
}
