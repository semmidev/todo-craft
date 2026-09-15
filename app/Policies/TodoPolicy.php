<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\Todo;
use App\Models\User;

class TodoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Team $team): bool
    {
        return $user->belongsToTeam($team) && ($user->ownsTeam($team) || $user->hasTeamPermission($team, 'todos.view'));
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Todo $todo): bool
    {
        return $user->belongsToTeam($todo->team) && ($user->ownsTeam($todo->team) || $user->hasTeamPermission($todo->team, 'todos.view'));
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Team $team): bool
    {
        return $user->belongsToTeam($team) && ($user->ownsTeam($team) || $user->hasTeamPermission($team, 'todos.create'));
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Todo $todo): bool
    {
        return $user->belongsToTeam($todo->team) && ($user->ownsTeam($todo->team) || $user->hasTeamPermission($todo->team, 'todos.update'));
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Todo $todo): bool
    {
        return $user->belongsToTeam($todo->team) && ($user->ownsTeam($todo->team) || $user->hasTeamPermission($todo->team, 'todos.delete'));
    }
}
