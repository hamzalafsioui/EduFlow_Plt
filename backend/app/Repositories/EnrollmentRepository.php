<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\Course;
use App\Repositories\Contracts\EnrollmentRepositoryInterface;

class EnrollmentRepository implements EnrollmentRepositoryInterface
{
    public function enroll(int $userId, int $courseId)
    {
        $user = User::findOrFail($userId);
        $user->enrolledCourses()->syncWithoutDetaching([$courseId]);
        return true;
    }

    public function withdraw(int $userId, int $courseId)
    {
        $user = User::findOrFail($userId);
        $user->enrolledCourses()->detach($courseId);
        return true;
    }

    public function isEnrolled(int $userId, int $courseId)
    {
        $user = User::findOrFail($userId);
        return $user->enrolledCourses()->where('course_id', $courseId)->exists();
    }

    public function getStudentsForCourse(int $courseId)
    {
        $course = Course::findOrFail($courseId);
        return $course->students()->get();
    }

    public function getTeacherStatistics(int $teacherId)
    {
        $courses = Course::withCount('students')->where('teacher_id', $teacherId)->get();
        
        $totalCourses = $courses->count();
        $totalStudents = $courses->sum('students_count');
        
        $totalRevenue = $courses->reduce(function ($carry, $course) {
            return $carry + ($course->price * $course->students_count);
        }, 0);

        return [
            'total_courses' => $totalCourses,
            'total_students' => $totalStudents,
            'total_revenue' => $totalRevenue,
        ];
    }
}
