<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Pdf;
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
        Pdf::factory()->create();
    }
}
