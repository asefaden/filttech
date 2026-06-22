<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UserExpertInteraction extends Model
{
    use HasUuids;
    protected $fillable = [
        'user_id',
        'expert_id',
        'rating',
    ];

    protected $casts = [
        'rating' => 'decimal:1',
    ];


    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function expert()
    {
        return $this->belongsTo(User::class, 'expert_id');
    }

    public function getRatingAttribute($value)
    {
        return (float) $value;
    }
}
