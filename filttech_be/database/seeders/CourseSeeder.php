<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // create 5 courses for each category
        $categories = Category::all();
        foreach ($categories as $category) {
            Course::factory()->count(5)->create([
                'category_id' => $category->id,
            ]);
        }
    }
}
