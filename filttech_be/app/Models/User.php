<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject, HasMedia
{
    use HasApiTokens;
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;
    use HasRoles, HasUuids, InteractsWithMedia;

    // 1. Laravel የ Primary Key አይነት ስትሪንግ (UUID) መሆኑን እንዲያውቅ እነዚህን 3 መስመሮች እንጨምራለን
    protected $primaryKey = 'id';
    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'phone_number',
        'username',
        'email',
        'password',
        'status',
        'profession',
        'skills',
        'rating',
    ];

    // 2. የ JWT Identifier እሴትን በግልጽ ወደ String በመቀየር ለ ጥቅሉ እንሰጠዋለን
    public function getJWTIdentifier()
    {
        return (string) $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'otp',
        'current_team_id',
        'deleted_at',
        'media',
        'password',
        'verified_at',
        'status',
        'updated_at',
        'otp_sent_at',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
        'profile_photo_path',
        'need_create_password',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
        'profile_image',
    ];

    public function getProfileImageAttribute()
    {
        return $this->getMedia('profile_image')->last()?->getUrl() ?? $this->profile_photo_url;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'password' => 'hashed',
            'status' => 'boolean',
            'skills' => 'array',
            'rating' => 'decimal:1',
        ];
    }

    // generate unique username
    public static function generateUniqueUsername($name)
    {
        $baseUsername = preg_replace('/\s+/', '', strtolower($name));
        $username = $baseUsername;
        $counter = 1;

        while (self::where('username', $username)->exists()) {
            $username = $baseUsername . $counter;
            $counter++;
        }

        return $username;
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function userExpertInteractions()
    {
        return $this->hasMany(UserExpertInteraction::class, 'expert_id');
    }

    // relation to accepted appointments
    public function acceptedAppointments()
    {
        return $this->hasManyThrough(
            RequestAppointment::class,
            Schedule::class,
            'user_id',      // schedules.user_id
            'schedule_id',  // request_appointments.schedule_id
            'id',           // users.id
            'id'            // schedules.id
        )->where('request_appointments.status', 'accepted');
    }
}