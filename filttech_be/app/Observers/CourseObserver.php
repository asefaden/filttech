<?php

namespace App\Observers;

use App\Models\Course;
use App\Models\User;
use App\Notifications\SendNotification;
use Illuminate\Support\Facades\Notification;

class CourseObserver
{
    /**
     * Handle the Course "created" event.
     */
    public function created(Course $course): void
    {
        $users = User::role('User', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'New Course Created',
            'body' => [
                'message' => 'A new course has been created.',
                'id' => $course->id,
                'name' => $course->name,
                'type' => 'Course',
            ],
        ]));
    }

    /**
     * Handle the Course "updated" event.
     */
    public function updated(Course $course): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Course Updated',
            'body' => [
                'message' => 'A course has been updated.',
                'id' => $course->id,
                'name' => $course->name,
                'type' => 'Course',
            ],
        ]));
    }

    /**
     * Handle the Course "deleted" event.
     */
    public function deleted(Course $course): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Course Deleted',
            'body' => [
                'message' => 'A course has been deleted.',
                'id' => $course->id,
                'name' => $course->name,
                'type' => 'Course',
            ],
        ]));
    }

    /**
     * Handle the Course "restored" event.
     */
    public function restored(Course $course): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Course Restored',
            'body' => [
                'message' => 'A course has been restored.',
                'id' => $course->id,
                'name' => $course->name,
                'type' => 'Course',
            ],
        ]));
    }

    /**
     * Handle the Course "force deleted" event.
     */
    public function forceDeleted(Course $course): void
    {
        $users = User::role('Admin', 'api')->get();
        Notification::send($users, new SendNotification([
            'title' => 'Course Force Deleted',
            'body' => [
                'message' => 'A course has been force deleted.',
                'id' => $course->id,
                'name' => $course->name,
                'type' => 'Course',
            ],
        ]));
    }
}
