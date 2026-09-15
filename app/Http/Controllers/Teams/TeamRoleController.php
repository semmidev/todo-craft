<?php

namespace App\Http\Controllers\Teams;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Models\Team;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class TeamRoleController extends Controller
{
    /**
     * Display all roles for the given team.
     */
    public function index(Request $request, Team $team): Response
    {
        $this->authorizeRoleManagement($request, $team);

        setPermissionsTeamId($team->id);

        $roles = Role::where('team_id', $team->id)
            ->with('permissions')
            ->get()
            ->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name,
                'is_default' => in_array($role->name, array_column(TeamRole::cases(), 'value')),
                'permissions' => $role->permissions->pluck('name')->values(),
            ]);

        return Inertia::render('teams/roles/index', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
            ],
            'roles' => $roles,
            'allPermissions' => RoleAndPermissionSeeder::PERMISSIONS,
            'permissions' => $request->user()->toTeamPermissions($team),
        ]);
    }

    /**
     * Store a new role for the given team.
     */
    public function store(Request $request, Team $team): RedirectResponse
    {
        $this->authorizeRoleManagement($request, $team);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:64',
                Rule::unique('roles')->where(fn ($query) => $query->where('team_id', $team->id)),
            ],
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', Rule::in(RoleAndPermissionSeeder::PERMISSIONS)],
        ]);

        setPermissionsTeamId($team->id);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
            'team_id' => $team->id,
        ]);

        if (! empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role ":name" created.', ['name' => $role->name])]);

        return to_route('teams.roles.index', ['team' => $team->slug]);
    }

    /**
     * Update the permissions for an existing role.
     */
    public function update(Request $request, Team $team, Role $role): RedirectResponse
    {
        $this->authorizeRoleManagement($request, $team);
        abort_if($role->team_id !== $team->id, 404);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:64',
                Rule::unique('roles')->where(fn ($query) => $query->where('team_id', $team->id))->ignore($role->id),
            ],
            'permissions' => ['present', 'array'],
            'permissions.*' => ['string', Rule::in(RoleAndPermissionSeeder::PERMISSIONS)],
        ]);

        // Protect default role names from being renamed
        $isDefault = in_array($role->name, array_column(TeamRole::cases(), 'value'));

        setPermissionsTeamId($team->id);
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        if (! $isDefault) {
            $role->update(['name' => $validated['name']]);
        }

        $role->syncPermissions($validated['permissions']);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role ":name" updated.', ['name' => $role->name])]);

        return to_route('teams.roles.index', ['team' => $team->slug]);
    }

    /**
     * Delete a custom role from the team.
     */
    public function destroy(Team $team, Role $role): RedirectResponse
    {
        abort_if($role->team_id !== $team->id, 404);

        // Prevent deletion of default roles (Owner, Admin, Member)
        abort_if(
            in_array($role->name, array_column(TeamRole::cases(), 'value')),
            403,
            __('Default roles cannot be deleted.'),
        );

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Move all users with this role to Member role
        $memberRole = Role::where('name', TeamRole::Member->value)
            ->where('team_id', $team->id)
            ->first();

        if ($memberRole) {
            setPermissionsTeamId($team->id);
            foreach ($role->users as $user) {
                $user->removeRole($role);
                $user->assignRole($memberRole);
            }
        }

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Role deleted.')]);

        return to_route('teams.roles.index', ['team' => $team->slug]);
    }

    /**
     * Authorize that the current user has permission to manage roles in this team.
     */
    private function authorizeRoleManagement(Request $request, Team $team): void
    {
        setPermissionsTeamId($team->id);
        $user = $request->user();

        $hasPermission = false;
        try {
            $hasPermission = $user->hasPermissionTo('roles.manage');
        } catch (PermissionDoesNotExist) {
            $hasPermission = false;
        }

        abort_unless(
            $user->belongsToTeam($team) && ($user->ownsTeam($team) || $hasPermission),
            403,
        );
    }
}
