<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\EnrollmentService;
use App\Services\GroupService;
use Illuminate\Support\Facades\Auth;
use Exception;

class TeacherController extends Controller
{
    protected $enrollmentService;
    protected $groupService;

    public function __construct(EnrollmentService $enrollmentService, GroupService $groupService)
    {
        $this->enrollmentService = $enrollmentService;
        $this->groupService = $groupService;
    }

    /**
     * @OA\Get(
     *     path="/teacher/courses/{courseId}/students",
     *     summary="List students enrolled in a course (Teacher only)",
     *     tags={"Teacher"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="courseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="List of students"),
     *     @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function courseStudents(string $courseId)
    {
        try {
            $user = Auth::user();
            $course = Course::findOrFail((int)$courseId);
            $students = $this->enrollmentService->getCourseStudents($user, $course);
            return response()->json($students);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    /**
     * @OA\Get(
     *     path="/teacher/statistics",
     *     summary="Get teacher course and enrollment statistics",
     *     tags={"Teacher"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Teacher statistics data"),
     *     @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function statistics()
    {
        try {
            $user = Auth::user();
            $stats = $this->enrollmentService->getTeacherStatistics($user);
            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    /**
     * @OA\Get(
     *     path="/teacher/courses/{courseId}/groups",
     *     summary="List all auto-assigned groups for a course",
     *     tags={"Teacher"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="courseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="List of groups")
     * )
     */
    public function courseGroups(string $courseId)
    {
        try {
            $user = Auth::user();
            $course = Course::findOrFail((int)$courseId);
            $groups = $this->groupService->getCourseGroups($user, $course);
            return response()->json($groups);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    /**
     * @OA\Get(
     *     path="/teacher/courses/{courseId}/groups/{groupId}/students",
     *     summary="List students within a specific group",
     *     tags={"Teacher"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="courseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="groupId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="List of students in the group")
     * )
     */
    public function groupStudents(string $courseId, string $groupId)
    {
        try {
            $user = Auth::user();
            $course = Course::findOrFail((int)$courseId);
            $students = $this->groupService->getGroupStudents($user, $course, (int)$groupId);
            return response()->json($students);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }
}
