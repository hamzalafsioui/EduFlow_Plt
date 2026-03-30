<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Course;
use App\Repositories\Contracts\WishlistRepositoryInterface;

class WishlistRepository implements WishlistRepositoryInterface
{
    public function getWishlist(int $userId)
    {
        $user = User::findOrFail($userId);
        return $user->wishlistCourses()->with(['category', 'teacher'])->get();
    }

    public function add(int $userId, int $courseId)
    {
        $user = User::findOrFail($userId);
        $user->wishlistCourses()->syncWithoutDetaching([$courseId]);
        return true;
    }

    public function remove(int $userId, int $courseId)
    {
        $user = User::findOrFail($userId);
        $user->wishlistCourses()->detach($courseId);
        return true;
    }

    public function has(int $userId, int $courseId)
    {
        $user = User::findOrFail($userId);
        return $user->wishlistCourses()->where('course_id', $courseId)->exists();
    }
}
