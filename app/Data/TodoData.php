<?php

namespace App\Data;

use App\Models\Todo;
use App\Models\TodoItem;
use Spatie\LaravelData\Attributes\Validation\In;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class TodoData extends Data
{
    public function __construct(
        public ?int $id,
        #[Required, Max(255)]
        public string $title,
        public ?string $description = null,
        #[Required, In(['pending', 'in_progress', 'completed', 'archived'])]
        public string $status = 'pending',
        #[Required, In(['low', 'medium', 'high', 'urgent'])]
        public string $priority = 'medium',
        public ?int $category_id = null,
        public ?int $assigned_to_id = null,
        public ?string $due_date = null,
        public ?string $completed_at = null,
        public ?CategoryData $category = null,
        public ?array $creator = null,
        public ?array $assignee = null,
        public mixed $items = null,
        public ?array $attachments = null,
        public ?array $activities = null,
        public ?string $created_at = null,
        public ?string $updated_at = null,
    ) {}

    public static function fromModel(Todo $todo): self
    {
        $attachments = $todo->relationLoaded('media') ? $todo->getMedia('attachments')->map(function ($media) {
            return [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'mime_type' => $media->mime_type,
                'size' => $media->size,
                'original_url' => $media->getUrl(),
                'thumb_url' => $media->hasGeneratedConversion('thumb') ? $media->getUrl('thumb') : $media->getUrl(),
            ];
        })->toArray() : [];

        $activities = $todo->relationLoaded('activities') ? $todo->activities->map(function ($activity) {
            return [
                'id' => $activity->id,
                'description' => $activity->description,
                'event' => $activity->event,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                ] : null,
                'properties' => $activity->properties,
                'created_at' => $activity->created_at?->diffForHumans(),
            ];
        })->toArray() : [];

        return new self(
            id: $todo->id,
            title: $todo->title,
            description: $todo->description,
            status: $todo->status,
            priority: $todo->priority,
            category_id: $todo->category_id,
            assigned_to_id: $todo->assigned_to_id,
            due_date: $todo->due_date?->setTimezone('UTC')->toIso8601String(),
            completed_at: $todo->completed_at?->setTimezone('UTC')->toIso8601String(),
            category: $todo->category ? CategoryData::fromModel($todo->category) : null,
            creator: $todo->user ? [
                'id' => $todo->user->id,
                'name' => $todo->user->name,
                'email' => $todo->user->email,
            ] : null,
            assignee: $todo->assignee ? [
                'id' => $todo->assignee->id,
                'name' => $todo->assignee->name,
                'email' => $todo->assignee->email,
            ] : null,
            items: $todo->relationLoaded('items') ? $todo->items->map(fn (TodoItem $item) => TodoItemData::fromModel($item))->toArray() : null,
            attachments: $attachments,
            activities: $activities,
            created_at: $todo->created_at?->diffForHumans(),
            updated_at: $todo->updated_at?->diffForHumans(),
        );
    }
}
