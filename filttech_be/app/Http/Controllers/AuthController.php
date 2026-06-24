<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreatePasswordRequest;
use App\Models\User;
use App\Models\UserSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Register a User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function register(Request $request)
{
    // ቫሊዴሽኑን ከተለያዩ የስልክ ፎርማቶች ጋር እንዲስማማ እናላላዋለን
    $validated = $request->validate([
        'phone_number' => 'required|string|min:9|max:15',
        'password' => 'required|string|min:4',
    ]);

    // የመጣውን ስልክ ቁጥር ማጽዳት (ለምሳሌ + ምልክት ካለው ማጥፋት)
    $phone = trim($validated['phone_number']);
    $phone = str_replace('+', '', $phone);

    // ስልኩ በ 09 ከጀመረ ወደ 2519 መቀየር (ፕላትፎርሙ 09 ካመጣ)
    if (str_starts_with($phone, '0')) {
        $phone = '251' . substr($phone, 1);
    }

    $user = User::where('phone_number', $phone)->first();

    if ($user) {
        if (!$user->status) {
            $user->update([
                'password' => Hash::make($validated['password']),
                'status' => true,
            ]);
            if (!$user->hasRole('User')) {
                $user->assignRole('User');
            }
        } else {
            return response()->json(['message' => 'User already exists'], 409);
        }
    } else {
        $name = $request->input('name') ?: 'VAS User'; // ስም ከሌለ 'VAS User' ይለዋል
        
        $user = User::create([
            'name' => $name,
            'phone_number' => $phone,
            'password' => Hash::make($validated['password']),
            'status' => true,
            'username' => $this->generateUniqueUsername($name),
        ]);
        $user->assignRole('User');
    }

    return response()->json([
        'message' => 'User registered successfully',
        'user' => $user
    ]);
}
   public function unsubscribe(Request $request)
{
    $validated = $request->validate([
        'phone_number' => 'required|string|min:9|max:15',
    ]);

    $phone = trim($validated['phone_number']);
    $phone = str_replace('+', '', $phone);
    if (str_starts_with($phone, '0')) {
        $phone = '251' . substr($phone, 1);
    }

    $user = User::where('phone_number', $phone)->first();
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $user->update([
        'status' => false,
    ]);

    return response()->json(['message' => 'User unsubscribed successfully'], 200);
}
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('phone_number', $request->username)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if (! $user->status) {
            return response()->json(['message' => 'Account is inactive. Please register again.'], 404);
        }

        $credentials = [
            'password' => $request->password,
        ];

        if (filter_var($request->username, FILTER_VALIDATE_EMAIL)) {
            $credentials['email'] = $request->username;
        } elseif (is_numeric($request->username)) {
            $credentials['phone_number'] = $request->username;
        } else {
            $credentials['username'] = $request->username;
        }

        if (! $token = Auth::attempt($credentials)) {
            return response()->json(
                ['message' => 'Invalid Credentials'],
                400
            );
        }

        return $this->respondWithToken($token);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        $user = User::find(Auth::id())->load('roles');
        $userArray = $user->toArray();
        $userArray['status'] = $user->status ?? 0;
        return response()->json($userArray);
    }

    // update_profile
    public function update_profile(Request $request)
    {
        $request->validate([
            'name' => 'nullable|string',
            //'phone_number' => 'nullable|unique:users,phone_number,' . Auth::id(),
            'email' => 'nullable|email|unique:users,email,' . Auth::id(),
            'username' => 'nullable|string|unique:users,username,' . Auth::id(),
            'profession' => 'nullable|string',
            'skills' => 'nullable|array',
            'skills.*' => 'string',
        ]);
        $user = User::find(Auth::id());

        if (! empty($user)) {
            $user->update([
                'name' => $request->name ?? $user->name,
                'email' => $request->email ?? $user->email,
                //'phone_number' => $request->phone_number ?? $user->phone_number,
                'username' => $request->username ?? $user->username,
                'profession' => $request->profession ?? $user->profession,
                'skills' => $request->skills ?? $user->skills,
            ]);

            return User::find(Auth::id());
        } else {
            abort(404, 'Invalid Token.');
        }
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {

        Auth::logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(Auth::refresh());
    }

    public function create_password(CreatePasswordRequest $request)
    {
        $user = User::find(Auth::id());

        if ($user->status === 0) {
            abort(400, 'Password already created!');
        }
        if (! empty($user)) {
            $user->update([
                'password' => Hash::make($request->password),
                'status' => 0,
            ]);

            return User::find(Auth::id());
        } else {
            abort(404, 'User not found!');
        }
    }

    /**
     * Get the token array structure.
     *
     * @param  string  $token
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        $user = User::find(Auth::id());

        return response()->json([
            'access_token' => $token,
            // 'user' => $user->load('roles.permissions'),
            //only role and permission of the user without loading the entire
            'user' => $user->roles->map(function ($role) {
                return [
                    'id' => $role->uuid,
                    'role_name' => $role->name,
                    'permissions' => $role->permissions->map(function ($permission) {
                        return [
                            'id' => $permission->uuid,
                            'name' => $permission->name,
                        ];
                    }),
                ];
            }),
            'token_type' => 'bearer',
            'expires_in' => Auth::factory()->getTTL() * 60,
        ]);
    }

    public function generateUniqueUsername($name)
    {
        $username = Str::slug($name);
        $existingUser = User::where('username', $username)->first();

        if ($existingUser) {
            $username .= rand(1000, 9999);
        }

        while (User::where('username', $username)->exists()) {
            $username = Str::slug($name) . rand(1000, 1000);
        }

        return $username;
    }

    // change profile image
    public function update_profile_image(Request $request)
    {
        $request->validate([
            'profile_image' => 'required|mimes:png,jpeg,jpg,svg,gif,bmp,bmp,tiff,webp',
        ]);

        $user = User::find(Auth::id());

        if (! empty($user)) {

            if ($request->hasFile('profile_image') && $request->file('profile_image')->isValid()) {
                $user->addMediaFromRequest('profile_image')->toMediaCollection('profile_image');
            }

            return User::find(Auth::id());
        } else {
            abort(404, 'Invalid Token.');
        }
    }

    // remove profile image
    public function remove_profile_image()
    {
        $user = User::find(Auth::id());

        if (! empty($user)) {
            $user->clearMediaCollection('profile_image');

            return User::find(Auth::id());
        } else {
            abort(404, 'Invalid Token.');
        }
    }
}
