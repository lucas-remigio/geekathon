<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class PdfFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'file_name' => time().'teste.pdf',
            'file_path' => 'upload/teste.pdf',
            'chapter_id' => function () {
                return \App\Models\Chapter::inRandomOrder()->first()->id;
            },
        ];
    }
}
