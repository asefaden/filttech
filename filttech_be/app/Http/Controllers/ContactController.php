<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactController extends NotificationController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $contacts = Contact::all();
        return response()->json($contacts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //dd($request->all());
            
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'message' => 'required|string|max:500',
            ]);
            DB::beginTransaction();
            $contact = Contact::create([
                'name' => $request->name,
                'email' => $request->email,
                'message' => $request->message
            ]);
            DB::commit();

            // Notify Admin
            $adminUsers = User::role(['Admin'])->get();

            $notificationData = [
                'title' => 'New Contact Message',
                'body' => [
                    'message' => "New contact message from {$contact->name} ({$contact->phone_number}): {$contact->message}",
                    'contact_id' => $contact->id,
                    'type' => 'Contact Message',
                ],
            ];

            $this->notify($notificationData, $adminUsers);

            
            return response()->json(['message' => 'Contact saved successfully', 'contact' => $contact], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Contact $contact)
    {
        return response()->json($contact);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Contact $contact)
    {
        $contact->update($request->all());
        return response()->json($contact);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contact $contact)
    {
        $contact->delete();
        return response()->json(['message' => 'Contact deleted successfully'], 204);
    }
}
