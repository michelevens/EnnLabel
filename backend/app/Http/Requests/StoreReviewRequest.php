<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'task_id' => 'required|uuid|exists:tasks,id',
            'decision' => 'required|string|in:approved,rejected,needs_revision',
            'comments' => 'nullable|string|max:5000',
            'annotation_edits' => 'nullable|array',
        ];
    }
}
