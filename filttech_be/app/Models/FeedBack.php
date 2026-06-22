<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class FeedBack extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'message',
        'rating',
        'is_featured',
    ];

    protected $casts = [
        'rating' => 'float',
        'is_featured' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
