<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\HasActivity;
use Spatie\Activitylog\Support\LogOptions;

class Category extends Model
{
    use HasActivity, HasFactory;

    protected $fillable = [
        'team_id',
        'name',
        'slug',
        'color',
        'icon',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'color', 'icon'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }
}
