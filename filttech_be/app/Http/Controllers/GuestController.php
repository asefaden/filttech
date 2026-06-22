<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Course;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;

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
        $courses = Course::with('category')->orderBy('rating', 'desc')->take(6)->get();
        $courses = $courses->map(function ($course) {
            return [
                'id' => $course->id,
                'name' => $course->name,
                'category' => $course->category->name,
                'description' => $course->description,
                'likes' => $course->likes,
                'rating' => $course->rating,
                'review' => $course->review,
                'thumbnail' => $course->thumbnail,
                'section_count' => $course->sections->count(),
            ];
        });
        return response()->json([
            'message' => 'Popular Courses',
            'data' => $courses,
        ]);
    }

    public function popularExperts()
    {
        // get users with role expert and highest number of rating
        $experts = User::role('Expert')->orderBy('rating', 'desc')->take(6)->get();
        $experts = $experts->map(function ($expert) {
            return [
                'id' => $expert->id,
                'name' => $expert->name,
                'rating' => $expert->rating,
                'profile_image' => $expert->profile_image,
            ];
        });
        return response()->json([
            'message' => 'Popular Experts',
            'data' => $experts,
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
