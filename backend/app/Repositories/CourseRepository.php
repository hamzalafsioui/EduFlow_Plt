<?php

namespace App\Repositories;

use App\Models\Course;
use App\Repositories\Contracts\CourseRepositoryInterface;
use App\Models\User;

class CourseRepository implements CourseRepositoryInterface
{
    public function all(?User $user = null)
    {
        $courses = Course::with(['teacher', 'category'])->get();

        if ($user && $user->isStudent()) {
            $enrolledIds = $user->enrolledCourses()->pluck('courses.id')->flip();
            $courses->each(function ($course) use ($enrolledIds) {
                $course->enrollment_status = $enrolledIds->has($course->id) ? 'confirmed' : null;
            });
        }

        return $courses;
    }

    public function find(int $id)
    {
        return Course::with(['teacher', 'category'])->findOrFail($id);
    }

    public function create(array $data)
    {
        return Course::create($data);
    }

    public function update(int $id, array $data)
    {
        $course = Course::findOrFail($id);
        $course->update($data);
        return $course;
    }

    public function delete(int $id)
    {
        $course = Course::findOrFail($id);
        return $course->delete();
    }

    public function getRecommended(array $categoryIds)
    {
        return Course::with(['teacher', 'category'])
            ->whereIn('category_id', $categoryIds)
            ->get();
    }
}
