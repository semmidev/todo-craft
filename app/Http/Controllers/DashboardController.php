<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\Todo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class DashboardController extends Controller
{
    public function __invoke(Request $request, Team $currentTeam): Response
    {
        $user = $request->user();

        abort_unless(
            $user->ownsTeam($currentTeam) || $user->hasTeamPermission($currentTeam, 'dashboard.view'),
            403,
            __('You do not have permission to access the team dashboard.')
        );
        $email = strtolower($user->email);

        // Fetch pending invitations for the user
        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        // Todo Statistics
        $todoQuery = Todo::query()->where('team_id', $currentTeam->id);
        $totalTodos = (clone $todoQuery)->count();
        $completedTodos = (clone $todoQuery)->where('status', 'completed')->count();
        $inProgressTodos = (clone $todoQuery)->where('status', 'in_progress')->count();
        $pendingTodos = (clone $todoQuery)->where('status', 'pending')->count();
        $urgentTodos = (clone $todoQuery)->where('priority', 'urgent')->where('status', '!=', 'completed')->count();

        $completionRate = $totalTodos > 0 ? (int) round(($completedTodos / $totalTodos) * 100) : 0;

        // Recent Todos (Top 5)
        $recentTodos = Todo::query()
            ->where('team_id', $currentTeam->id)
            ->with(['category', 'items'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn (Todo $todo) => [
                'id' => $todo->id,
                'title' => $todo->title,
                'status' => $todo->status,
                'priority' => $todo->priority,
                'due_date' => $todo->due_date?->setTimezone('UTC')->toIso8601String(),
                'is_overdue' => $todo->due_date && $todo->due_date->isPast() && $todo->status !== 'completed',
                'category' => $todo->category ? [
                    'id' => $todo->category->id,
                    'name' => $todo->category->name,
                    'color' => $todo->category->color,
                ] : null,
                'items_count' => $todo->items->count(),
                'completed_items_count' => $todo->items->where('is_completed', true)->count(),
            ]);

        // Category breakdown
        $categoriesStats = Category::query()
            ->where('team_id', $currentTeam->id)
            ->withCount('todos')
            ->get()
            ->map(fn (Category $cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'color' => $cat->color,
                'todos_count' => $cat->todos_count,
            ]);

        // Recent Activity Log (Top 5)
        $recentActivities = Activity::query()
            ->with('causer')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($act) => [
                'id' => $act->id,
                'description' => $act->description,
                'causer_name' => $act->causer?->name ?? 'System',
                'created_at' => $act->created_at->diffForHumans(),
            ]);

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'stats' => [
                'totalTodos' => $totalTodos,
                'completedTodos' => $completedTodos,
                'inProgressTodos' => $inProgressTodos,
                'pendingTodos' => $pendingTodos,
                'urgentTodos' => $urgentTodos,
                'completionRate' => $completionRate,
                'membersCount' => $currentTeam->members()->count(),
            ],
            'recentTodos' => $recentTodos,
            'categoriesStats' => $categoriesStats,
            'recentActivities' => $recentActivities,
            'permissions' => $user->toTeamPermissions($currentTeam),
        ]);
    }
}
