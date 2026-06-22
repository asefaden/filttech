<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\User;
use App\Models\UserSectionIntraction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserSectionIntractionController extends NotificationController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(UserSectionIntraction::latest()->paginate(10));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'section_id' => 'required|exists:sections,id',
            'comment' => 'nullable|string',
        ]);

        UserSectionIntraction::create([
            'user_id' => Auth::id(),
            'section_id' => $request->section_id,
            'comment' => $request->comment ?? null,
        ]);

        $section = Section::find($request->section_id);
        $section->comments = $section->intractions()->count();
        $section->save();

        // notify admin and users commented on this section exclude auth user
        $users = User::role(['Admin', 'User'])->where('id', '!=', Auth::id())->get();
        $this->notify([
            'title' => 'New Comment',
            'body' => [
                'message' => "New comment on section {$section->name} by ".Auth::user()->name,
                'section_id' => $request->section_id,
                'type' => 'New Comment',
            ],
        ], $users);

        // activity log
        activity()
            ->log('commented on section')
            ->causer(Auth::user())
            ->subject($section);

        return response()->json([
            'message' => 'User section intraction created successfully',
            'comment' => $request->comment ?? null,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(UserSectionIntraction $userSectionIntraction)
    {
        return response()->json($userSectionIntraction);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UserSectionIntraction $userSectionIntraction)
    {
        $request->validate([
            'comment' => 'nullable|string',
        ]);

        $userSectionIntraction->update([
            'comment' => $request->comment ?? null,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UserSectionIntraction $userSectionIntraction)
    {
        $userSectionIntraction->delete();
        return response()->json(['message' => 'User section intraction deleted successfully'], 204);
    }
}
