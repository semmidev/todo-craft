<?php

namespace App\Actions\Teams;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CreateTeam
{
    /**
     * Default role definitions: role name → permissions it should receive.
     *
     * @var array<string, array<string>>
     */
    private const DEFAULT_ROLES = [
        TeamRole::Owner->value => RoleAndPermissionSeeder::PERMISSIONS,
        TeamRole::Admin->value => [
            'teams.update',
            'teams.members.manage',
            'teams.invitations.manage',
            'roles.manage',
            'todos.view',
            'todos.create',
            'todos.update',
            'todos.delete',
            'categories.manage',
            'activity_log.view',
        ],
        TeamRole::Member->value => [
            'todos.view',
            'todos.create',
            'todos.update',
        ],
    ];

    /**
     * Create a new team, provision default roles, and add the user as owner.
     */
    public function handle(User $user, string $name, bool $isPersonal = false, ?string $slug = null): Team
    {
        return DB::transaction(function () use ($user, $name, $isPersonal, $slug) {
            $team = Team::create([
                'name' => $name,
                'slug' => $slug ?? Team::generateUniqueTeamSlug($name),
                'is_personal' => $isPersonal,
            ]);

            $this->provisionDefaultRoles($team);

            $team->memberships()->create([
                'user_id' => $user->id,
                'role' => TeamRole::Owner,
            ]);

            // Assign Spatie Owner role scoped to this team
            setPermissionsTeamId($team->id);
            $ownerRole = Role::where('name', TeamRole::Owner->value)
                ->where('team_id', $team->id)
                ->firstOrFail();
            $user->assignRole($ownerRole);

            $user->switchTeam($team);

            return $team;
        });
    }

    /**
     * Create default Spatie roles scoped to the given team and assign permissions.
     */
    private function provisionDefaultRoles(Team $team): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (RoleAndPermissionSeeder::PERMISSIONS as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        setPermissionsTeamId($team->id);

        foreach (self::DEFAULT_ROLES as $roleName => $permissionNames) {
            /** @var Role $role */
            $role = Role::create([
                'name' => $roleName,
                'guard_name' => 'web',
                'team_id' => $team->id,
            ]);

            if (! empty($permissionNames)) {
                $role->givePermissionTo($permissionNames);
            }
        }
    }
}
