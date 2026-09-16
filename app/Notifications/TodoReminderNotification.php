<?php

namespace App\Notifications;

use App\Models\Todo;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TodoReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public Todo $todo) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $teamSlug = $this->todo->team->slug ?? 'default';

        return [
            'type' => 'todo_reminder',
            'title' => 'Pengingat Tugas',
            'message' => "Tugas \"{$this->todo->title}\" akan mendekati tenggat waktu ({$this->todo->due_date?->format('d M Y, H:i')}).",
            'todo_id' => $this->todo->id,
            'todo_title' => $this->todo->title,
            'due_date' => $this->todo->due_date?->toIso8601String(),
            'action_url' => route('todos.show', ['current_team' => $teamSlug, 'todo' => $this->todo->id]),
        ];
    }
}
