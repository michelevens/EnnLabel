<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnnotationVersion extends Model
{
    use HasUuids;

    protected $fillable = [
        'annotation_id',
        'version_number',
        'label_id',
        'start_offset',
        'end_offset',
        'selected_text',
        'changed_by',
        'change_reason',
        'previous_state',
    ];

    protected function casts(): array
    {
        return [
            'start_offset' => 'integer',
            'end_offset' => 'integer',
            'previous_state' => 'array',
            'version_number' => 'integer',
        ];
    }

    public function annotation(): BelongsTo
    {
        return $this->belongsTo(Annotation::class);
    }

    public function label(): BelongsTo
    {
        return $this->belongsTo(Label::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
