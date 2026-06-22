<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    /**
     * Get popular courses
     */

    public function popularCourses()
    {
        $courses = Course::with('category')->orderBy('rating', 'desc')->take(6)->get();
        $courses = $courses->map(function ($course) {
            return [
                'id' => $course->id,
                'name' => $course->name,
                'category' => $course->category->name,
                'description' => $course->description,
                'rating' => $course->rating,
                'thumbnail' => $course->thumbnail,
                'section_count' => $course->sections->count(),
                'is_favorite' => $course->is_favorite,
            ];
        });
        return response()->json([
            'message' => 'Popular Courses',
            'data' => $courses,
        ]);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->filled('favorite')) {
            $request->merge(['favorite' => filter_var($request->favorite, FILTER_VALIDATE_BOOLEAN)]);
        }
        if ($request->filled('rating')) {
            $request->merge(['rating' => filter_var($request->rating, FILTER_VALIDATE_BOOLEAN)]);
        }
        if ($request->filled('latest')) {
            $request->merge(['latest' => filter_var($request->latest, FILTER_VALIDATE_BOOLEAN)]);
        }
        $request->validate([
            'per_page' => 'nullable|integer',
            'search' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'favorite' => 'nullable|boolean',
            'rating' => 'nullable|boolean',
            'latest' => 'nullable|boolean',
        ]);

        $courses = Course::when($request->has('search'), function ($query) use ($request) {
            $query->where('name', 'like', "%{$request->search}%");
        })
            ->when($request->has('category_id'), function ($query) use ($request) {
                $query->where('category_id', $request->category_id);
            })
            ->when($request->has('favorite'), function ($query) use ($request) {
                $query->whereHas('intractions', function ($query) {
                    $query->where('user_id', Auth::id())->where('is_favorite', true);
                });
            })
            ->when($request->has('rating'), function ($query) {
                $query->orderBy('rating', 'desc');
            })
            ->when($request->has('latest'), function ($query) {
                $query->latest();
            })
            ->paginate($request->per_page ?? 10)
            ->through(function ($course) {
                return [
                    'id' => $course->id,
                    'name' => $course->name,
                    'category' => $course->category->name,
                    'description' => $course->description,
                    'rating' => $course->rating,
                    'thumbnail' => $course->thumbnail,
                    'section_count' => $course->sections->count(),
                    'is_favorite' => $course->is_favorite,
                ];
            });

        return response()->json([
            'message' => 'Courses',
            'data' => $courses->items(),
            'pagination' => [
                'total' => $courses->total(),
                'per_page' => $courses->perPage(),
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'from' => $courses->firstItem(),
                'to' => $courses->lastItem(),
            ],
        ]);

        return response()->json([
            'message' => 'Courses',
            'data' => $courses,
            'pagination' => [
                'total' => $courses->total(),
                'per_page' => $courses->perPage(),
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'from' => $courses->firstItem(),
                'to' => $courses->lastItem(),
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
        ]);

        $course = Course::create($validated);

        if ($request->hasFile('thumbnail')) {
            $course->addMedia($request->file('thumbnail'))->toMediaCollection('thumbnail');
        }

        return response()->json($course, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {

        $course = Course::with('sections')->find($course->id);
        $formattedCourse = [
            'id' => $course->id,
            'category' => $course->category->name,
            'name' => $course->name,
            'description' => $course->description,
            'rating' => $course->rating,
            'rating_count' => $course->intractions->count(),
            'thumbnail' => $course->thumbnail,
            'is_favorite' => $course->is_favorite,
            'is_rated' => $course->is_rated,
            'sections' => $course->sections->map(function ($section) {
                return [
                    'id' => $section->id,
                    'name' => $section->name,
                    'introduction' => $section->introduction,
                    'description' => $section->description,
                    'example' => $section->example,
                    'example_explanation' => $section->example_explanation,
                    'thumbnail' => $section->thumbnail,
                    'video' => $section->video,
                    'is_commented' => $section->is_commented,
                    'comment_count' => $section->intractions->count(),
                ];
            }),
        ];
        return response()->json([
            'message' => 'Course',
            'data' => $formattedCourse,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        if (!Auth::user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
        ]);

        $course->update($validated);

        if ($request->hasFile('thumbnail')) {
            $course->clearMediaCollection('thumbnail');
            $course->addMedia($request->file('thumbnail'))->toMediaCollection('thumbnail');
        }

        return response()->json($course);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        if (!Auth::user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $course->delete();

        return response()->json(['message' => 'Course deleted successfully']);
    }
}
