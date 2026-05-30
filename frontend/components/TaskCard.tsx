'use client';

import { Task } from '@/lib/api';

const priorityStyles = {
  high:   'bg-red-100 text-red-700 border border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  low:    'bg-green-100 text-green-700 border border-green-200',
};

interface Props {
  task: Task;
  onToggleStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function TaskCard({ task, onToggleStatus, onDelete, isUpdating, isDeleting }: Props) {
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-4 transition-opacity ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggleStatus(task.id, task.status)}
        disabled={isUpdating}
        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-indigo-600 border-indigo-600'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
      >
        {isCompleted && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={`font-medium text-gray-900 ${isCompleted ? 'line-through text-gray-400' : ''}`}
          >
            {task.title}
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>
          {isCompleted && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
              completed
            </span>
          )}
        </div>
        {task.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {new Date(task.created_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(task.id)}
        disabled={isDeleting}
        className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label="Delete task"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
