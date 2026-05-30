'use client';

import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/TaskForm';
import { useCreateTask } from '@/hooks/useTasks';
import { CreateTaskInput } from '@/lib/api';

export default function CreateTaskPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateTask();

  async function handleSubmit(data: CreateTaskInput) {
    await mutateAsync(data);
    router.push('/tasks');
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/tasks" className="text-sm text-indigo-600 hover:underline">
          ← Back to Tasks
        </a>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Create New Task</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <TaskForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </div>
    </div>
  );
}
