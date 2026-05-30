<?php

namespace App\Services;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class TaskService
{
    public function __construct(
        private readonly TaskRepositoryInterface $taskRepository
    ) {}

    public function listTasks(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->taskRepository->getAllPaginated($filters, $perPage);
    }

    public function createTask(array $data): Task
    {
        // Edge case: prevent duplicate task titles within 10 seconds
        if ($this->taskRepository->existsWithTitleInLastSeconds($data['title'], 10)) {
            throw ValidationException::withMessages([
                'title' => ['A task with this title was already created in the last 10 seconds. Please wait before creating a duplicate.'],
            ]);
        }

        return $this->taskRepository->create($data);
    }

    public function updateTask(int $id, array $data): Task
    {
        $task = $this->taskRepository->findById($id);

        if (!$task) {
            abort(404, 'Task not found.');
        }

        return $this->taskRepository->update($task, $data);
    }

    public function deleteTask(int $id): void
    {
        $task = $this->taskRepository->findById($id);

        if (!$task) {
            abort(404, 'Task not found.');
        }

        $this->taskRepository->delete($task);
    }

    public function getTask(int $id): Task
    {
        $task = $this->taskRepository->findById($id);

        if (!$task) {
            abort(404, 'Task not found.');
        }

        return $task;
    }
}
