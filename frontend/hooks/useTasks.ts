// hooks/useTasks.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { tasksApi, TaskFilters, CreateTaskInput, UpdateTaskInput } from '@/lib/api';
import { toast } from 'sonner';

export const TASKS_KEY = 'tasks';

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: [TASKS_KEY, filters],
    queryFn: () => tasksApi.list(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => tasksApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success('Task created successfully!');
    },
    onError: (error: any) => {
      const message =
        error?.errors?.title?.[0] || error?.message || 'Failed to create task.';
      toast.error(message);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTaskInput }) =>
      tasksApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success('Task updated!');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update task.');
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
      toast.success('Task deleted.');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete task.');
    },
  });
}
