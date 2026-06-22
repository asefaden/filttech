<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends NotificationController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'nullable|integer',
            'search' => 'nullable|string',
        ]);

        $postsQuery = Post::when($request->has('search'), function ($query) use ($request) {
            $query->where('title', 'like', "%{$request->search}%");
        });

        // Order by featured first, then by latest
        $postsQuery->orderByDesc('is_featured')->latest();

        $posts = $postsQuery->paginate($request->per_page ?? 10);

        $formattedPosts = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'thumbnail' => $post->thumbnail,
                'is_featured' => $post->is_featured,
            ];
        });

        // activity log
        activity()
            ->log('viewed posts')
            ->causer(Auth::user())
            ->withProperties([
                'type' => 'view',
            ]);

        return response()->json([
            'message' => 'Posts',
            'data' => $formattedPosts,
            'pagination' => [
                'total' => $posts->total(),
                'per_page' => $posts->perPage(),
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'from' => $posts->firstItem(),
                'to' => $posts->lastItem(),
            ],
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_featured' => 'nullable|boolean',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg',
        ]);

        $post = Post::create($validated);

        if ($request->hasFile('thumbnail')) {
            $post->addMedia($request->file('thumbnail'))->toMediaCollection('thumbnail');
        }

        // notify user role User exclude auth user
        $student = User::role('User')->where('id', '!=', Auth::id())->get();
        $this->notify([
            'title' => 'New Post Created',
            'body' => [
                'message' => 'A new post has been created.',
                'post_id' => $post->id,
                'type' => 'New Post',
            ],
        ], $student);

        // log activity
        activity()
            ->log('created post')
            ->causer(Auth::user())
            ->subject($post);

        return response()->json($post, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        $post = [
            'id' => $post->id,
            'title' => $post->title,
            'content' => $post->content,
            'thumbnail' => $post->thumbnail,
            'is_featured' => $post->is_featured,
        ];
        // activity log
        activity()
            ->log('viewed post details')
            ->causer(Auth::user())
            ->subject($post);
        return response()->json([
            'message' => 'Post Details',
            'data' => $post,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_featured' => 'nullable|boolean',
        ]);

        $post->update($validated);

        if ($request->hasFile('thumbnail')) {
            $post->clearMediaCollection('thumbnail');
            $post->addMedia($request->file('thumbnail'))->toMediaCollection('thumbnail');
        }

        // log activity
        activity()
            ->log('updated post')
            ->causer(Auth::user())
            ->subject($post);

        return response()->json($post);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $post->delete();

        // log activity
        activity()
            ->log('deleted post')
            ->causer(Auth::user())
            ->subject($post);

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
