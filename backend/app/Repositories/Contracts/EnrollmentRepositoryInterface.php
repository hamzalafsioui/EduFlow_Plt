<?php

namespace App\Repositories\Contracts;

interface EnrollmentRepositoryInterface
{
    public function enroll(int $userId, int $courseId);
    public function withdraw(int $userId, int $courseId);
    public function isEnrolled(int $userId, int $courseId);
    public function getStudentsForCourse(int $courseId);
    public function getTeacherStatistics(int $teacherId);
}
