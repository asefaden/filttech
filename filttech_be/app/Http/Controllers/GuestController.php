<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Course;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class GuestController extends Controller
{
    public function topCategories()
    {
        $categories = Category::withCount('courses')->orderBy('courses_count', 'desc')->take(5)->get();
        $categories = $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'courses_count' => $category->courses_count,
                'thumbnail' => $category->thumbnail,
            ];
        });
        return response()->json([
            'message' => 'Top Categories',
            'data' => $categories,
        ]);
    }

    public function popularCourses()
    {
        // Added withCount('sections') to eliminate the N+1 database performance overhead bottleneck
        $courses = Course::with('category')->withCount('sections')->orderBy('rating', 'desc')->take(6)->get();
        
        $courses = $courses->map(function ($course) {
            return [
                'id' => $course->id,
                'name' => $course->name,
                // Optional chaining fallback safeguard if a course is missing its category assignment
                'category' => $course->category?->name ?? 'Uncategorized',
                'description' => $course->description,
                'likes' => $course->likes,
                'rating' => $course->rating,
                'review' => $course->review,
                'thumbnail' => $course->thumbnail,
                // Uses the eager-loaded count directly from the query attributes index
                'section_count' => $course->sections_count,
            ];
        });
        return response()->json([
            'message' => 'Popular Courses',
            'data' => $courses,
        ]);
    }

    public function popularExperts()
    {
        // 1. Defensively verify if the target Role name map is active for your API guard context
        $roleExists = Role::where('name', 'Expert')
                          ->where('guard_name', 'api')
                          ->exists();

        if ($roleExists) {
            $experts = User::role('Expert')->orderBy('rating', 'desc')->take(6)->get();
        } else {
            // 2. Clear out application crash states by falling back to an empty collection frame structure
            $experts = collect([]);
        }

        $formattedExperts = $experts->map(function ($expert) {
            return [
                'id' => $expert->id,
                'name' => $expert->name,
                'rating' => $expert->rating,
                'profile_image' => $expert->profile_image,
            ];
        });

        return response()->json([
            'message' => 'Popular Experts',
            'data' => $formattedExperts,
        ]);
    }

    public function guestPosts(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string',
        ]);

        $postsQuery = Post::when($request->has('search'), function ($query) use ($request) {
            $query->where('title', 'like', "%{$request->search}%");
        });

        // Order: featured first, then latest
        $posts = $postsQuery
            ->orderByDesc('is_featured')
            ->latest()
            ->limit(6)
            ->get();

        $formattedPosts = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'thumbnail' => $post->thumbnail,
                'is_featured' => $post->is_featured,
            ];
        });

        return response()->json([
            'message' => 'Posts',
            'data' => $formattedPosts,
        ]);
    }
}