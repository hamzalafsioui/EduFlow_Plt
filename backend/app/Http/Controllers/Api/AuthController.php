<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * @OA\Post(
     *     path="/auth/register",
     *     summary="Register a new user",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation","role"},
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="password_confirmation", type="string", format="password"),
     *             @OA\Property(property="role", type="string", enum={"student","teacher"}),
     *             @OA\Property(property="interests", type="array", @OA\Items(type="integer"), description="Required if role is student")
     *         )
     *     ),
     *     @OA\Response(response=201, description="User successfully registered"),
     *     @OA\Response(response=400, description="Validation Error")
     * )
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:student,teacher',
            'interests' => 'required_if:role,student|array',
            'interests.*' => 'exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        $user = $this->authService->register($request->all());

        return response()->json([
            'message' => 'User successfully registered',
            'user' => $user
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/auth/login",
     *     summary="Authenticate user and obtain JWT token",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Successfully logged in"),
     *     @OA\Response(response=401, description="Unauthorized"),
     *     @OA\Response(response=422, description="Validation Error")
     * )
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (!$tokenResponse = $this->authService->login($request->only('email', 'password'))) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json($tokenResponse);
    }

    /**
     * @OA\Post(
     *     path="/auth/logout",
     *     summary="Log the user out (Invalidate the token)",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="User successfully signed out")
     * )
     */
    public function logout()
    {
        $this->authService->logout();
        return response()->json(['message' => 'User successfully signed out']);
    }

    /**
     * @OA\Post(
     *     path="/auth/refresh",
     *     summary="Refresh JWT token",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Token refreshed")
     * )
     */
    public function refresh()
    {
        return response()->json($this->authService->refresh());
    }

    /**
     * @OA\Get(
     *     path="/auth/me",
     *     summary="Get authenticated user profile",
     *     tags={"Authentication"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="User profile data")
     * )
     */
    public function userProfile()
    {
        return response()->json($this->authService->getProfile());
    }
}
