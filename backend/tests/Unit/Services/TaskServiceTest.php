<?php

namespace Tests\Unit\Services;

use App\Models\Task;
use App\Repositories\Contracts\TaskRepositoryInterface;
use App\Services\TaskService;
use Illuminate\Validation\ValidationException;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

class TaskServiceTest extends TestCase
{
    private TaskService $service;
    private MockInterface $repository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->repository = Mockery::mock(TaskRepositoryInterface::class);
        $this->service    = new TaskService($this->repository);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_create_task_succeeds_when_no_duplicate(): void
    {
        $data = [
            'title'    => 'My Task',
            'priority' => 'high',
            'status'   => 'pending',
        ];

        $task = new Task($data);
        $task->id = 1;

        $this->repository
            ->shouldReceive('existsWithTitleInLastSeconds')
            ->once()
            ->with('My Task', 10)
            ->andReturn(false);

        $this->repository
            ->shouldReceive('create')
            ->once()
            ->with($data)
            ->andReturn($task);

        $result = $this->service->createTask($data);

        $this->assertInstanceOf(Task::class, $result);
        $this->assertEquals('My Task', $result->title);
    }

    public function test_create_task_throws_on_duplicate_within_10_seconds(): void
    {
        $this->expectException(ValidationException::class);

        $this->repository
            ->shouldReceive('existsWithTitleInLastSeconds')
            ->once()
            ->with('Duplicate Task', 10)
            ->andReturn(true);

        $this->service->createTask(['title' => 'Duplicate Task']);
    }

    public function test_delete_task_aborts_when_not_found(): void
    {
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);

        $this->repository
            ->shouldReceive('findById')
            ->once()
            ->with(999)
            ->andReturn(null);

        $this->service->deleteTask(999);
    }

    public function test_update_task_aborts_when_not_found(): void
    {
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);

        $this->repository
            ->shouldReceive('findById')
            ->once()
            ->with(42)
            ->andReturn(null);

        $this->service->updateTask(42, ['status' => 'completed']);
    }

    public function test_update_task_succeeds(): void
    {
        $task = new Task(['title' => 'Old Title', 'status' => 'pending']);
        $task->id = 1;

        $updated = new Task(['title' => 'Old Title', 'status' => 'completed']);
        $updated->id = 1;

        $this->repository
            ->shouldReceive('findById')
            ->once()
            ->with(1)
            ->andReturn($task);

        $this->repository
            ->shouldReceive('update')
            ->once()
            ->with($task, ['status' => 'completed'])
            ->andReturn($updated);

        $result = $this->service->updateTask(1, ['status' => 'completed']);

        $this->assertEquals('completed', $result->status);
    }
}
