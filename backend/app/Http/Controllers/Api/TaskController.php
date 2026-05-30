<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TaskController extends Controller
{
    public function __construct(private readonly TaskService $taskService) {}

    /**
     * GET /api/tasks
     * List all tasks with optional filters & pagination.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['status', 'priority', 'search']);
        $perPage = (int) $request->get('per_page', 15);
        $perPage = min(max($perPage, 5), 100); // clamp between 5–100

        $tasks = $this->taskService->listTasks($filters, $perPage);

        return TaskResource::collection($tasks);
    }

    /**
     * POST /api/tasks
     * Create a new task.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());

        return (new TaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/tasks/{id}
     * Show a single task.
     */
    public function show(int $id): TaskResource
    {
        $task = $this->taskService->getTask($id);
        return new TaskResource($task);
    }

    /**
     * PUT /api/tasks/{id}
     * Update an existing task.
     */
    public function update(UpdateTaskRequest $request, int $id): TaskResource
    {
        $task = $this->taskService->updateTask($id, $request->validated());
        return new TaskResource($task);
    }

    /**
     * DELETE /api/tasks/{id}
     * Delete a task.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->taskService->deleteTask($id);

        return response()->json(['message' => 'Task deleted successfully.']);
    }
}
