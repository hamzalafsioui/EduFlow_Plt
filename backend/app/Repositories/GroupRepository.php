<?php

namespace App\Repositories;

use App\Models\Group;
use App\Repositories\Contracts\GroupRepositoryInterface;

class GroupRepository implements GroupRepositoryInterface
{
    public function findAvailableGroupForCourse(int $courseId, int $maxSize = 25): ?Group
    {
        return Group::where('course_id', $courseId)
            ->withCount('students')
            ->get()
            ->first(fn($group) => $group->students_count < $maxSize);
    }

    public function createGroupForCourse(int $courseId): Group
    {
        $count = Group::where('course_id', $courseId)->count();
        return Group::create([
            'course_id' => $courseId,
            'name' => 'Group ' . ($count + 1),
        ]);
    }

    public function addStudentToGroup(int $groupId, int $userId): void
    {
        $group = Group::findOrFail($groupId);
        $group->students()->syncWithoutDetaching([$userId]);
    }

    public function getGroupsForCourse(int $courseId)
    {
        return Group::withCount('students')
            ->where('course_id', $courseId)
            ->orderBy('id')
            ->get();
    }

    public function getStudentsInGroup(int $groupId)
    {
        $group = Group::findOrFail($groupId);
        return $group->students()->get();
    }
}
