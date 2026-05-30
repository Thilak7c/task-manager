<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        Task::factory()->count(20)->create();
        Task::factory()->count(5)->pending()->highPriority()->create();
        Task::factory()->count(5)->completed()->create();
    }
}
