<?php

namespace App\Repositories;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;

class TaskRepository implements TaskRepositoryInterface
{
    public function __construct(private readonly Task $model) {}

    public function getAllPaginated(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->latest();

        if (!empty($filters['status'])) {
            $query->byStatus($filters['status']);
        }

        if (!empty($filters['priority'])) {
            $query->byPriority($filters['priority']);
        }

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?Task
    {
        return $this->model->find($id);
    }

    public function create(array $data): Task
    {
        return $this->model->create($data);
    }

    public function update(Task $task, array $data): Task
    {
        $task->update($data);
        return $task->fresh();
    }

    public function delete(Task $task): bool
    {
        return $task->delete();
    }

    public function existsWithTitleInLastSeconds(string $title, int $seconds = 10): bool
    {
        return $this->model
            ->where('title', $title)
            ->where('created_at', '>=', Carbon::now()->subSeconds($seconds))
            ->exists();
    }
}
