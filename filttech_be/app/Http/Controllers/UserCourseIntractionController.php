<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use App\Models\UserCourseIntraction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserCourseIntractionController extends NotificationController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(UserCourseIntraction::latest()->paginate(10));
    }

    /**
     * Rate the specified course.
     */
    public function rateCourse(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'rating' => 'required|numeric|min:1|max:5',
        ]);

        // Create or update user-course interaction
        $interaction = UserCourseIntraction::firstOrCreate([
            'user_id' => Auth::id(),
            'course_id' => $request->course_id,
        ]);

        // Set/update rating
        $interaction->rating = $request->rating;
        $interaction->save();

        $course = Course::find($request->course_id);
        // Recalculate average rating and round to 2 decimal places
        $course->rating = round($course->intractions()->avg('rating'), 2);
        $course->save();

        // notify admin and users rated this course exclude auth user
        $users = User::role(['Admin', 'User'])->where('id', '!=', Auth::id())->get();
        $this->notify([
            'title' => 'New Course Rating',
            'body' => [
                'message' => "course {$course->name} has been rated by ".Auth::user()->name,
                'rating' => $request->rating,
                'course_id' => $request->course_id,
                'type' => 'New Course Rating',
            ],
        ], $users);

        // activity log
        activity()
            ->log('rated course')
            ->causer(Auth::user())
            ->subject($interaction);

        return response()->json([
            'status' => 'success',
            'message' => 'Course rated successfully',
            'data' => [
                'course_id' => $request->course_id,
                'rating' => $interaction->rating,
                'course_rating' => $course->rating,
            ],
        ]);
    }


    /**
     * Favorite the specified course.
     */
    public function toggleFavoriteCourse(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);

        // Get or create the interaction row for this user & course
        $interaction = UserCourseIntraction::firstOrCreate([
            'user_id'  => Auth::id(),
            'course_id' => $request->course_id,
        ]);

        // Toggle the favorite status
        $interaction->is_favorite = !$interaction->is_favorite;
        $interaction->save();

        // activity log
        activity()
            ->log('favorite course')
            ->causer(Auth::user())
            ->subject($interaction);

        return response()->json([
            'status' => 'success',
            'message' => $interaction->is_favorite
                ? 'Course added to favorites'
                : 'Course removed from favorites',
            'data' => [
                'course_id' => $request->course_id,
                'is_favorite' => $interaction->is_favorite,
            ]
        ]);
    }


    /**
     * Display the specified resource.
     */
    public function show(UserCourseIntraction $userCourseIntraction)
    {
        return response()->json($userCourseIntraction);
    }

    // get user rating and favorite status for a course
    public function getUserCourseIntraction(Request $request, $courseId)
    {
        $interaction = UserCourseIntraction::where('user_id', Auth::id())
            ->where('course_id', $courseId)
            ->first();

        if (!$interaction) {
            return response()->json([
                'rating' => null,
                'is_favorite' => false,
            ]);
        }

        return response()->json([
            'rating' => $interaction->rating,
            'is_favorite' => $interaction->is_favorite,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserCourseIntraction $userCourseIntraction)
    {
        $request->validate([
            'rating' => 'nullable|numeric|min:1|max:5',
            'is_favorite' => 'nullable|boolean',
        ]);

        $userCourseIntraction->update([
            'rating' => $request->rating ?? 0,
            'is_favorite' => $request->is_favorite ?? false,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserCourseIntraction $userCourseIntraction)
    {
        $userCourseIntraction->delete();
        return response()->json(['message' => 'User course intraction deleted successfully'], 204);
    }
}
