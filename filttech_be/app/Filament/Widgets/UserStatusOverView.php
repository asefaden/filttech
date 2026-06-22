<?php

namespace App\Filament\Widgets;

use App\Models\Category;
use App\Models\Book;
use App\Models\Course;
use App\Models\Post;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class UserStatusOverView extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        return [
            // total users
            Stat::make('Total Users', User::count())
                ->color('primary')
                ->icon('heroicon-o-user-group') // user-plus
                ->description('All registered users in the system'),
            // experts
            Stat::make('All Experts', User::whereHas('roles', function ($query) {
                    $query->where('name', 'Expert');
                })->count())
                ->color('success')
                ->icon('heroicon-s-academic-cap') // academic-cap
                ->description('Total number of experts'),
            // admins
            Stat::make('All Admins', User::whereHas('roles', function ($query) {
                    $query->where('name', 'Admin');
                })->count())
                ->color('warning')
                ->icon('heroicon-s-shield-check') // shield-check
                ->description('Total number of admins'),
            // users
            Stat::make('Active Users', User::whereHas('roles', function ($query) {
                    $query->where('name', 'User');
                })->where('status', 1)->count())
                ->color('info')
                ->icon('heroicon-o-user-group') // user-check
                ->description('Total number of active users'),
        ];
    }
}
