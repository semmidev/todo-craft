<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request, Team $currentTeam): Response
    {
        abort_unless(
            $request->user()->ownsTeam($currentTeam) || $request->user()->hasTeamPermission($currentTeam, 'activity_log.view'),
            403,
            __('You do not have permission to view activity logs.')
        );

        $activities = Activity::with('causer')
            ->latest()
            ->paginate(20)
            ->through(fn ($act) => [
                'id' => $act->id,
                'log_name' => $act->log_name,
                'description' => $act->description,
                'subject_type' => class_basename($act->subject_type ?? ''),
                'subject_id' => $act->subject_id,
                'causer' => $act->causer ? [
                    'id' => $act->causer->id,
                    'name' => $act->causer->name,
                    'email' => $act->causer->email,
                ] : null,
                'properties' => $act->properties,
                'created_at' => $act->created_at->diffForHumans(),
            ]);

        return Inertia::render('activity-logs/index', [
            'activities' => $activities,
        ]);
    }
}
