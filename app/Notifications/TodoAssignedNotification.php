<?php

namespace App\Notifications;

use App\Models\Todo;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TodoAssignedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Todo $todo,
        public User $assigner
    ) {}

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
            'type' => 'todo_assigned',
            'title' => 'Tugas Ditugaskan',
            'message' => "{$this->assigner->name} menugaskan tugas \"{$this->todo->title}\" kepada Anda.",
            'todo_id' => $this->todo->id,
            'todo_title' => $this->todo->title,
            'assigner_name' => $this->assigner->name,
            'action_url' => route('todos.show', ['current_team' => $teamSlug, 'todo' => $this->todo->id]),
        ];
    }
}
