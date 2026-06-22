<?php

namespace App\Http\Controllers;

use App\Models\RequestAppointment;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Schedule::where('user_id', Auth::id());

        // Filter by single date
        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        // Filter by date range: from - to
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

        // activity log
        activity()
            ->log('You viewed calendar overview')
            ->causer(Auth::user())
            ->withProperties([
                'type' => 'view',
            ]);

        return response()->json([
            'message' => 'Calendar Overview',
            'days'    => $days,
        ]);
    }




    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'from_time' => 'required|date_format:H:i:s',
            'to_time' => 'required|date_format:H:i:s|after:from_time',
        ]);

        $fromTime = \Carbon\Carbon::createFromFormat('H:i:s', $request->from_time);
        $toTime = \Carbon\Carbon::createFromFormat('H:i:s', $request->to_time);

        // If the date is today, from_time must be in the future
        if ($request->date === now()->toDateString()) {
            if ($fromTime <= now()) {
                return response()->json([
                    'message' => 'From time must be in the future.',
                ], 422);
            }
        }

        $userId = Auth::id();

        // Check overlapping schedules
        $overlap = Schedule::where('user_id', $userId)
            ->where('date', $request->date)
            ->where(function ($query) use ($fromTime, $toTime) {
                $query->where('from_time', '<', $toTime)
                    ->where('to_time', '>', $fromTime);
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'This schedule overlaps with an existing one.',
            ], 400);
        }

        // Create schedule
        $schedule = Schedule::create([
            'user_id' => $userId,
            'date' => $request->date,
            'from_time' => $fromTime->format('H:i:s'),
            'to_time' => $toTime->format('H:i:s'),
        ]);

        // activity log
        activity()
            ->log('You created schedule')
            ->causer(Auth::user())
            ->subject($schedule);

        return response()->json([
            'message' => 'Schedule created successfully',
            'data' => $schedule,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Schedule $schedule)
    {
        return response()->json([
            'message' => 'Schedule details',
            'data' => [
                'id' => $schedule->id,
                'date' => $schedule->date,
                'from_time' => $schedule->from_time,
                'from_time_formatted' => $schedule->from_time_formatted,
                'to_time' => $schedule->to_time,
                'to_time_formatted' => $schedule->to_time_formatted,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Schedule $schedule)
    {
        $request->validate([
            'date' => 'sometimes|date|after_or_equal:today',
            'from_time' => 'sometimes|nullable|date_format:H:i:s',
            'to_time' => 'sometimes|nullable|date_format:H:i:s|after:from_time',
        ]);

        // Use existing values if not provided
        $newDate = $request->date ?? $schedule->date;
        $newFromTime = $request->from_time ?? $schedule->from_time;
        $newToTime = $request->to_time ?? $schedule->to_time;

        // Convert times safely
        $fromTime = Carbon::parse($newFromTime);
        $toTime   = Carbon::parse($newToTime);

        // If date is today → from_time must be future
        if ($newDate === now()->toDateString()) {
            if ($fromTime <= now()) {
                return response()->json([
                    'message' => 'From time must be in the future.',
                ], 422);
            }
        }

        $userId = Auth::id();

        // Overlap check
        $overlap = Schedule::where('user_id', $userId)
            ->where('date', $newDate)
            ->where('id', '!=', $schedule->id)
            ->where(function ($query) use ($fromTime, $toTime) {
                $query->where('from_time', '<', $toTime->format('H:i:s'))
                    ->where('to_time', '>', $fromTime->format('H:i:s'));
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'This schedule overlaps with an existing one.',
            ], 400);
        }

        // Update schedule
        $schedule->update([
            'date' => $newDate,
            'from_time' => $fromTime->format('H:i:s'),
            'to_time' => $toTime->format('H:i:s'),
        ]);

        // activity log
        activity()
            ->log('You updated schedule')
            ->causer(Auth::user())
            ->subject($schedule);

        return response()->json([
            'message' => 'Schedule updated successfully',
            'data' => $schedule,
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();

        // activity log
        activity()
            ->log('You deleted schedule')
            ->causer(Auth::user())
            ->subject($schedule);

        return response()->json([
            'message' => 'Schedule deleted successfully',
        ]);
    }

    public function getSchadulesByDate(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $schedules = Schedule::where('user_id', Auth::id())
            ->whereDate('date', $request->date)
            ->orderBy('from_time')
            ->get();

        $slots = $schedules->map(function ($schedule) {
            // Check if this slot is booked (status = booked or appointment accepted)
            $appointment = $schedule->appointments()
                ->where('status', 'accepted')
                ->with('user:id,name,email')
                ->first();

            return [
                'id'         => $schedule->id,
                'startTime'  => $schedule->from_time_formatted,
                'endTime'    => $schedule->to_time_formatted,
                'status'     => $appointment ? 'booked' : 'available',
                'studentName' => $appointment ? $appointment->user->name : null,
            ];
        });

        // activity log
        activity()
            ->log('You viewed schedule by date')
            ->causer(Auth::user())
            ->withProperties([
                'type' => 'view',
                'date' => $request->date,
            ]);

        return response()->json([
            'date'  => $request->date,
            'slots' => $slots,
        ]);
    }

    // today accepted appointments(Today Sessions) - expert
    public function getTodaySessions()
    {
        $appointments = RequestAppointment::where('status', 'accepted')
            ->whereHas('schedule', function ($query) {
                $query->whereDate('date', today())
                    ->where('user_id', Auth::id()); // expert's schedule
            })
            ->with(['user:id,name,email', 'schedule'])
            ->get();
        $appointments = $appointments->map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'student_name' => $appointment->user->name,
                'student_email' => $appointment->user->email,
                'student_image' => $appointment->user->profile_image,
                'date' => $appointment->schedule->date,
                'from_time' => $appointment->schedule->from_time_formatted,
                'to_time' => $appointment->schedule->to_time_formatted,
            ];
        });

        return response()->json([
            'message' => 'Today Sessions',
            'data' => $appointments,
        ]);
    }
}
