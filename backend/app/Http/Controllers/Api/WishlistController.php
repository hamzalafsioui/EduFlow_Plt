<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\WishlistService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WishlistController extends Controller
{
    protected $wishlistService;

    public function __construct(WishlistService $wishlistService)
    {
        $this->wishlistService = $wishlistService;
    }

    /**
     * @OA\Get(
     *     path="/wishlist",
     *     summary="Retrieve student's wishlist courses",
     *     tags={"Wishlist"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="List of wishlisted courses")
     * )
     */
    public function index()
    {
        $user = Auth::user();
        $wishlist = $this->wishlistService->getWishlist($user);

        return response()->json($wishlist);
    }

    /**
     * @OA\Post(
     *     path="/wishlist/courses/{courseId}",
     *     summary="Toggle a course in the wishlist",
     *     tags={"Wishlist"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="courseId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(response=200, description="Wishlist toggled successfully"),
     *     @OA\Response(response=403, description="Unauthorized")
     * )
     */
    public function toggle(string $courseId)
    {
        $user = Auth::user();
        
        $success = $this->wishlistService->toggleWishlist($user, (int)$courseId);

        if (!$success) {
            return response()->json(['error' => 'Action not allowed'], 403);
        }

        return response()->json([
            'message' => 'Wishlist updated successfully'
        ]);
    }
}
