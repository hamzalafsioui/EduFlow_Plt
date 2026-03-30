<?php

namespace App\Repositories;

use App\Models\Course;
use App\Repositories\Contracts\CourseRepositoryInterface;

class CourseRepository implements CourseRepositoryInterface
{
    public function all()
    {
        return Course::with(['teacher', 'category'])->get();
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
