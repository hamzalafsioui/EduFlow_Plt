<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\CourseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;

class CourseController extends Controller
{
    protected $courseService;

    public function __construct(CourseService $courseService)
    {
        $this->courseService = $courseService;
    }

    /**
     * @OA\Get(
     *     path="/courses/recommended",
     *     summary="Display recommended courses for the authenticated student",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of recommended courses"),
     *     @OA\Response(response=401, description="Unauthenticated")
     * )
     */
    public function recommended()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
        $courses = $this->courseService->getRecommendedCourses($user);
        return response()->json($courses);
    }

    /**
     * @OA\Get(
     *     path="/courses",
     *     summary="Display a listing of courses",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Successful operation")
     * )
     */
    public function index()
    {
        $courses = $this->courseService->getAllCourses();
        return response()->json($courses);
    }

    /**
     * @OA\Post(
     *     path="/courses",
     *     summary="Create a new course (Teacher only)",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title","description","price"},
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="price", type="number", format="float"),
     *             @OA\Property(property="category_id", type="integer", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Course created successfully"),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Course::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $validated['teacher_id'] = Auth::id();

        $course = $this->courseService->createCourse($validated);

        return response()->json($course, 201);
    }

    /**
     * @OA\Get(
     *     path="/courses/{id}",
     *     summary="Display the specified course details",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Successful operation"),
     *     @OA\Response(response=404, description="Course not found")
     * )
     */
    public function show(string $id)
    {
        $course = $this->courseService->getCourseById((int)$id);
        return response()->json($course);
    }

    /**
     * @OA\Put(
     *     path="/courses/{id}",
     *     summary="Update the specified course (Teacher only)",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="price", type="number", format="float"),
     *             @OA\Property(property="category_id", type="integer", nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Course updated successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Course not found")
     * )
     */
    public function update(Request $request, string $id)
    {
        $course = Course::findOrFail($id);
        Gate::authorize('update', $course);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $course = $this->courseService->updateCourse((int)$id, $validated);

        return response()->json($course);
    }

    /**
     * @OA\Delete(
     *     path="/courses/{id}",
     *     summary="Remove the specified course (Teacher only)",
     *     tags={"Courses"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=204, description="Course deleted successfully"),
     *     @OA\Response(response=403, description="Forbidden"),
     *     @OA\Response(response=404, description="Course not found")
     * )
     */
    public function destroy(string $id)
    {
        $course = Course::findOrFail($id);
        Gate::authorize('delete', $course);

        $this->courseService->deleteCourse((int)$id);

        return response()->json(null, 204);
    }
}
