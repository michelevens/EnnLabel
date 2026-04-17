<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DataRecord extends Model
{
    use HasUuids;

    protected $fillable = [
        'dataset_id',
        'dataset_version_id',
        'content',
        'metadata',
        'sequence_index',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'sequence_index' => 'integer',
        ];
    }

    public function dataset(): BelongsTo
    {
        return $this->belongsTo(Dataset::class);
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(DatasetVersion::class, 'dataset_version_id');
    }

    public function annotations(): HasMany
    {
        return $this->hasMany(Annotation::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
