<?php

namespace App\Http\Controllers;

use App\Models\RequestAppointment;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ExpertController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'nullable|integer',
            'search' => 'nullable|string',
            'sort_by' => 'nullable|in:highest_rate,most_popular',
        ]);

        $perPage = $request->input('per_page', 10);
        // role expert
        $query = User::role('Expert')->withCount('acceptedAppointments');

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->has('sort_by')) {
            if ($request->sort_by === 'highest_rate') {
                $query->orderBy('rating', 'desc');
            } elseif ($request->sort_by === 'most_popular') {
                $query->orderBy('accepted_appointments_count', 'desc');
            }
        }
        $experts = $query->paginate($perPage);
        $experts = $experts->map(function ($expert) {
            return [
                'id' => $expert->id,
                'name' => $expert->name,
                'profession' => $expert->profession,
                'rating' => $expert->rating,
                'profile_image' => $expert->profile_image,
                'accepted_appointments_count' => $expert->accepted_appointments_count,
            ];
        });
        return response()->json([
            'message' => 'Experts',
            'data' => $experts,
        ]);
    }

    public function show(User $expert)
    {
        $expert->loadCount('acceptedAppointments');

        $expertData = [
            'id' => $expert->id,
            'name' => $expert->name,
            'profession' => $expert->profession,
            'rating' => $expert->rating,
            'profile_image' => $expert->profile_image,
            'skills' => $expert->skills,
            'accepted_appointments_count' => $expert->accepted_appointments_count,
        ];

        return response()->json([
            'message' => 'Expert',
            'data' => $expertData,
        ]);
    }

    public function getScheduleByExpert(User $expert, Request $request)
    {
        $query = Schedule::where('user_id', $expert->id);

        // Filter by single date
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filter by date range
        if ($request->filled('from_date') && $request->filled('to_date')) {
            $query->whereBetween('date', [$request->from_date, $request->to_date]);
        }

        // Fetch + group by date
        $grouped = $query->orderBy('date')->get()->groupBy('date');

        $days = [];

        foreach ($grouped as $date => $items) {
            $days[] = [
                'date'           => $date,
                'availableCount' => $items->where('status', 'available')->count(),
                'bookedCount'    => $items->where('status', 'booked')->count(),
                'emptyCount'     => $items->where('status', 'unavailable')->count() ?? 0,
            ];
        }

        return response()->json([
            'message' => 'Expert Calendar Overview',
            'days'    => $days,
        ]);
    }

    public function availableTime(Request $request)
    {
        // get available time slots for a given expert and date
        $request->validate([
            'expert_id' => 'required|exists:users,id',
            'date' => 'required|date|after_or_equal:today',
        ]);

        $schedules = Schedule::where('user_id', $request->expert_id)
            ->whereDate('date', $request->date)
            ->where('status', 'available')
            ->orderBy('from_time')
            ->get();

        $slots = $schedules->map(function ($schedule) {
            return [
                'id'         => $schedule->id,
                'startTime'  => $schedule->from_time_formatted,
                'endTime'    => $schedule->to_time_formatted,
            ];
        });

        return response()->json([
            'date'  => $request->date,
            'slots' => $slots,
        ]);
    }

    // get expert by appointment  id if appointment accepted
    public function getExpertByAppointmentId(RequestAppointment $requestAppointment)
    {
        // Check if appointment is accepted
        if ($requestAppointment->status !== 'accepted') {
            return response()->json([
                'message' => 'Appointment is not accepted',
            ], 403);
        }

        // Load the schedule and expert (user) relationships
        $requestAppointment->load(['schedule.user:id,name,email,phone_number,profession,rating,skills', 'schedule']);

        $expert = $requestAppointment->schedule->user;

        // Load accepted appointments count for the expert
        $expert->loadCount('acceptedAppointments');

        $expertData = [
            'id' => $expert->id,
            'name' => $expert->name,
            'email' => $expert->email,
            'phone_number' => $expert->phone_number,
            'profession' => $expert->profession,
            'rating' => $expert->rating,
            'profile_image' => $expert->profile_image,
            'skills' => $expert->skills,
            'schedule' => [
                'id' => $requestAppointment->schedule->id,
                'date' => $requestAppointment->schedule->date,
                'from_time' => $requestAppointment->schedule->from_time,
                'from_time_formatted' => $requestAppointment->schedule->from_time_formatted,
                'to_time' => $requestAppointment->schedule->to_time,
                'to_time_formatted' => $requestAppointment->schedule->to_time_formatted,
                'duration' => \Carbon\Carbon::parse($requestAppointment->schedule->from_time)->diffInHours(
                    \Carbon\Carbon::parse($requestAppointment->schedule->to_time)
                ),
            ],
        ];

        return response()->json([
            'message' => 'Expert',
            'data' => $expertData,
        ]);
    }
}
