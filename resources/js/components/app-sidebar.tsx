import { Link, usePage } from "@inertiajs/react";
import {
    Activity,
    CheckSquare,
    LayoutGrid,
    Tags,
    User,
    Users,
} from "lucide-react";
import AppLogo from "@/components/app-logo";
import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import type { NavGroup, NavItem } from "@/types";

type SharedProps = {
    currentTeam?: { slug: string };
    userPermissions?: string[];
};

type NavItemWithPermission = NavItem & {
    permission?: string | string[];
    items?: NavItemWithPermission[];
};

type NavGroupWithPermissions = {
    title: string;
    items: NavItemWithPermission[];
};

function filterNavItem(
    item: NavItemWithPermission,
    userPermissions: string[],
): NavItem | null {
    if (item.items && item.items.length > 0) {
        const filteredChildren = item.items
            .map((child) => filterNavItem(child, userPermissions))
            .filter((child): child is NavItem => child !== null);

        if (filteredChildren.length === 0) {
            return null;
        }

        return {
            title: item.title,
            href: item.href ?? "#",
            icon: item.icon,
            items: filteredChildren,
        };
    }

    if (!item.permission) {
        return {
            title: item.title,
            href: item.href ?? "#",
            icon: item.icon,
        };
    }

    const hasPermission = Array.isArray(item.permission)
        ? item.permission.some((p) => userPermissions.includes(p))
        : userPermissions.includes(item.permission);

    if (!hasPermission) {
        return null;
    }

    return {
        title: item.title,
        href: item.href ?? "#",
        icon: item.icon,
    };
}

export function AppSidebar() {
    const page = usePage<SharedProps>();
    const currentTeamSlug = page.props.currentTeam?.slug ?? "";
    const userPermissions = page.props.userPermissions ?? [];
    const { isMobile, setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const dashboardUrl = currentTeamSlug ? dashboard(currentTeamSlug) : "/";

    const allNavGroups: NavGroupWithPermissions[] = [
        {
            title: "Platform",
            items: [
                {
                    title: "Dashboard",
                    href: dashboardUrl,
                    icon: LayoutGrid,
                    permission: "dashboard.view",
                },
                {
                    title: "Daftar Tugas",
                    href: currentTeamSlug ? `/${currentTeamSlug}/todos` : "#",
                    icon: CheckSquare,
                    permission: "todos.view",
                },
                {
                    title: "Kategori",
                    href: currentTeamSlug
                        ? `/${currentTeamSlug}/categories`
                        : "#",
                    icon: Tags,
                    permission: "categories.manage",
                },
            ],
        },
        {
            title: "Profil",
            items: [
                {
                    title: "Akun",
                    href: "/settings/profile",
                    icon: User,
                },
                {
                    title: "Manajemen Tim",
                    href: "#",
                    icon: Users,
                    items: [
                        {
                            title: "Pengaturan Tim",
                            href: currentTeamSlug
                                ? `/settings/teams/${currentTeamSlug}`
                                : "/settings/teams",
                            permission: [
                                "teams.update",
                                "teams.members.manage",
                            ],
                        },
                        {
                            title: "Peran & Izin Tim",
                            href: currentTeamSlug
                                ? `/settings/teams/${currentTeamSlug}/roles`
                                : "/settings/teams",
                            permission: "roles.manage",
                        },
                    ],
                },
            ],
        },
        {
            title: "Monitoring",
            items: [
                {
                    title: "Log Aktivitas",
                    href: currentTeamSlug
                        ? `/${currentTeamSlug}/activity-logs`
                        : "#",
                    icon: Activity,
                    permission: "activity_log.view",
                },
            ],
        },
    ];

    // Dynamically filter nav items per group based on team permissions
    const filteredNavGroups: NavGroup[] = allNavGroups
        .map((group) => ({
            title: group.title,
            items: group.items
                .map((item) => filterNavItem(item, userPermissions))
                .filter((item): item is NavItem => item !== null),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} onClick={handleLinkClick}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
