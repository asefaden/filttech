<?php

namespace App\Http\Controllers;

use App\Models\RequestAppointment;
use App\Models\Schedule;
use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpertDashboardController extends Controller
{
    public function getStatusOverview()
    {
        // total students
        $totalAcceptedAppointments = RequestAppointment::whereHas('schedule', function ($q) {
            $q->where('user_id', Auth::id());
        })->where('status', 'accepted')->count();

        // upcoming appointments
        $upcomingAppointments = RequestAppointment::whereHas('schedule', function ($q) {
            $q->where('user_id', Auth::id())
              ->where('date', '>=', now()->toDateString());
        })->where('status', 'accepted')->count();

        // pending requests
        $newRequests = RequestAppointment::whereHas('schedule', function ($q) {
            $q->where('user_id', Auth::id());
        })->where('status', 'sent')->count();

        // my ratings(expert)
        $expert = Auth::user();
        $ratings = $expert->rating;

        return response()->json([
            'total_students' => $totalAcceptedAppointments,
            'upcoming_appointments' => $upcomingAppointments,
            'new_requests' => $newRequests,
            'ratings' => $ratings,
        ]);
    }

    public function getUpcomingAppointments(Request $request)
    {
        $appointments = RequestAppointment::with(['user', 'schedule'])
            ->join('schedules', 'schedules.id', '=', 'request_appointments.schedule_id')
            ->where('schedules.user_id', Auth::id())
            ->where('schedules.date', '>=', now()->toDateString())
            ->where('request_appointments.status', 'accepted')
            ->orderBy('schedules.date', 'asc')
            ->select('request_appointments.*')
            ->paginate($request->per_page ?? 10);

        $appointments->getCollection()->transform(function ($appointment) {
            return [
                'id' => $appointment->id,
                'user_id' => $appointment->user->id,
                'user_name' => $appointment->user->name,
                'user_image' => $appointment->user->profile_image,
                'schedule_id' => $appointment->schedule->id,
                'schedule_date' => $appointment->schedule->date,
                'schedule_from_time' => $appointment->schedule->from_time,
                'schedule_to_time' => $appointment->schedule->to_time,
                'schedule_from_time_formatted' => $appointment->schedule->from_time_formatted,
                'schedule_to_time_formatted' => $appointment->schedule->to_time_formatted,
                'status' => $appointment->status,
                'ago' => $appointment->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'message' => 'Upcoming Appointments',
            'data' => $appointments,
        ]);
    }


    public function newAppointments()
    {
        $appointments = RequestAppointment::where('status', 'sent')
            ->whereHas('schedule', function ($q) {
                $q->where('user_id', Auth::id());
            })
            ->with(['user', 'schedule'])
            ->latest()
            ->take(5)
            ->get();

        $appointments = $appointments->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'user_id' => $appointment->user->id,
                'user_name' => $appointment->user->name,
                'user_image' => $appointment->user->profile_image,
                'schedule_id' => $appointment->schedule->id,
                'schedule_date' => $appointment->schedule->date,
                'schedule_from_time' => $appointment->schedule->from_time,
                'schedule_to_time' => $appointment->schedule->to_time,
                'schedule_from_time_formatted' => $appointment->schedule->from_time_formatted,
                'schedule_to_time_formatted' => $appointment->schedule->to_time_formatted,
                'status' => $appointment->status,
                'ago' => $appointment->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'message' => 'New Appointment Requests',
            'data' => $appointments,
        ]);
    }

    // public function recentActivity()
    // {
    //     // recent activity from spatie activity log

    // }

    public function recentActivity()
    {
        // get my recent activity from spatie activity log
        $recentActivity = Activity::where('causer_id', Auth::id())
            ->latest()
            ->take(5)
            ->get();
        $recentActivity = $recentActivity->map(function ($activity) {
            return [
                'id' => $activity->id,
                'description' => $activity->description,
                'created_at' => $activity->created_at->diffForHumans(),
            ];
        });
        return response()->json([
            'message' => 'Recent Activity',
            'data' => $recentActivity,
        ]);
    }
}
