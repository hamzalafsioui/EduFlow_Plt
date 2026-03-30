<?php

namespace App\Services;

use App\Repositories\Contracts\GroupRepositoryInterface;
use Exception;

class GroupService
{
    protected $groupRepository;

    const MAX_GROUP_SIZE = 25;

    public function __construct(GroupRepositoryInterface $groupRepository)
    {
        $this->groupRepository = $groupRepository;
    }

    public function assignStudentToGroup(int $userId, int $courseId): void
    {
        $group = $this->groupRepository->findAvailableGroupForCourse($courseId, self::MAX_GROUP_SIZE);

        if (!$group) {
            $group = $this->groupRepository->createGroupForCourse($courseId);
        }

        $this->groupRepository->addStudentToGroup($group->id, $userId);
    }

    public function getCourseGroups($user, $course)
    {
        if (!$user->isTeacher() || $course->teacher_id !== $user->id) {
            throw new Exception("Unauthorized access.");
        }

        return $this->groupRepository->getGroupsForCourse($course->id);
    }

    public function getGroupStudents($user, $course, int $groupId)
    {
        if (!$user->isTeacher() || $course->teacher_id !== $user->id) {
            throw new Exception("Unauthorized access.");
        }

        return $this->groupRepository->getStudentsInGroup($groupId);
    }
}
