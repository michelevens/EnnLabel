<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Annotation extends Model
{
    use HasUuids;

    protected $fillable = [
        'task_id',
        'data_record_id',
        'label_id',
        'annotator_id',
        'start_offset',
        'end_offset',
        'selected_text',
        'metadata',
        'is_current',
    ];

    protected function casts(): array
    {
        return [
            'start_offset' => 'integer',
            'end_offset' => 'integer',
            'metadata' => 'array',
            'is_current' => 'boolean',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function dataRecord(): BelongsTo
    {
        return $this->belongsTo(DataRecord::class);
    }

    public function label(): BelongsTo
    {
        return $this->belongsTo(Label::class);
    }

    public function annotator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'annotator_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(AnnotationVersion::class)->orderByDesc('version_number');
    }
}
