<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Team $currentTeam): Response
    {
        $this->authorize('viewAny', [Category::class, $currentTeam]);

        $categories = Category::where('team_id', $currentTeam->id)
            ->withCount('todos')
            ->get()
            ->map(fn (Category $cat) => [
                'id' => $cat->id,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'color' => $cat->color,
                'icon' => $cat->icon,
                'todos_count' => $cat->todos_count,
            ]);

        return Inertia::render('categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request, Team $currentTeam): RedirectResponse
    {
        $this->authorize('create', [Category::class, $currentTeam]);

        $request->merge(['slug' => Str::slug($request->input('name', ''))]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => [
                'required',
                'string',
                Rule::unique('categories', 'slug')->where('team_id', $currentTeam->id),
            ],
            'color' => ['required', 'string'],
            'icon' => ['nullable', 'string'],
        ], [
            'slug.unique' => __('A category with this name already exists in this team.'),
        ]);

        Category::create([
            'team_id' => $currentTeam->id,
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'color' => $validated['color'] ?? '#3b82f6',
            'icon' => $validated['icon'] ?? 'tag',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category created.')]);

        return back();
    }

    public function update(Request $request, Team $currentTeam, Category $category): RedirectResponse
    {
        $this->authorize('update', $category);

        $request->merge(['slug' => Str::slug($request->input('name', ''))]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => [
                'required',
                'string',
                Rule::unique('categories', 'slug')
                    ->where('team_id', $currentTeam->id)
                    ->ignore($category->id),
            ],
            'color' => ['required', 'string'],
            'icon' => ['nullable', 'string'],
        ], [
            'slug.unique' => __('A category with this name already exists in this team.'),
        ]);

        $category->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'color' => $validated['color'],
            'icon' => $validated['icon'] ?? $category->icon,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category updated.')]);

        return back();
    }

    public function destroy(Team $currentTeam, Category $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        $category->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Category deleted.')]);

        return back();
    }
}
