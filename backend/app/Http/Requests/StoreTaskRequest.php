<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status'      => ['nullable', 'in:pending,completed'],
            'priority'    => ['nullable', 'in:low,medium,high'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'A task title is required.',
            'title.min'      => 'The title must be at least 3 characters.',
            'title.max'      => 'The title may not exceed 255 characters.',
            'status.in'      => 'Status must be either pending or completed.',
            'priority.in'    => 'Priority must be low, medium, or high.',
        ];
    }
}
