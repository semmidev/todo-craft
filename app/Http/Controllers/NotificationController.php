<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display notifications list page or JSON items.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->paginate(20)
            ->through(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? 'info',
                    'title' => $notification->data['title'] ?? 'Notifikasi',
                    'message' => $notification->data['message'] ?? '',
                    'action_url' => $notification->data['action_url'] ?? null,
                    'read_at' => $notification->read_at?->toIso8601String(),
                    'created_at' => $notification->created_at?->diffForHumans(),
                    'created_at_iso' => $notification->created_at?->toIso8601String(),
                    'data' => $notification->data,
                ];
            });

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'notifications' => $notifications,
                'unread_count' => $user->unreadNotifications()->count(),
            ]);
        }

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'unreadCount' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Get recent unread count and latest 5 notifications for header dropdown.
     */
    public function dropdown(Request $request): JsonResponse
    {
        $user = $request->user();

        $recentNotifications = $user->notifications()
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? 'info',
                    'title' => $notification->data['title'] ?? 'Notifikasi',
                    'message' => $notification->data['message'] ?? '',
                    'action_url' => $notification->data['action_url'] ?? null,
                    'read_at' => $notification->read_at?->toIso8601String(),
                    'created_at' => $notification->created_at?->diffForHumans(),
                    'created_at_iso' => $notification->created_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'unread_count' => $user->unreadNotifications()->count(),
            'notifications' => $recentNotifications,
        ]);
    }

    /**
     * Mark single notification as read.
     */
    public function markAsRead(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        return back();
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): RedirectResponse|JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Semua notifikasi ditandai telah dibaca.')]);

        return back();
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, string $id): RedirectResponse|JsonResponse
    {
        $notification = $request->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->delete();

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['success' => true]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Notifikasi berhasil dihapus.')]);

        return back();
    }
}
