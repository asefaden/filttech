<?php

namespace App\Observers;

use App\Notifications\SendNotification;
use App\Models\Book;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

class BookObserver
{
    /**
     * Handle the Book "created" event.
     */
    public function created(Book $book): void
    {
        // Get all users with role "User"
        $users = User::role('User', 'api')->get();

        // Send notification to all
        Notification::send($users, new SendNotification([
            'title' => 'New Book Created',
            'body' => [
                'message' => 'A new book has been created.',
                'id' => $book->id,
                'type' => 'Book',
            ],
        ]));
    }

    /**
     * Handle the Book "updated" event.
     */
    public function updated(Book $book): void
    {
        $user = User::role(['Admin', 'Expert'], 'api')->get();
        Notification::send($user, new SendNotification([
            'title' => 'Book Updated',
            'body' => [
                'message' => 'A book has been updated.',
                'id' => $book->id,
                'type' => 'Book',
            ],
        ]));
    }

    /**
     * Handle the Book "deleted" event.
     */
    public function deleted(Book $book): void
    {
        $user = User::role(['Admin', 'Expert'], 'api')->get();
        Notification::send($user, new SendNotification([
            'title' => 'Book Deleted',
            'body' => [
                'message' => 'A book has been deleted.',
                'id' => $book->id,
                'type' => 'Book',
            ],
        ]));
    }

    /**
     * Handle the Book "restored" event.
     */
    public function restored(Book $book): void
    {
        $user = User::role(['Admin', 'Expert'], 'api')->get();
        Notification::send($user, new SendNotification([
            'title' => 'Book Restored',
            'body' => [
                'message' => 'A book has been restored.',
                'id' => $book->id,
                'type' => 'Book',
            ],
        ]));
    }

    /**
     * Handle the Book "force deleted" event.
     */
    public function forceDeleted(Book $book): void
    {
        $user = User::role(['Admin', 'Expert'], 'api')->get();
        Notification::send($user, new SendNotification([
            'title' => 'Book Force Deleted',
            'body' => [
                'message' => 'A book has been force deleted.',
                'id' => $book->id,
                'type' => 'Book',
            ],
        ]));
    }
}
