<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ApplySchoolController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ExpertController;
use App\Http\Controllers\ExpertDashboardController;
use App\Http\Controllers\ExpertRatingController;
use App\Http\Controllers\FacebookAuthController;
use App\Http\Controllers\FeedBackController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OTPController;
use App\Http\Controllers\PlaylistController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ResetPasswordController;
use App\Http\Controllers\RequestAppointmentController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SevedJobController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserCourseIntractionController;
use App\Http\Controllers\UserExpertInteractionController;
use App\Http\Controllers\UserIntractionController;
use App\Http\Controllers\UserSectionIntractionController;
use Illuminate\Support\Facades\Route;

Route::group([
    'middleware' => 'api',
], function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('subscribe', [AuthController::class, 'register']);
    Route::post('unsubscribe', [AuthController::class, 'unsubscribe']);



    /**
     *  Guest Routes
     */
    Route::get('top-categories', [GuestController::class, 'topCategories']);
    Route::get('popular-courses', [GuestController::class, 'popularCourses']);
    Route::get('popular-experts', [GuestController::class, 'popularExperts']);
    Route::get('latest-posts', [GuestController::class, 'guestPosts']);

    Route::post('contacts', [ContactController::class, 'store']);
    Route::get('feed-backs', [FeedBackController::class, 'index']);


    /**
     *  Other AuthController routes
     */
    Route::post('create-password', [AuthController::class, 'create_password'])->middleware('auth:api');
    Route::post('update-profile-image', [AuthController::class, 'update_profile_image'])->middleware('auth:api');
    Route::post('remove-profile-image', [AuthController::class, 'remove_profile_image'])->middleware('auth:api');

    Route::post('update-profile', [AuthController::class, 'update_profile'])->middleware('auth:api');

    Route::post('reset-password', [ResetPasswordController::class, 'reset_password']);
    Route::post('change-password', [ResetPasswordController::class, 'change_password'])->middleware('auth:api');

    Route::post('verify-otp', [OTPController::class, 'verify_otp']);
    Route::post('resend-otp', [OTPController::class, 'resend_otp']);

    Route::group([
        'middleware' => 'auth:api',
    ], function () {



        /**
         * Common Endpoints */
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/my-profile', [AuthController::class, 'profile']);

        Route::get('my-activity-logs', [ActivityLogController::class, 'myActivityLog']);


        Route::post('test-notification', [NotificationController::class, 'testNotification']);

        Route::get('my-notifications', [NotificationController::class, 'getNotification']);
        Route::post('read-all-notifications', [NotificationController::class, 'readNotifications']);
        Route::post('read-notification/{id}', [NotificationController::class, 'readNotification']);


        /**
         * Admin Endpoints */

        Route::group([
            'middleware' => 'role:Admin',
        ], function () {

            Route::get('get-activity-logs', [ActivityLogController::class, 'index']);
        });

        /**
         * Expert Endpoints */
        Route::group([
            'middleware' => 'role:Expert',
        ], function () {
            Route::apiResource('schedules', ScheduleController::class);
            Route::get('schedules-by-date', [ScheduleController::class, 'getSchadulesByDate']);
            Route::get('today-sessions', [ScheduleController::class, 'getTodaySessions']);
            Route::get('appointment-requests', [RequestAppointmentController::class, 'index']);
            Route::put('appointment-requests/{requestAppointment}/update-status', [RequestAppointmentController::class, 'update']);
            Route::get('appointment-requests/status-overview', [RequestAppointmentController::class, 'statusOverview']);

            /**
             * Expert Dashboard
             */

            Route::get('expert-dashboard/status-overview', [ExpertDashboardController::class, 'getStatusOverview']);
            Route::get('expert-dashboard/upcoming-appointments', [ExpertDashboardController::class, 'getUpcomingAppointments']);
            Route::get('expert-dashboard/new-appointments', [ExpertDashboardController::class, 'newAppointments']);
            Route::get('expert-dashboard/recent-activity', [ExpertDashboardController::class, 'recentActivity']);
            Route::get('expert-dashboard/rating', [ExpertRatingController::class, 'rating']);
        });

        Route::post('feed-backs', [FeedBackController::class, 'store']);

        Route::apiResource('categories', CategoryController::class);

        Route::apiResource('courses', CourseController::class);
        Route::get('user/popular-courses', [CourseController::class, 'popularCourses']);

        Route::apiResource('sections', SectionController::class);
        Route::get('section-comments/{section}', [SectionController::class, 'getComments']);

        Route::apiResource('posts', PostController::class);
        Route::apiResource('books', BookController::class);
        Route::apiResource('experts', ExpertController::class);
        Route::get('experts/{expert}/schedules', [ExpertController::class, 'getScheduleByExpert']);
        Route::get('experts/appointment/{requestAppointment}', [ExpertController::class, 'getExpertByAppointmentId']);
        Route::get('available-time', [ExpertController::class, 'availableTime']);
        Route::post('send-appointment-request', [RequestAppointmentController::class, 'store']);

        Route::apiResource('user-course-intraction', UserCourseIntractionController::class);
        Route::post('user-course-intraction/rate', [UserCourseIntractionController::class, 'rateCourse']);
        Route::post('user-course-intraction/favorite', [UserCourseIntractionController::class, 'toggleFavoriteCourse']);
        Route::get('user-course-intraction/course/{courseId}', [UserCourseIntractionController::class, 'getUserCourseIntraction']);
        Route::apiResource('user-section-intraction', UserSectionIntractionController::class);
        Route::apiResource('user-expert-intraction', UserExpertInteractionController::class);
        Route::get('experts/{expert}/my-rating', [UserExpertInteractionController::class, 'getMyRating']);
    });
});
