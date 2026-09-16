<?php

namespace App\Enums;

enum TeamPermission: string
{
    case DashboardView = 'dashboard.view';

    case UpdateTeam = 'teams.update';
    case DeleteTeam = 'teams.delete';

    case ManageMembers = 'teams.members.manage';
    case ManageInvitations = 'teams.invitations.manage';
    case ManageRoles = 'roles.manage';

    case ViewTodos = 'todos.view';
    case CreateTodos = 'todos.create';
    case UpdateTodos = 'todos.update';
    case DeleteTodos = 'todos.delete';

    case ManageCategories = 'categories.manage';
    case ViewActivityLog = 'activity_log.view';
    case AccessAdminDashboard = 'admin.dashboard.access';
}
