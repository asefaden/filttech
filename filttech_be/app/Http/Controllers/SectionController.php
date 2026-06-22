<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SectionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'per_page' => 'nullable|integer',
            'search' => 'nullable|string',
        ]);

        $sections = Section::when($request->has('search'), function ($query) use ($request) {
            $query->where('name', 'like', "%{$request->search}%");
        })->latest()->where('course_id', $request->course_id)->with('course')->paginate($request->per_page ?? 10);

        $formattedSections = $sections->map(function ($section) {
            return [
                'id' => $section->id,
                'name' => $section->name,
                'introduction' => $section->introduction,
                'description' => $section->description,
                'example' => $section->example,
                'example_explanation' => $section->example_explanation,
                'thumbnail' => $section->thumbnail,
                'video' => $section->video,
            ];
        });

        return response()->json([
            'message' => 'Sections',
            'data' => $formattedSections,
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
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'introduction' => 'nullable|string',
            'description' => 'nullable|string',
            'example' => 'nullable|string',
            'example_explanation' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
            'video' => 'nullable|file|mimes:mp4,mov,ogg,qt',
        ]);

        $section = Section::create($validated);

        if ($request->hasFile('thumbnail')) {
            $section->addMedia($request->file('thumbnail'))->toMediaCollection('thumbnail');
        }
        if ($request->hasFile('video')) {
            $section->addMedia($request->file('video'))->toMediaCollection('video');
        }

        return response()->json($section, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Section $section)
    {
        $section = [
            'id' => $section->id,
            'name' => $section->name,
            'introduction' => $section->introduction,
            'description' => $section->description,
            'example' => $section->example,
            'example_explanation' => $section->example_explanation,
            'comment_count' => $section->intractions->count(),
            'comments' => $section->intractions->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'user_id' => $comment->user_id,
                    'user_name' => $comment->user->name,
                    'user_profile_image' => $comment->user->profile_image,
                    'comment' => $comment->comment,
                ];
            }),
        ];
        return response()->json([
            'message' => 'Section',
            'data' => $section,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Section $section)
    {
        if (!Auth::user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $validated = $request->validate([
            'course_id' => 'sometimes|exists:courses,id',
            'name' => 'sometimes|string|max:255',
            'introduction' => 'sometimes|string',
            'description' => 'sometimes|string',
            'example' => 'sometimes|string',
            'example_explanation' => 'sometimes|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
            'video' => 'nullable|file|mimes:mp4,mov,ogg,qt',
        ]);

        $section->update($validated);

        if ($request->hasFile('thumbnail')) {
            $section->clearMediaCollection('thumbnail');
            $section->addMedia($request->file('thumbnail'))->toMediaCollection('thumbnail');
        }
        if ($request->hasFile('video')) {
            $section->clearMediaCollection('video');
            $section->addMedia($request->file('video'))->toMediaCollection('video');
        }

        return response()->json($section);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Section $section)
    {
        if (!Auth::user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $section->delete();

        return response()->json(['message' => 'Section deleted successfully']);
    }

    public function getComments(Section $section)
    {

        $comments = $section->intractions()
            ->latest()
            ->with('user')
            ->paginate(10)
            ->through(function ($comment) {
                return [
                    'id' => $comment->id,
                    'user_id' => $comment->user_id,
                    'user_name' => $comment->user->name,
                    'user_profile_image' => $comment->user->profile_image,
                    'comment' => $comment->comment,
                ];
            });
        return response()->json([
            'message' => 'Comments',
            'data' => $comments,
        ]);
    }
}
