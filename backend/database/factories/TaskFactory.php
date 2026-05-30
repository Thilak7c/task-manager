<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title'       => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'status'      => $this->faker->randomElement(['pending', 'completed']),
            'priority'    => $this->faker->randomElement(['low', 'medium', 'high']),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed']);
    }

    public function highPriority(): static
    {
        return $this->state(['priority' => 'high']);
    }
}
