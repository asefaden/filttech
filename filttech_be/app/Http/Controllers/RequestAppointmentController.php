<?php

namespace App\Http\Controllers;

use App\Models\RequestAppointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RequestAppointmentController extends NotificationController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RequestAppointment::with(['user', 'schedule'])
            ->whereHas('schedule', function ($q) {
                $q->where('user_id', Auth::id()); // expert's schedule
            })
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appointments = $query->paginate($request->per_page ?? 10);

        // Transform only the paginated items
        $appointments->getCollection()->transform(function ($appointment) {
            return [
                'id' => $appointment->id,
                'user_id' => $appointment->user->id,
                'user_name' => $appointment->user->name,
                'user_image' => $appointment->user->getFirstMediaUrl('profile_image'),
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
            'message' => 'Appointment Requests',
            'data' => $appointments,
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
        ]);

        if (RequestAppointment::where('user_id', Auth::id())->where('schedule_id', $request->schedule_id)->exists()) {
            return response()->json([
                'message' => 'You have already requested an appointment for this schedule',
            ], 409);
        }

        $appointment = RequestAppointment::create([
            'user_id' => Auth::id(),
            'schedule_id' => $request->schedule_id,
            'status' => 'sent',
        ]);

        $expert = $appointment->schedule->user;

        $this->notify([
            'title' => 'New Appointment Request',
            'body' => [
                'message' => 'You have a new appointment request from ' . Auth::user()->username,
                'id' => $appointment->id,
                'type' => 'Appointment Request',
            ],
        ], $expert);

        // activity log
        activity()
            ->log('You sent appointment request')
            ->causer(Auth::user())
            ->subject($appointment);

        return response()->json([
            'message' => 'Appointment request sent successfully',
            'data' => [
                'id' => $appointment->id,
                'user_id' => $appointment->user_id,
                'schedule_id' => $appointment->schedule_id,
                'status' => $appointment->status,
            ],
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(RequestAppointment $requestAppointment)
    {
        return response()->json([
            'message' => 'Appointment',
            'data' => [
                'id' => $requestAppointment->id,
                'user_id' => $requestAppointment->user_id,
                'schedule_id' => $requestAppointment->schedule_id,
                'status' => $requestAppointment->status,
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RequestAppointment $requestAppointment)
    {

        if ($requestAppointment->schedule->created_by !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 401);
        }

        $request->validate([
            'status' => 'required|in:accepted,declined',
        ]);

        $requestAppointment->update([
            'status' => $request->status,
        ]);

        if ($request->status == 'accepted') {
            // update schadule status to booked
            $schedule = $requestAppointment->schedule;
            $schedule->status = 'booked';
            $schedule->save();

            // notify user
            $user = $requestAppointment->user;
            $notificationData = [
                'title' => 'Appointment Accepted',
                'body' => [
                    'message' => 'Your appointment request has been accepted by ' . $schedule->user->name,
                    'id' => $requestAppointment->id,
                    'type' => 'Appointment Accepted',
                ],
            ];
            $this->notify($notificationData, $user);

            // activity log
            activity()
                ->log('You accepted appointment request')
                ->causer(Auth::user())
                ->subject($requestAppointment);
        }

        if ($request->status == 'declined') {
            // update schadule status to available
            $schedule = $requestAppointment->schedule;
            $schedule->status = 'available';
            $schedule->save();

            // notify user
            $user = $requestAppointment->user;
            $notificationData = [
                'title' => 'Appointment Declined',
                'body' => [
                    'message' => 'Your appointment request has been declined by ' . $requestAppointment->schedule->user->name,
                    'id' => $requestAppointment->id,
                    'type' => 'Appointment Declined',
                ],
            ];
            $this->notify($notificationData, $user);

            // activity log
            activity()
                ->log('You declined appointment request')
                ->causer(Auth::user())
                ->subject($requestAppointment);
        }



        return response()->json([
            'message' => 'Appointment updated successfully',
            'data' => $requestAppointment,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RequestAppointment $requestAppointment)
    {
        $requestAppointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully',
        ]);
    }

    public function statusOverview()
    {
        $totalRequests = RequestAppointment::whereHas('schedule', function ($q) {
            $q->where('user_id', Auth::id());
        })->count();

        $acceptedRequests = RequestAppointment::whereHas('schedule', function ($q) {
            $q->where('user_id', Auth::id());
        })->where('status', 'accepted')->count();

        $declinedRequests = RequestAppointment::whereHas('schedule', function ($q) {
            $q->where('user_id', Auth::id());
        })->where('status', 'declined')->count();

        $pendingRequests = RequestAppointment::whereHas('schedule', function ($q) {
            $q->where('user_id', Auth::id());
        })->where('status', 'sent')->count();

        return response()->json([
            'message' => 'Appointment Status Overview',
            'data' => [
                'total_requests' => $totalRequests,
                'accepted_requests' => $acceptedRequests,
                'declined_requests' => $declinedRequests,
                'pending_requests' => $pendingRequests,
            ],
        ]);
    }
}
