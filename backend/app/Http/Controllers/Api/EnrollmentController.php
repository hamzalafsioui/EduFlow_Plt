<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\EnrollmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Exception;

class EnrollmentController extends Controller
{
    protected $enrollmentService;

    public function __construct(EnrollmentService $enrollmentService)
    {
        $this->enrollmentService = $enrollmentService;
    }

    /**
     * @OA\Post(
     *     path="/courses/{courseId}/checkout",
     *     summary="Create a Stripe checkout session for a course",
     *     tags={"Enrollments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="courseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="Returns checkout URL"),
     *     @OA\Response(response=400, description="Error creating session")
     * )
     */
    public function checkout(string $courseId)
    {
        try {
            $user = Auth::user();
            $course = Course::findOrFail((int)$courseId);
            $url = $this->enrollmentService->createCheckoutSession($user, $course);
            return response()->json(['checkout_url' => $url]);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * @OA\Get(
     *     path="/courses/{courseId}/enroll/success",
     *     summary="Confirm enrollment after successful payment",
     *     tags={"Enrollments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="courseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="session_id",
     *         in="query",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="Enrollment successful"),
     *     @OA\Response(response=400, description="Enrollment failed")
     * )
     */
    public function success(string $courseId, Request $request)
    {
        try {
            $sessionId = $request->query('session_id');
            if (!$sessionId) {
                return response()->json(['error' => 'Missing session_id.'], 400);
            }
            $this->enrollmentService->confirmEnrollmentBySession($sessionId);
            // Redirect to root so the static server always serves index.html.
            $frontendUrl = env('FRONTEND_URL', 'http://127.0.0.1:5173');
            return redirect($frontendUrl . '/frontend/index.html?enrolled=success#/my-enrollments');
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * @OA\Delete(
     *     path="/courses/{courseId}/enroll",
     *     summary="Withdraw from an enrolled course",
     *     tags={"Enrollments"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="courseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="Successfully withdrawn"),
     *     @OA\Response(response=403, description="Action not allowed")
     * )
     */
    public function withdraw(string $courseId)
    {
        try {
            $user = Auth::user();
            $success = $this->enrollmentService->withdraw($user, (int)$courseId);
            if ($success) {
                return response()->json(['message' => 'Successfully withdrawn from course.']);
            }
            return response()->json(['error' => 'Action allowed for students only.'], 403);
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
