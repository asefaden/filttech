<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Schedule extends Model
{
    use HasUuids;
    protected $fillable = [
        'user_id',
        'date',
        'from_time',
        'to_time',
        'status',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    protected $appends = [
        'from_time_formatted',
        'to_time_formatted',
        'is_requested',
    ];

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function requests()
    {
        return $this->hasMany(RequestAppointment::class, 'schedule_id');
    }

    public function appointments()
    {
        return $this->hasMany(RequestAppointment::class, 'schedule_id')->where('status', 'accepted');
    }

    public function getIsRequestedAttribute()
    {
        return $this->requests()->where('user_id', Auth::id())->exists();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getFromTimeFormattedAttribute()
    {
        return Carbon::parse($this->from_time)->format('h:i A');
    }

    public function getToTimeFormattedAttribute()
    {
        return Carbon::parse($this->to_time)->format('h:i A');
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
            }
        });
    }
}
