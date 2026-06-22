<?php

namespace App\Models;

use Illuminate\Container\Attributes\Auth;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Section extends Model implements HasMedia
{
    use HasUuids, InteractsWithMedia, HasFactory;

    protected $fillable = [
        'course_id',
        'name',
        'introduction',
        'description',
        'example',
        'example_explanation',
        'likes',
        'rating',
        'review',
    ];

    protected $appends = [
        'thumbnail',
        'video',
    ];
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function intractions()
    {
        return $this->hasMany(UserSectionIntraction::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('thumbnail')->singleFile();
        $this->addMediaCollection('video')->singleFile();
    }

    public function getThumbnailAttribute()
    {
        return $this->getMedia('thumbnail')->last()?->getUrl() ?? null;
    }

    public function getVideoAttribute()
    {
        return $this->getMedia('video')->last()?->getUrl() ?? null;
    }

}
