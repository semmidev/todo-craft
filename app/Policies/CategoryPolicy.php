<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\Team;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user, Team $team): bool
    {
        return $user->belongsToTeam($team);
    }

    public function create(User $user, Team $team): bool
    {
        return $user->belongsToTeam($team) && $user->hasPermissionTo('manage categories');
    }

    public function update(User $user, Category $category): bool
    {
        return $user->belongsToTeam($category->team) && $user->hasPermissionTo('manage categories');
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->belongsToTeam($category->team) && $user->hasPermissionTo('manage categories');
    }
}
