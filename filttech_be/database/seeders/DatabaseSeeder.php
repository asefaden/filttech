<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        // ሮሎቹ በዳታቤዙ ውስጥ ከሌሉ በራሱ ይፈጥራቸዋል
        Role::firstOrCreate(['name' => 'Expert', 'guard_name' => 'api']);
        
        // ሌሎች ሮሎች ካሉህም እዚህ ጋር firstOrCreate በመጠቀም መቀጠል ትችላለህ
        Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'api']);

        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            CourseSeeder::class,
            SectionSeeder::class,
        ]);
    }
}
