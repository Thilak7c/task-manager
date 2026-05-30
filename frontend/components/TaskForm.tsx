'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateTaskInput } from '@/lib/api';

const schema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters.')
    .max(255, 'Title must not exceed 255 characters.')
    .trim(),
  description: z
    .string()
    .max(5000, 'Description must not exceed 5000 characters.')
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'completed']).default('pending'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  isSubmitting: boolean;
  defaultValues?: Partial<FormData>;
}

export function TaskForm({ onSubmit, isSubmitting, defaultValues }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'medium',
      status: 'pending',
      ...defaultValues,
    },
  });

  async function handleFormSubmit(data: FormData) {
    try {
      await onSubmit(data);
    } catch (err: any) {
      // Map API validation errors back to fields
      if (err?.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          setError(field as keyof FormData, {
            message: (messages as string[])[0],
          });
        });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5" noValidate>
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          type="text"
          placeholder="Enter task title…"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Optional description…"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
            errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Priority & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            {...register('priority')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            {...register('status')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating…' : 'Create Task'}
        </button>
        <a
          href="/tasks"
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
