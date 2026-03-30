<?php

namespace App\Services;

use App\Repositories\Contracts\WishlistRepositoryInterface;

class WishlistService
{
    protected $wishlistRepository;

    public function __construct(WishlistRepositoryInterface $wishlistRepository)
    {
        $this->wishlistRepository = $wishlistRepository;
    }

    public function getWishlist($user)
    {
        if (!$user->isStudent()) {
            return collect();
        }

        return $this->wishlistRepository->getWishlist($user->id);
    }

    public function toggleWishlist($user, int $courseId)
    {
        if (!$user->isStudent()) {
            return false;
        }

        if ($this->wishlistRepository->has($user->id, $courseId)) {
            return $this->wishlistRepository->remove($user->id, $courseId);
        }

        return $this->wishlistRepository->add($user->id, $courseId);
    }
}
