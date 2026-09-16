<?php

namespace App\Console\Commands;

use App\Models\Todo;
use App\Notifications\TodoReminderNotification;
use Illuminate\Console\Command;

class SendTodoReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'todos:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send scheduled in-app todo reminders for due tasks';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $todos = Todo::whereNotNull('reminder_at')
            ->where('reminder_sent', false)
            ->where('reminder_at', '<=', now())
            ->whereNull('completed_at')
            ->where('status', '!=', 'completed')
            ->where('status', '!=', 'archived')
            ->with(['user', 'assignee', 'team'])
            ->get();

        $count = 0;

        foreach ($todos as $todo) {
            $notifiedUserIds = [];

            // Notify assignee if present
            if ($todo->assignee) {
                $todo->assignee->notify(new TodoReminderNotification($todo));
                $notifiedUserIds[] = $todo->assignee->id;
            }

            // Notify creator if present and not already notified
            if ($todo->user && ! in_array($todo->user->id, $notifiedUserIds)) {
                $todo->user->notify(new TodoReminderNotification($todo));
            }

            $todo->update(['reminder_sent' => true]);
            $count++;
        }

        $this->info("Sent {$count} todo reminders successfully.");

        return Command::SUCCESS;
    }
}
