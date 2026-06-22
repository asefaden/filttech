<?php

namespace App\Models;

use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Course extends Model implements HasMedia
{
    use HasUuids, InteractsWithMedia, HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'rating',
    ];

    protected $casts = [
        'rating' => 'float',
    ];

    protected $appends = [
        'thumbnail',
        'is_favorite',
        'is_rated',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function sections()
    {
        return $this->hasMany(Section::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('thumbnail')->singleFile();
    }

    public function getThumbnailAttribute()
    {
        return $this->getMedia('thumbnail')->last()?->getUrl() ?? null;
    }

    public function intractions()
    {
        return $this->hasMany(UserCourseIntraction::class);
    }

    public function getIsFavoriteAttribute()
    {
        return $this->intractions()->where('user_id', Auth::id())->where('is_favorite', true)->exists();
    }

    public function getIsRatedAttribute()
    {
        return $this->intractions()->where('user_id', Auth::id())->where('rating', '>', 0)->exists();
    }
}
