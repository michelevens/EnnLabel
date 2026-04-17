<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DatasetVersion extends Model
{
    use HasUuids;

    protected $fillable = [
        'dataset_id',
        'version_number',
        'file_path',
        'file_type',
        'file_size',
        'checksum',
        'uploaded_by',
        'change_notes',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'version_number' => 'integer',
        ];
    }

    public function dataset(): BelongsTo
    {
        return $this->belongsTo(Dataset::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function records(): HasMany
    {
        return $this->hasMany(DataRecord::class);
    }
}
