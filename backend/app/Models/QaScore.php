<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QaScore extends Model
{
    use HasUuids;

    protected $fillable = [
        'task_id',
        'annotator_a',
        'annotator_b',
        'agreement_score',
        'conflict_details',
        'flagged',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'agreement_score' => 'float',
            'conflict_details' => 'array',
            'flagged' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function annotatorA(): BelongsTo
    {
        return $this->belongsTo(User::class, 'annotator_a');
    }

    public function annotatorB(): BelongsTo
    {
        return $this->belongsTo(User::class, 'annotator_b');
    }

    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
