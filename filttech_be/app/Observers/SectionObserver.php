<?php

namespace App\Observers;

use App\Models\Section;
use App\Models\User;
use App\Notifications\SendNotification;
use Illuminate\Support\Facades\Notification;

class SectionObserver
{
    /**
     * Handle the Section "created" event.
     */
    public function created(Section $section): void
    {
        $users = User::role('User', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'New Section Created',
            'body' => [
                'message' => 'A new section has been created on'.$section->course->name,
                'id' => $section->id,
                'name' => $section->name,
                'type' => 'Section',
            ],
        ]));
    }

    /**
     * Handle the Section "updated" event.
     */
    public function updated(Section $section): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Section Updated',
            'body' => [
                'message' => 'A section has been updated.',
                'id' => $section->id,
                'name' => $section->name,
                'type' => 'Section',
            ],
        ]));
    }

    /**
     * Handle the Section "deleted" event.
     */
    public function deleted(Section $section): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Section Deleted',
            'body' => [
                'message' => 'A section has been deleted.',
                'id' => $section->id,
                'name' => $section->name,
                'type' => 'Section',
            ],
        ]));
    }

    /**
     * Handle the Section "restored" event.
     */
    public function restored(Section $section): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Section Restored',
            'body' => [
                'message' => 'A section has been restored.',
                'id' => $section->id,
                'name' => $section->name,
                'type' => 'Section',
            ],
        ]));
    }

    /**
     * Handle the Section "force deleted" event.
     */
    public function forceDeleted(Section $section): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Section Force Deleted',
            'body' => [
                'message' => 'A section has been force deleted.',
                'id' => $section->id,
                'name' => $section->name,
                'type' => 'Section',
            ],
        ]));
    }
}
