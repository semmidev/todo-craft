import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profil',
        href: edit(),
        icon: null,
    },
    {
        title: 'Keamanan',
        href: editSecurity(),
        icon: null,
    },
    {
        title: 'Tampilan',
        href: editAppearance(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="space-y-6 px-4 py-6 md:px-8">
            <Heading
                badge="Akun Pribadi"
                title="Akun"
                description="Kelola profil, keamanan, dan tampilan akun Anda"
            />

            <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
                <aside className="w-full shrink-0 lg:w-56">
                    <nav
                        className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:pb-0"
                        aria-label="Akun"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const active = isCurrentOrParentUrl(item.href);
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
