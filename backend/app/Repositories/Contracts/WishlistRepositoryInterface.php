<?php

namespace App\Repositories\Contracts;

interface WishlistRepositoryInterface
{
    public function getWishlist(int $userId);
    public function add(int $userId, int $courseId);
    public function remove(int $userId, int $courseId);
    public function has(int $userId, int $courseId);
}
