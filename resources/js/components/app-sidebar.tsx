import { Link, usePage } from '@inertiajs/react';
import { Activity, CheckSquare, LayoutGrid, Tags, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

type SharedProps = {
    currentTeam?: { slug: string };
    userPermissions?: string[];
};

export function AppSidebar() {
    const page = usePage<SharedProps>();
    const currentTeamSlug = page.props.currentTeam?.slug ?? '';
    const userPermissions = page.props.userPermissions ?? [];

    const dashboardUrl = currentTeamSlug ? dashboard(currentTeamSlug) : '/';

    const allNavItems: (NavItem & { permission?: string | string[] })[] = [
        {
            title: 'Dashboard',
            href: dashboardUrl,
            icon: LayoutGrid,
            permission: 'dashboard.view',
        },
        {
            title: 'Todos',
            href: currentTeamSlug ? `/${currentTeamSlug}/todos` : '#',
            icon: CheckSquare,
            permission: 'todos.view',
        },
        {
            title: 'Categories',
            href: currentTeamSlug ? `/${currentTeamSlug}/categories` : '#',
            icon: Tags,
            permission: 'categories.manage',
        },
        {
            title: 'Team',
            href: currentTeamSlug
                ? `/settings/teams/${currentTeamSlug}`
                : '/settings/teams',
            icon: Users,
            permission: [
                'teams.update',
                'teams.members.manage',
                'roles.manage',
            ],
        },
        {
            title: 'Audit Trail',
            href: currentTeamSlug ? `/${currentTeamSlug}/activity-logs` : '#',
            icon: Activity,
            permission: 'activity_log.view',
        },
    ];

    // Dynamically filter main menu items based on team permissions
    const mainNavItems: NavItem[] = allNavItems.filter((item) => {
        if (!item.permission) return true;
        if (Array.isArray(item.permission)) {
            return item.permission.some((p) => userPermissions.includes(p));
        }
        return userPermissions.includes(item.permission);
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
