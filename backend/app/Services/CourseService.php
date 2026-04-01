<?php

namespace App\Services;

use App\Repositories\Contracts\CourseRepositoryInterface;
use App\Models\User;

class CourseService
{
    protected $courseRepository;

    public function __construct(CourseRepositoryInterface $courseRepository)
    {
        $this->courseRepository = $courseRepository;
    }

    public function getAllCourses(?User $user = null)
    {
        return $this->courseRepository->all($user);
    }

    public function getCourseById(int $id)
    {
        return $this->courseRepository->find($id);
    }

    public function createCourse(array $data)
    {
        return $this->courseRepository->create($data);
    }

    public function updateCourse(int $id, array $data)
    {
        return $this->courseRepository->update($id, $data);
    }

    public function deleteCourse(int $id)
    {
        return $this->courseRepository->delete($id);
    }

    public function getRecommendedCourses($user)
    {
        if (!$user->isStudent()) {
            return collect([]);
        }

        $interestIds = $user->interests()->pluck('categories.id')->toArray();

        if (empty($interestIds)) {
            return collect([]);
        }

        return $this->courseRepository->getRecommended($interestIds);
    }
}
