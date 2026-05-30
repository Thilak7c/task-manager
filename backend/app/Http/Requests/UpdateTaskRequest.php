<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'string', 'min:3', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'status'      => ['sometimes', 'in:pending,completed'],
            'priority'    => ['sometimes', 'in:low,medium,high'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.min'   => 'The title must be at least 3 characters.',
            'title.max'   => 'The title may not exceed 255 characters.',
            'status.in'   => 'Status must be either pending or completed.',
            'priority.in' => 'Priority must be low, medium, or high.',
        ];
    }
}
