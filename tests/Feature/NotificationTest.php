<?php

use App\Models\Team;
use App\Models\Todo;
use App\Models\User;
use App\Notifications\TodoReminderNotification;

function createTestTodo(User $user, ?Team $team = null): Todo
{
    $team = $team ?? Team::factory()->create();

    return Todo::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'title' => 'Test Todo Title',
        'status' => 'pending',
        'priority' => 'medium',
    ]);
}

test('user can fetch notifications and dropdown unread count', function () {
    $user = User::factory()->create();
    $todo = createTestTodo($user);

    $user->notify(new TodoReminderNotification($todo));

    $response = $this->actingAs($user)->get(route('notifications.dropdown'));

    $response->assertOk()
        ->assertJsonStructure(['unread_count', 'notifications'])
        ->assertJson(['unread_count' => 1]);
});

test('user can mark notification as read', function () {
    $user = User::factory()->create();
    $todo = createTestTodo($user);

    $user->notify(new TodoReminderNotification($todo));

    $notification = $user->unreadNotifications()->first();

    $response = $this->actingAs($user)
        ->patch(route('notifications.mark-read', ['id' => $notification->id]));

    $response->assertRedirect();
    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});

test('user can mark all notifications as read', function () {
    $user = User::factory()->create();
    $todo = createTestTodo($user);

    $user->notify(new TodoReminderNotification($todo));
    $user->notify(new TodoReminderNotification($todo));

    expect($user->unreadNotifications()->count())->toBe(2);

    $response = $this->actingAs($user)
        ->post(route('notifications.mark-all-read'));

    $response->assertRedirect();
    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});

test('inviting a registered user sends in-app team invitation notification', function () {
    $inviter = User::factory()->create();
    $recipient = User::factory()->create(['email' => 'invitee@example.com']);
    $team = Team::factory()->create();
    $team->members()->attach($inviter, ['role' => 'owner']);

    $this->actingAs($inviter)->post(route('teams.invitations.store', ['team' => $team->slug]), [
        'email' => 'invitee@example.com',
        'role' => 'member',
    ]);

    expect($recipient->unreadNotifications()->count())->toBe(1);
    $notification = $recipient->unreadNotifications()->first();
    expect($notification->data['type'])->toBe('team_invitation');
});

test('assigning todo to team member sends in-app notification', function () {
    $creator = User::factory()->create();
    $assignee = User::factory()->create();
    $team = Team::factory()->create();
    $team->members()->attach($creator, ['role' => 'owner']);
    $team->members()->attach($assignee, ['role' => 'member']);

    $response = $this->actingAs($creator)->post(route('todos.store', ['current_team' => $team->slug]), [
        'title' => 'Tugas Baru untuk Kamu',
        'status' => 'pending',
        'priority' => 'high',
        'assigned_to_id' => $assignee->id,
    ]);

    $response->assertRedirect();
    expect($assignee->unreadNotifications()->count())->toBe(1);
    $notification = $assignee->unreadNotifications()->first();
    expect($notification->data['type'])->toBe('todo_assigned');
});

test('todos:send-reminders command triggers notifications for due tasks', function () {
    $user = User::factory()->create();
    $team = Team::factory()->create();

    // Create a todo with due date in 30 minutes, and reminder_offset 30 (reminder_at = now())
    $todo = Todo::create([
        'team_id' => $team->id,
        'user_id' => $user->id,
        'title' => 'Tugas Berpengingat',
        'status' => 'pending',
        'priority' => 'high',
        'due_date' => now()->addMinutes(30),
        'reminder_offset' => 30,
        'reminder_at' => now()->subMinute(),
        'reminder_sent' => false,
    ]);

    $this->artisan('todos:send-reminders')
        ->assertExitCode(0);

    expect($todo->fresh()->reminder_sent)->toBeTrue();
    expect($user->unreadNotifications()->count())->toBe(1);
    $notification = $user->unreadNotifications()->first();
    expect($notification->data['type'])->toBe('todo_reminder');
});
