<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UserSectionIntraction extends Model
{
    use HasUuids;
    protected $fillable = [
        'user_id',
        'section_id',
        'comment',
    ];

    protected $appends = [
        'is_liked',
        'is_rated',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function section()
    {
        return $this->belongsTo(Section::class);
    }
}
