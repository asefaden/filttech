<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\RequestException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class BaseController extends Controller
{
    public function sendSMSMessageRequest(Request $request)
    {
        $phone = $request->phone;
        $message = $request->message;

        return $this->sendSMSMessage($phone, $message);
    }

    public function sendSMS($phone, $otp, $appKey = '')
    {
        $message = $otp.' is your verification code.'.' '.$appKey;

        return $this->sendSMSMessage($phone, $message);
    }

    public function sendSMSMessage($phone, $message)
    {
        // dd($phone, $message);
        $url = 'https://api.afromessage.com/api/send';
        $token = config('app.sms_token');
        $from = 'e80ad9d8-adf3-463f-80f4-7c4b39f7f164';
        // $sender = 'Droga PMS';
        $callback = '';

        $body = [
            'from' => $from,
            // "sender" => $sender,
            'to' => $phone,
            'message' => $message,
            'callback' => $callback,
        ];

        try {
            $response = Http::withToken($token)
                ->post($url, $body);

            if ($response->successful()) {
                $data = $response->json();
                if ($data['acknowledge'] == 'success') {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Message sent successfully',
                        'data' => $response,
                    ]);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Message not sent',
                        'data' => $data,
                    ]);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Message not sent',
                    'data' => $response->json(),
                ]);
            }
        } catch (RequestException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Message not sent',
                'data' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Message not sent',
                'data' => $e->getMessage(),
            ]);
        }
    }

    public function smsCallback(Request $request)
    {
        $status = $request->status;
        $messageId = $request->messageId;
        $phone = $request->phone;
        $message = $request->message;

        if ($status == 'DELIVERED') {
            return response()->json([
                'status' => $status,
                'messageId' => $messageId,
                'phone' => $phone,
                'message' => $message,
            ]);
        } else {
            return response()->json([
                'status' => $status,
                'messageId' => $messageId,
                'phone' => $phone,
                'message' => $message,
            ]);
        }
    }
}
