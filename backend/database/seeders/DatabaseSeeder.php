<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Pdf;
use App\Models\Subject;
use App\Models\Chapter;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Fernando Laravel',
            'email' => 'flav@pt.pt',
            'role' => 'S'
        ]);
        User::factory()->create([
            'name' => 'Margarida Fofinha',
            'email' => 'magfofa@pt.pt',
            'role' => 'T'
        ]);
        Subject::factory()->create([
            'name' => 'Introduction to Artificial Intelligence',
        ]);
        Subject::factory()->create([
            'name' => 'Data Structures and Algorithms',
        ]);
        Subject::factory()->create([
            'name' => 'Software Engineering Principles',
        ]);
        Subject::factory()->create([
            'name' => 'Internet of Things (IoT)',
        ]);
        Chapter::factory()->create([
            'name' => 'Chapter 1 - Definition and History of AI',
            'subject_id' => 1,
        ]);
        Chapter::factory()->create([
            'name' => 'Chapter 2 - Applications of AI',
            'subject_id' => 1,
        ]);
        Chapter::factory()->create([
            'name' => 'Chapter 3 - The Turing Test and AI Intelligence',
            'subject_id' => 1,
        ]);
        Pdf::factory()->create([
            'chapter_id' => 1
        ]);
    }
}
