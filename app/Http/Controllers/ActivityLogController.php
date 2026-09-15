<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ActivityLogController extends Controller
{
    public function index(Request $request, Team $currentTeam): Response
    {
        abort_unless(
            $request->user()->ownsTeam($currentTeam) || $request->user()->hasTeamPermission($currentTeam, 'activity_log.view'),
            403,
            __('Anda tidak memiliki izin untuk melihat log riwayat aktivitas.')
        );

        $query = QueryBuilder::for(Activity::class)
            ->with('causer')
            ->allowedFilters(
                AllowedFilter::exact('log_name'),
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('description', 'like', "%{$value}%")
                            ->orWhere('log_name', 'like', "%{$value}%")
                            ->orWhere('subject_type', 'like', "%{$value}%")
                            ->orWhereHasMorph('causer', ['App\Models\User'], function ($q) use ($value) {
                                $q->where('name', 'like', "%{$value}%")
                                    ->orWhere('email', 'like', "%{$value}%");
                            });
                    });
                }),
            )
            ->allowedSorts('id', 'created_at', 'description', 'log_name', 'subject_type')
            ->defaultSort('-id');

        $perPage = min(max((int) $request->input('per_page', 15), 5), 100);

        $activities = $query->paginate($perPage)
            ->withQueryString()
            ->through(fn ($act) => [
                'id' => $act->id,
                'log_name' => $act->log_name ?? 'default',
                'description' => $act->description,
                'subject_type' => $act->subject_type ? class_basename($act->subject_type) : '',
                'subject_id' => $act->subject_id,
                'causer' => $act->causer ? [
                    'id' => $act->causer->id,
                    'name' => $act->causer->name,
                    'email' => $act->causer->email,
                ] : null,
                'properties' => $act->properties,
                'created_at' => $act->created_at?->toIso8601String(),
            ]);

        $logNames = Activity::distinct()->pluck('log_name')->filter()->values();

        return Inertia::render('activity-logs/index', [
            'activities' => $activities,
            'filters' => $request->input('filter', []),
            'sort' => $request->input('sort', '-id'),
            'logNames' => $logNames,
        ]);
    }
}
