import { Link, usePage } from '@inertiajs/react';
import { Shield, Users } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

type SharedProps = {
    currentTeam?: { slug: string; name: string };
};

export default function TeamLayout({ children }: PropsWithChildren) {
    const page = usePage<SharedProps>();
    const currentTeamSlug = page.props.currentTeam?.slug ?? '';
    const { isCurrentUrl } = useCurrentUrl();

    const teamNavItems: NavItem[] = [
        {
            title: 'Team Settings',
            href: currentTeamSlug
                ? `/settings/teams/${currentTeamSlug}`
                : '/settings/teams',
            icon: Users,
        },
        {
            title: 'Team Roles',
            href: currentTeamSlug
                ? `/settings/teams/${currentTeamSlug}/roles`
                : '#',
            icon: Shield,
        },
    ];

    return (
        <div className="space-y-6 px-4 py-6 md:px-8">
            <Heading
                badge="Workspace Administration"
                title="Team Management"
                description="Manage team workspace settings, members, invitations, and dynamic roles"
            />

            <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
                <aside className="w-full shrink-0 lg:w-56">
                    <nav
                        className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:pb-0"
                        aria-label="Team Management"
                    >
                        {teamNavItems.map((item, index) => {
                            const active =
                                item.title === 'Team Roles'
                                    ? isCurrentUrl(item.href)
                                    : isCurrentUrl(item.href) ||
                                      isCurrentUrl('/settings/teams');
                            return (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        'w-full justify-start font-medium transition-colors',
                                        active
                                            ? 'bg-neutral-100 font-semibold text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                                            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
                                    )}
                                >
                                    <Link href={item.href}>
                                        {item.icon && (
                                            <item.icon className="mr-2 h-4 w-4" />
                                        )}
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <div className="w-full min-w-0 flex-1">
                    <div className="w-full space-y-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
