<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = [
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'username' => 'admin',
            'phone_number' => '251911111111',
            'password' => Hash::make('password'),
            'status' => 1,
        ];
        $admin = User::create($admin);
        $admin->assignRole('Admin');

        $expert = [
            'name' => 'Instructor',
            'email' => 'instructor@example.com',
            'username' => 'instructor',
            'phone_number' => '251911111112',
            'password' => Hash::make('password'),
            'status' => 1,
        ];
        $expert = User::create($expert);
        $expert->assignRole('Expert');

        $users = [
            [
                'name' => 'User',
                'email' => 'user@example.com',
                'username' => 'user',
                'phone_number' => '251911111113',
                'password' => Hash::make('password'),
                'status' => 1,
            ],

            [
                'name' => 'User 2',
                'email' => 'user2@example.com',
                'username' => 'user2',
                'phone_number' => '251911111114',
                'password' => Hash::make('password'),
                'status' => 1,
            ],

            [
                'name' => 'User 3',
                'email' => 'user3@example.com',
                'username' => 'user3',
                'phone_number' => '251911111115',
                'password' => Hash::make('password'),
                'status' => 1,
            ]
        ];
        foreach($users as $user) {
            $user = User::create($user);
            $user->assignRole('User');
        }

    }
}
