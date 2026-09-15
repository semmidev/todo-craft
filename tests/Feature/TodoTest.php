<?php

use App\Enums\TeamRole;
use App\Models\Category;
use App\Models\Team;
use App\Models\Todo;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->user = User::factory()->create();
    $this->user->assignRole('admin');

    $this->team = Team::create([
        'name' => 'Test Team',
        'slug' => 'test-team',
        'is_personal' => true,
    ]);

    $this->team->members()->attach($this->user->id, ['role' => TeamRole::Owner->value]);
    $this->user->update(['current_team_id' => $this->team->id]);
});

test('authenticated user can view todo index', function () {
    $response = $this->actingAs($this->user)
        ->get("/{$this->team->slug}/todos");

    $response->assertStatus(200);
});

test('user can create a todo task', function () {
    $category = Category::create([
        'team_id' => $this->team->id,
        'name' => 'Backend',
        'slug' => 'backend',
        'color' => '#3b82f6',
    ]);

    $response = $this->actingAs($this->user)
        ->post("/{$this->team->slug}/todos", [
            'title' => 'Implement Spatie Data DTO',
            'description' => 'Create typed DTO object for Todo creation',
            'status' => 'pending',
            'priority' => 'high',
            'category_id' => $category->id,
            'assigned_to_id' => $this->user->id,
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('todos', [
        'team_id' => $this->team->id,
        'title' => 'Implement Spatie Data DTO',
        'priority' => 'high',
        'category_id' => $category->id,
    ]);
});

test('user can toggle todo completion status', function () {
    $todo = Todo::create([
        'team_id' => $this->team->id,
        'user_id' => $this->user->id,
        'title' => 'Test status toggle',
        'status' => 'pending',
        'priority' => 'medium',
    ]);

    $this->actingAs($this->user)
        ->patch("/{$this->team->slug}/todos/{$todo->id}/toggle-status");

    expect($todo->fresh()->status)->toBe('completed');
});

test('query builder filters todos by status', function () {
    Todo::create([
        'team_id' => $this->team->id,
        'user_id' => $this->user->id,
        'title' => 'Task One',
        'status' => 'completed',
        'priority' => 'low',
    ]);

    Todo::create([
        'team_id' => $this->team->id,
        'user_id' => $this->user->id,
        'title' => 'Task Two',
        'status' => 'pending',
        'priority' => 'high',
    ]);

    $response = $this->actingAs($this->user)
        ->get("/{$this->team->slug}/todos?filter[status]=completed");

    $response->assertStatus(200);
});
