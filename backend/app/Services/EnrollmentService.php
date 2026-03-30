<?php

namespace App\Services;

use App\Repositories\Contracts\EnrollmentRepositoryInterface;
use App\Services\GroupService;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Exception;

class EnrollmentService
{
    protected $enrollmentRepository;
    protected $groupService;

    public function __construct(
        EnrollmentRepositoryInterface $enrollmentRepository,
        GroupService $groupService
    ) {
        $this->enrollmentRepository = $enrollmentRepository;
        $this->groupService = $groupService;
    }

    public function createCheckoutSession($user, $course)
    {
        if (!$user->isStudent()) {
            throw new Exception("Only students can enroll in courses.");
        }

        if ($this->enrollmentRepository->isEnrolled($user->id, $course->id)) {
            throw new Exception("Student is already enrolled.");
        }

        Stripe::setApiKey(env('STRIPE_SECRET', 'sk_test_simulated'));

        $domain = env('APP_URL', 'http://127.0.0.1:8000');

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'usd',
                    'unit_amount' => $course->price * 100, // Stripe expects cents
                    'product_data' => [
                        'name' => $course->title,
                        'description' => $course->description,
                    ],
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $domain . '/api/courses/' . $course->id . '/enroll/success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $domain . '/courses',
            'metadata' => [
                'course_id' => $course->id,
                'user_id' => $user->id,
            ]
        ]);

        return $session->url;
    }

    public function confirmEnrollment($user, $courseId)
    {
        $this->enrollmentRepository->enroll($user->id, $courseId);
        $this->groupService->assignStudentToGroup($user->id, $courseId);
        return true;
    }

    public function withdraw($user, $courseId)
    {
        if (!$user->isStudent()) {
            return false;
        }

        return $this->enrollmentRepository->withdraw($user->id, $courseId);
    }

    public function getCourseStudents($user, $course)
    {
        if (!$user->isTeacher() || $course->teacher_id !== $user->id) {
            throw new Exception("Unauthorized access.");
        }

        return $this->enrollmentRepository->getStudentsForCourse($course->id);
    }

    public function getTeacherStatistics($user)
    {
        if (!$user->isTeacher()) {
            throw new Exception("Unauthorized access.");
        }

        return $this->enrollmentRepository->getTeacherStatistics($user->id);
    }
}
