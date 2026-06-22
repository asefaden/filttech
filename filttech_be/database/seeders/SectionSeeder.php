<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Section;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // cretae 5 sections for each course
        $courses = Course::all();
        foreach ($courses as $course) {
            Section::factory()->count(5)->create([
                'course_id' => $course->id,
            ]);
        }
    }
}
