<?php

namespace App\Providers;

use App\Models\Book;
use App\Models\Course;
use App\Models\Post;
use App\Models\Section;
use App\Observers\BookObserver;
use App\Observers\CourseObserver;
use App\Observers\PostObserver;
use App\Observers\SectionObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Book::observe(BookObserver::class);
        Post::observe(PostObserver::class);
        Course::observe(CourseObserver::class);
        // Section::observe(SectionObserver::class);
    }
}
