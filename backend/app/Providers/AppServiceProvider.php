<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\UserRepository;
use App\Repositories\Contracts\CourseRepositoryInterface;
use App\Repositories\CourseRepository;
use App\Repositories\Contracts\WishlistRepositoryInterface;
use App\Repositories\WishlistRepository;
use App\Repositories\Contracts\EnrollmentRepositoryInterface;
use App\Repositories\EnrollmentRepository;
use App\Repositories\Contracts\GroupRepositoryInterface;
use App\Repositories\GroupRepository;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(CourseRepositoryInterface::class, CourseRepository::class);
        $this->app->bind(WishlistRepositoryInterface::class, WishlistRepository::class);
        $this->app->bind(EnrollmentRepositoryInterface::class, EnrollmentRepository::class);
        $this->app->bind(GroupRepositoryInterface::class, GroupRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
