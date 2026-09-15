<?php

namespace App\Data;

use App\Models\Category;
use Spatie\LaravelData\Attributes\Validation\Max;
use Spatie\LaravelData\Attributes\Validation\Required;
use Spatie\LaravelData\Data;

class CategoryData extends Data
{
    public function __construct(
        public ?int $id,
        #[Required, Max(100)]
        public string $name,
        public ?string $slug,
        #[Required]
        public string $color,
        public ?string $icon,
    ) {}

    public static function fromModel(Category $category): self
    {
        return new self(
            id: $category->id,
            name: $category->name,
            slug: $category->slug,
            color: $category->color,
            icon: $category->icon,
        );
    }
}
