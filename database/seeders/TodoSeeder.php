<?php

namespace Database\Seeders;

use App\Enums\TeamRole;
use App\Models\Category;
use App\Models\Team;
use App\Models\Todo;
use App\Models\User;
use Illuminate\Database\Seeder;

class TodoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure default test user exists
        $user = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Demo Admin',
                'password' => bcrypt('password'),
            ]
        );

        $user->assignRole('admin');

        // Ensure team exists for user
        $team = $user->teams()->first() ?? Team::firstOrCreate(
            ['slug' => 'default-workspace'],
            [
                'name' => 'Default Workspace',
                'is_personal' => true,
            ]
        );

        if (! $user->teams()->where('teams.id', $team->id)->exists()) {
            $team->members()->attach($user->id, [
                'role' => TeamRole::Owner->value,
            ]);
        }

        $user->update(['current_team_id' => $team->id]);

        // Seed Categories
        $categories = [
            ['name' => 'Work', 'slug' => 'work', 'color' => '#3b82f6', 'icon' => 'briefcase'],
            ['name' => 'Personal', 'slug' => 'personal', 'color' => '#10b981', 'icon' => 'user'],
            ['name' => 'Urgent', 'slug' => 'urgent', 'color' => '#ef4444', 'icon' => 'alert-triangle'],
            ['name' => 'Learning', 'slug' => 'learning', 'color' => '#8b5cf6', 'icon' => 'book-open'],
        ];

        $categoryModels = [];
        foreach ($categories as $catData) {
            $categoryModels[] = Category::firstOrCreate(
                ['team_id' => $team->id, 'slug' => $catData['slug']],
                array_merge($catData, ['team_id' => $team->id])
            );
        }

        // Seed Todos
        $todosData = [
            [
                'title' => 'Setup Laravel Horizon and Redis Queue',
                'description' => 'Configure queue connection and monitor throughput in Horizon dashboard.',
                'status' => 'in_progress',
                'priority' => 'high',
                'category_id' => $categoryModels[0]->id,
                'due_date' => now()->addDays(2),
            ],
            [
                'title' => 'Implement Spatie Data DTOs',
                'description' => 'Replace raw request inputs with strongly-typed Spatie Data objects for validation.',
                'status' => 'completed',
                'priority' => 'urgent',
                'category_id' => $categoryModels[0]->id,
                'due_date' => now()->subDay(),
                'completed_at' => now()->subHours(5),
            ],
            [
                'title' => 'Integrate Spatie Activity Log',
                'description' => 'Record user activities and changes made to Todo items for audit trailing.',
                'status' => 'pending',
                'priority' => 'medium',
                'category_id' => $categoryModels[3]->id,
                'due_date' => now()->addDays(5),
            ],
        ];

        foreach ($todosData as $tData) {
            $todo = Todo::create(array_merge($tData, [
                'team_id' => $team->id,
                'user_id' => $user->id,
                'assigned_to_id' => $user->id,
            ]));

            $todo->items()->createMany([
                ['title' => 'Sub-task 1: Verification', 'is_completed' => true, 'order' => 1],
                ['title' => 'Sub-task 2: Testing', 'is_completed' => false, 'order' => 2],
            ]);
        }
    }
}
