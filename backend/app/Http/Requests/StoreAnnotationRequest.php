<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnnotationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'task_id' => 'required|uuid|exists:tasks,id',
            'label_id' => 'required|uuid|exists:labels,id',
            'start_offset' => 'required|integer|min:0',
            'end_offset' => 'required|integer|gt:start_offset',
            'selected_text' => 'required|string|max:10000',
            'metadata' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'end_offset.gt' => 'End offset must be greater than start offset.',
            'selected_text.max' => 'Selected text cannot exceed 10,000 characters.',
        ];
    }
}
