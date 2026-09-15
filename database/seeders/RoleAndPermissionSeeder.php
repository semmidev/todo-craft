<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * List of all static permissions for the application.
     * All authorization in this app is strictly permission-based.
     * Roles are created dynamically per-team in CreateTeam action.
     *
     * @var array<string>
     */
    public const PERMISSIONS = [
        'dashboard.view',
        'teams.update',
        'teams.delete',
        'teams.members.manage',
        'teams.invitations.manage',
        'roles.manage',
        'todos.view',
        'todos.create',
        'todos.update',
        'todos.delete',
        'categories.manage',
        'activity_log.view',
        'admin.dashboard.access',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create static permissions (global — not scoped to any team)
        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web'],
            );
        }
    }
}
