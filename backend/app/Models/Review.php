<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasUuids;

    protected $fillable = [
        'task_id',
        'reviewer_id',
        'decision',
        'comments',
        'annotation_edits',
    ];

    protected function casts(): array
    {
        return [
            'annotation_edits' => 'array',
        ];
    }

    public const APPROVED = 'approved';
    public const REJECTED = 'rejected';
    public const NEEDS_REVISION = 'needs_revision';

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }
}
