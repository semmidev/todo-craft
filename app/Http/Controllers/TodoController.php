<?php

namespace App\Http\Controllers;

use App\Data\CategoryData;
use App\Data\TodoData;
use App\Models\Category;
use App\Models\Team;
use App\Models\Todo;
use App\Models\TodoItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class TodoController extends Controller
{
    /**
     * Display a listing of todos for the given team.
     */
    public function index(Request $request, Team $currentTeam): Response
    {
        $this->authorize('viewAny', [Todo::class, $currentTeam]);

        $query = QueryBuilder::for(Todo::class)
            ->where('team_id', $currentTeam->id)
            ->allowedFilters(
                AllowedFilter::exact('status'),
                AllowedFilter::exact('priority'),
                AllowedFilter::exact('category_id'),
                AllowedFilter::exact('assigned_to_id'),
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('title', 'like', "%{$value}%")
                            ->orWhere('description', 'like', "%{$value}%");
                    });
                }),
            )
            ->allowedSorts('title', 'due_date', 'created_at', 'priority', 'status', 'category_id', 'assigned_to_id')
            ->allowedIncludes('category', 'user', 'assignee', 'items', 'media', 'activities')
            ->defaultSort('-created_at')
            ->with(['category', 'user', 'assignee', 'items', 'media']);

        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $todos = $query->paginate($perPage)
            ->withQueryString()
            ->through(fn (Todo $todo) => TodoData::fromModel($todo));

        $categories = Category::where('team_id', $currentTeam->id)
            ->get()
            ->map(fn (Category $c) => CategoryData::fromModel($c));

        $teamMembers = $currentTeam->members()
            ->get(['users.id', 'users.name', 'users.email']);

        $stats = [
            'total' => Todo::where('team_id', $currentTeam->id)->count(),
            'pending' => Todo::where('team_id', $currentTeam->id)->where('status', 'pending')->count(),
            'in_progress' => Todo::where('team_id', $currentTeam->id)->where('status', 'in_progress')->count(),
            'completed' => Todo::where('team_id', $currentTeam->id)->where('status', 'completed')->count(),
            'due_today' => Todo::where('team_id', $currentTeam->id)
                ->whereDate('due_date', now()->today())
                ->where('status', '!=', 'completed')
                ->count(),
        ];

        return Inertia::render('todos/index', [
            'todos' => $todos,
            'categories' => $categories,
            'teamMembers' => $teamMembers,
            'stats' => $stats,
            'filters' => $request->input('filter', []),
            'sort' => $request->input('sort', '-created_at'),
        ]);
    }

    /**
     * Store a newly created todo.
     */
    public function store(Request $request, Team $currentTeam): RedirectResponse
    {
        $this->authorize('create', [Todo::class, $currentTeam]);

        $data = TodoData::validate($request->all());

        $dueDate = ! empty($data['due_date'])
            ? Carbon::parse($data['due_date'])->setTimezone('UTC')
            : null;

        $todo = Todo::create([
            'team_id' => $currentTeam->id,
            'user_id' => $request->user()->id,
            'assigned_to_id' => $data['assigned_to_id'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'] ?? 'pending',
            'priority' => $data['priority'] ?? 'medium',
            'due_date' => $dueDate,
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $todo->addMedia($file)->toMediaCollection('attachments');
            }
        }

        if ($request->filled('items') && is_array($request->input('items'))) {
            foreach ($request->input('items') as $index => $itemData) {
                if (! empty($itemData['title'])) {
                    $todo->items()->create([
                        'title' => $itemData['title'],
                        'is_completed' => $itemData['is_completed'] ?? false,
                        'order' => $index + 1,
                    ]);
                }
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Tugas todo berhasil dibuat.')]);

        return back();
    }

    /**
     * Display the specified todo with full activity log and media.
     */
    public function show(Team $currentTeam, Todo $todo): Response
    {
        $this->authorize('view', $todo);

        $todo->load(['category', 'user', 'assignee', 'items', 'media', 'activities.causer']);

        return Inertia::render('todos/show', [
            'todo' => TodoData::fromModel($todo),
        ]);
    }

    /**
     * Update the specified todo.
     */
    public function update(Request $request, Team $currentTeam, Todo $todo): RedirectResponse
    {
        $this->authorize('update', $todo);

        $data = TodoData::validate($request->all());

        $dueDate = ! empty($data['due_date'])
            ? Carbon::parse($data['due_date'])->setTimezone('UTC')
            : null;

        $completedAt = $data['status'] === 'completed' && ! $todo->completed_at
            ? Carbon::now()->setTimezone('UTC')
            : ($data['status'] !== 'completed' ? null : $todo->completed_at);

        $todo->update([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'status' => $data['status'],
            'priority' => $data['priority'],
            'category_id' => $data['category_id'] ?? null,
            'assigned_to_id' => $data['assigned_to_id'] ?? null,
            'due_date' => $dueDate,
            'completed_at' => $completedAt,
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $todo->addMedia($file)->toMediaCollection('attachments');
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Tugas todo berhasil diperbarui.')]);

        return back();
    }

    /**
     * Remove the specified todo.
     */
    public function destroy(Team $currentTeam, Todo $todo): RedirectResponse
    {
        $this->authorize('delete', $todo);

        $todo->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Tugas todo berhasil dihapus.')]);

        return back();
    }

    /**
     * Toggle completion status of a todo.
     */
    public function toggleStatus(Team $currentTeam, Todo $todo): RedirectResponse
    {
        $this->authorize('update', $todo);

        $newStatus = $todo->status === 'completed' ? 'pending' : 'completed';

        $todo->update([
            'status' => $newStatus,
            'completed_at' => $newStatus === 'completed' ? now() : null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Status todo berhasil diperbarui.')]);

        return back();
    }

    /**
     * Toggle completion status of a checklist item inside a todo.
     */
    public function toggleItem(Team $currentTeam, Todo $todo, TodoItem $item): RedirectResponse
    {
        $this->authorize('update', $todo);

        $item->update([
            'is_completed' => ! $item->is_completed,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Item daftar periksa berhasil diperbarui.')]);

        return back();
    }
}
