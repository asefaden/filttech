<?php

namespace App\Observers;

use App\Models\Post;
use App\Models\User;
use App\Notifications\SendNotification;
use Illuminate\Support\Facades\Notification;

class PostObserver
{
    /**
     * Handle the Post "created" event.
     */
    public function created(Post $post): void
    {
        $users = User::role('User', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'New Blog Post Created',
            'body' => [
                'message' => 'A new blog post has been created.',
                'id' => $post->id,
                'type' => 'Blog',
            ],
        ]));
    }

    /**
     * Handle the Post "updated" event.
     */
    public function updated(Post $post): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Blog Post Updated',
            'body' => [
                'message' => 'A blog post has been updated.',
                'id' => $post->id,
                'type' => 'Blog',
            ],
        ]));
    }

    /**
     * Handle the Post "deleted" event.
     */
    public function deleted(Post $post): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Blog Post Deleted',
            'body' => [
                'message' => 'A blog post has been deleted.',
                'id' => $post->id,
                'type' => 'Blog',
            ],
        ]));
    }

    /**
     * Handle the Post "restored" event.
     */
    public function restored(Post $post): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Blog Post Restored',
            'body' => [
                'message' => 'A blog post has been restored.',
                'id' => $post->id,
                'type' => 'Blog',
            ],
        ]));
    }

    /**
     * Handle the Post "force deleted" event.
     */
    public function forceDeleted(Post $post): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Blog Post Force Deleted',
            'body' => [
                'message' => 'A blog post has been force deleted.',
                'id' => $post->id,
                'type' => 'Blog',
            ],
        ]));
    }
}
