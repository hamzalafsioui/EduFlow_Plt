<?php

namespace App\Repositories\Contracts;

interface GroupRepositoryInterface
{
    public function findAvailableGroupForCourse(int $courseId, int $maxSize = 25): ?\App\Models\Group;
    public function createGroupForCourse(int $courseId): \App\Models\Group;
    public function addStudentToGroup(int $groupId, int $userId): void;
    public function getGroupsForCourse(int $courseId);
    public function getStudentsInGroup(int $groupId);
}
