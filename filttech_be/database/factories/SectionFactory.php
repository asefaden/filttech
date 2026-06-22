<?php

namespace Database\Factories;

use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Section>
 */
class SectionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Section::class;
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'introduction' => fake()->paragraph(),
            'description' => fake()->paragraph(),
            'example' => fake()->paragraph(),
            'example_explanation' => fake()->paragraph(),
        ];
    }
}
