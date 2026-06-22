<?php

namespace App\Http\Controllers;

use App\Models\FeedBack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedBackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $feedBacks = FeedBack::with('user')->where('is_featured', true)->get();
        $feedBacks = $feedBacks->map(function ($feedBack) {
            return [
                'id' => $feedBack->id,
                'user_id' => $feedBack->user_id,
                'user_name' => $feedBack->user->username,
                'user_image' => $feedBack->user->profile_image,
                'message' => $feedBack->message,
                'rating' => $feedBack->rating,
                'is_featured' => $feedBack->is_featured,
            ];
        });
        return response()->json([
            'message' => 'FeedBacks',
            'data' => $feedBacks,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request['rating'] = filter_var($request->rating, FILTER_VALIDATE_FLOAT);
        // feedback only once
        if (FeedBack::where('user_id', Auth::user()->id)->exists()) {
            return response()->json(['message' => 'You have already given feedback'], 409);
        }
        $request->validate([
            'message' => 'required|string',
            'rating' => 'required|numeric|min:1.0|max:5.0',
        ]);

        FeedBack::create([
            'user_id' => Auth::user()->id,
            'message' => $request->message,
            'rating' => $request->rating,
        ]);

        return response()->json(['message' => 'Feedback given successfully']);
    }

    /**
     * Display the specified resource.
     */
    public function show(FeedBack $feedBack)
    {
        return response()->json($feedBack);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FeedBack $feedBack)
    {
        if (!Auth::user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request['is_featured'] = filter_var($request->is_featured, FILTER_VALIDATE_BOOLEAN);
        $request->validate([
            'is_featured' => 'required|boolean',
        ]);

        $feedBack->update([
            'is_featured' => $request->is_featured,
        ]);

        return response()->json(['message' => 'FeedBack updated successfully']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FeedBack $feedBack)
    {
        if (!Auth::user()->hasRole('Admin')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $feedBack->delete();

        return response()->json(['message' => 'FeedBack deleted successfully']);
    }
}
