<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UserCourseIntraction extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'course_id',
        'rating',
        'is_favorite',
    ];

    protected $casts = [
        'rating' => 'float',
        'is_favorite' => 'boolean',
    ];

    protected $appends = [
        'rating_formatted',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function getRatingFormattedAttribute()
    {
        return number_format($this->getRawOriginal('rating'), 2);
    }
}
