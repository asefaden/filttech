<?php

namespace App\Filament\Widgets;

use App\Models\Book;
use App\Models\Category;
use App\Models\Course;
use App\Models\Post;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ContentStatusOverView extends StatsOverviewWidget
{
    protected static ?int $sort = 4;

    protected function getStats(): array
    {
        return [
            // total books
            Stat::make('Total Books', Book::count())
                ->color('primary')
                ->icon('heroicon-o-book-open') // book-open
                ->description('Total number of books in the system'),
            // total categories
            Stat::make('Total Categories', Category::count())
                ->color('success')
                ->icon('heroicon-o-squares-2x2') // squares-2x2
                ->description('Total number of categories in the system'),
            // total courses
            Stat::make('Total Courses', Course::count())
                ->color('warning')
                ->icon('heroicon-o-academic-cap') // academic-cap
                ->description('Total number of courses in the system'),
            // posts
            Stat::make('Total Posts', Post::count())
                ->color('info')
                ->icon('heroicon-o-document-text') // document-text
                ->description('Total number of posts in the system'),
        ];
    }
}
