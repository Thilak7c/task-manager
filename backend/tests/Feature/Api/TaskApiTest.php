<?php

namespace Tests\Feature\Api;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_tasks(): void
    {
        Task::factory()->count(5)->create();

        $response = $this->getJson('/api/tasks');

        $response->assertOk()
                 ->assertJsonStructure([
                     'data' => [['id', 'title', 'status', 'priority', 'created_at']],
                     'meta' => ['current_page', 'total', 'per_page'],
                 ]);
    }

    public function test_can_filter_tasks_by_status(): void
    {
        Task::factory()->count(3)->pending()->create();
        Task::factory()->count(2)->completed()->create();

        $response = $this->getJson('/api/tasks?status=pending');

        $response->assertOk();

        $data = $response->json('data');
        $this->assertCount(3, $data);
        collect($data)->each(fn ($t) => $this->assertEquals('pending', $t['status']));
    }

    public function test_can_create_a_task(): void
    {
        $payload = [
            'title'       => 'New Task',
            'description' => 'Task description here.',
            'priority'    => 'high',
        ];

        $response = $this->postJson('/api/tasks', $payload);

        $response->assertCreated()
                 ->assertJsonPath('data.title', 'New Task')
                 ->assertJsonPath('data.priority', 'high')
                 ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('tasks', ['title' => 'New Task']);
    }

    public function test_create_task_requires_title(): void
    {
        $response = $this->postJson('/api/tasks', ['description' => 'No title']);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['title']);
    }

    public function test_prevents_duplicate_task_within_10_seconds(): void
    {
        Task::factory()->create(['title' => 'Dup Task']);

        $response = $this->postJson('/api/tasks', ['title' => 'Dup Task']);

        $response->assertUnprocessable()
                 ->assertJsonValidationErrors(['title']);
    }

    public function test_can_update_a_task(): void
    {
        $task = Task::factory()->pending()->create();

        $response = $this->putJson("/api/tasks/{$task->id}", ['status' => 'completed']);

        $response->assertOk()
                 ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'completed']);
    }

    public function test_can_delete_a_task(): void
    {
        $task = Task::factory()->create();

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertOk()->assertJsonPath('message', 'Task deleted successfully.');

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_returns_404_for_missing_task(): void
    {
        $this->getJson('/api/tasks/99999')->assertNotFound();
        $this->putJson('/api/tasks/99999', ['status' => 'completed'])->assertNotFound();
        $this->deleteJson('/api/tasks/99999')->assertNotFound();
    }
}
