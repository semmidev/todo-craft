<?php

namespace App\Data;

use App\Models\TodoItem;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class TodoItemData extends Data
{
    public function __construct(
        public ?int $id,
        #[Required, Max(255)]
        public string $title,
        public bool $is_completed = false,
        public int $order = 0,
    ) {}

    public static function fromModel(TodoItem $item): self
    {
        return new self(
            id: $item->id,
            title: $item->title,
            is_completed: $item->is_completed,
            order: $item->order,
        );
    }
}
