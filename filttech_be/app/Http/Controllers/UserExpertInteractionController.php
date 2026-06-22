<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserExpertInteraction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserExpertInteractionController extends NotificationController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(UserExpertInteraction::latest()->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // prevent rating yourself
        if ($request->expert_id == Auth::id()) {
            return response()->json(['message' => 'You cannot rate yourself'], 400);
        }

        $request->validate([
            'expert_id' => 'required|exists:users,id',
            'rating' => 'nullable|numeric|min:1|max:5',
        ]);

        // Create or update user-expert interaction
        UserExpertInteraction::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'expert_id' => $request->expert_id,
            ],
            [
                'rating' => $request->rating,
            ]
        );

        $expert = User::find($request->expert_id);
        // Recalculate average rating and round to 2 decimal places
        $expert->rating = round($expert->userExpertInteractions()->avg('rating'), 2);
        $expert->save();

        // activity log
        activity()
            ->log('rated expert')
            ->causer(Auth::user())
            ->subject($expert);

        // notify the request expert_id user
        $this->notify([
            'title' => 'New Rating',
            'body' => [
                'message' => "You are rated by ".Auth::user()->name,
                'rating' => $request->rating,
                'type' => 'New Rating',
            ],
        ], $expert);


        // notify admin and users rated this expert exclude auth user
        $users = User::role(['Admin', 'User'])->where('id', '!=', Auth::id())->get();
        $this->notify([
            'title' => 'New Rating',
            'body' => [
                'message' => "expert {$expert->name} has been rated by ".Auth::user()->name,
                'rating' => $request->rating,
                'expert_id' => $request->expert_id,
                'type' => 'New Rating',
            ],
        ], $users);

        return response()->json([
            'message' => 'User expert interaction saved successfully',
            'data' => [
                'expert_id' => $request->expert_id,
                'rating' => $request->rating,
            ],
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserExpertInteraction $userExpertInteraction)
    {
        return response()->json($userExpertInteraction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserExpertInteraction $userExpertInteraction)
    {
        $request->validate([
            'rating' => 'nullable|numeric|min:1|max:5',
        ]);

        $userExpertInteraction->update([
            'rating' => $request->rating ?? 0,
        ]);

        $expert = User::find($userExpertInteraction->expert_id);
        $expert->rating = $expert->userExpertInteractions()->avg('rating');
        $expert->save();

        return response()->json([
            'message' => 'User expert interaction updated successfully',
            'data' => $userExpertInteraction,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserExpertInteraction $userExpertInteraction)
    {
        $expert = User::find($userExpertInteraction->expert_id);
        $userExpertInteraction->delete();
        $expert->rating = $expert->userExpertInteractions()->avg('rating');
        $expert->save();
        return response()->json(['message' => 'User expert interaction deleted successfully'], 204);
    }

    public function getMyRating(User $expert)
    {
        $interaction = UserExpertInteraction::where('user_id', Auth::id())
            ->where('expert_id', $expert->id)
            ->first();

        return response()->json([
            'message' => 'My Rating for Expert',
            'rating' => $interaction?->rating,
        ]);
    }
}
