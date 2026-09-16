<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\Auth\GoogleController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PresignedUploadController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Controllers\TodoController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('auth/google', [GoogleController::class, 'redirect'])->name('auth.google');
Route::get('auth/google/callback', [GoogleController::class, 'callback'])->name('auth.google.callback');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');

        // Todo routes
        Route::resource('todos', TodoController::class);
        Route::patch('todos/{todo}/toggle-status', [TodoController::class, 'toggleStatus'])->name('todos.toggle-status');
        Route::patch('todos/{todo}/items/{item}/toggle', [TodoController::class, 'toggleItem'])->name('todos.toggle-item');

        // Category routes
        Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);

        // Activity Log Audit Trail
        Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('api/notifications/dropdown', [NotificationController::class, 'dropdown'])->name('notifications.dropdown');
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

    Route::post('upload/presigned-url', [PresignedUploadController::class, 'generateUrl'])->name('upload.presigned-url');
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

Route::put('upload/local/{uuid}/{filename}', [PresignedUploadController::class, 'uploadLocal'])->name('upload.local');

require __DIR__.'/settings.php';
