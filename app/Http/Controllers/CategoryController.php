<?php

namespace App\Http\Controllers;

use App\Data\CategoryData;
use App\Models\Category;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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

        $data = CategoryData::validate($request->all());

        Category::create([
            'team_id' => $currentTeam->id,
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'color' => $data['color'] ?? '#3b82f6',
            'icon' => $data['icon'] ?? 'tag',
        ]);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Team $currentTeam, Category $category): RedirectResponse
    {
        $this->authorize('update', $category);

        $data = CategoryData::validate($request->all());

        $category->update([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'color' => $data['color'],
            'icon' => $data['icon'] ?? $category->icon,
        ]);

        return back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Team $currentTeam, Category $category): RedirectResponse
    {
        $this->authorize('delete', $category);

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }
}
