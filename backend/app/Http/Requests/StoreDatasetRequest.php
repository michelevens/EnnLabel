<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDatasetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'source' => 'nullable|string|max:255',
            'schema_type' => 'nullable|string|in:text,ner,classification',
            'file' => 'required|file|mimes:csv,json,txt|max:102400',
            'metadata' => 'nullable|array',
        ];
    }
}
