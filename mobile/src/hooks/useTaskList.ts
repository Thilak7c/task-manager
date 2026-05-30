// src/hooks/useTaskList.ts
import { useState, useEffect, useCallback } from 'react';
import { tasksApi, Task, TaskFilters, PaginatedResponse } from '../api/tasks';

interface UseTaskListState {
  tasks: Task[];
  meta: PaginatedResponse<Task>['meta'] | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isOffline: boolean;
  error: string | null;
}

export function useTaskList(filters: TaskFilters = {}) {
  const [state, setState] = useState<UseTaskListState>({
    tasks: [],
    meta: null,
    isLoading: true,
    isRefreshing: false,
    isOffline: false,
    error: null,
  });

  const fetchTasks = useCallback(
    async (isRefresh = false) => {
      setState((prev) => ({
        ...prev,
        isLoading: !isRefresh,
        isRefreshing: isRefresh,
        error: null,
      }));

      try {
        const res = await tasksApi.list(filters);
        setState((prev) => ({
          ...prev,
          tasks: res.data,
          meta: res.meta,
          isLoading: false,
          isRefreshing: false,
          isOffline: false,
        }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          isOffline: !!(err?.name === 'AbortError' || err?.message?.includes('Network')),
          error: err?.message || 'Failed to fetch tasks.',
        }));
      }
    },
    [JSON.stringify(filters)]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const refresh = () => fetchTasks(true);

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    // Optimistic update
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === task.id ? { ...t, status: newStatus } : t
      ),
    }));

    try {
      await tasksApi.update(task.id, { status: newStatus });
    } catch {
      // Revert on failure
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === task.id ? { ...t, status: task.status } : t
        ),
      }));
    }
  };

  const deleteTask = async (id: number) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));

    try {
      await tasksApi.delete(id);
    } catch {
      // Re-fetch on failure to restore
      fetchTasks();
    }
  };

  return { ...state, refresh, toggleTaskStatus, deleteTask };
}
