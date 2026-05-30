'use client';

import { useState } from 'react';
import { useTasks, useDeleteTask, useUpdateTask } from '@/hooks/useTasks';
import { TaskFilters } from '@/lib/api';
import { TaskCard } from '@/components/TaskCard';
import { TaskFiltersBar } from '@/components/TaskFiltersBar';
import { Pagination } from '@/components/Pagination';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>({ page: 1, per_page: 10 });

  const { data, isLoading, isError, error } = useTasks(filters);
  const deleteMutation = useDeleteTask();
  const updateMutation = useUpdateTask();

  function handleFilterChange(newFilters: Partial<TaskFilters>) {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }

  function handlePageChange(page: number) {
    setFilters((prev) => ({ ...prev, page }));
  }

  function handleToggleStatus(id: number, currentStatus: string) {
    updateMutation.mutate({
      id,
      input: { status: currentStatus === 'pending' ? 'completed' : 'pending' },
    });
  }

  function handleDelete(id: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
        {data && (
          <span className="text-sm text-gray-500">
            {data.meta.total} task{data.meta.total !== 1 ? 's' : ''} total
          </span>
        )}
      </div>

      <TaskFiltersBar filters={filters} onChange={handleFilterChange} />

      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      )}

      {isError && (
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          <p className="font-medium">Failed to load tasks</p>
          <p className="text-sm mt-1">{(error as any)?.message || 'Unknown error'}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {data?.data.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-gray-400 text-lg">No tasks found.</p>
              <a
                href="/tasks/create"
                className="mt-3 inline-block text-indigo-600 hover:underline text-sm"
              >
                Create your first task →
              </a>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {data?.data.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  isUpdating={updateMutation.isPending}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}

          {data && data.meta.last_page > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={data.meta.current_page}
                lastPage={data.meta.last_page}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
