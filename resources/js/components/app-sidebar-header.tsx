import { Bell, Check, Monitor, Moon, Sun } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                {/* Notification Icon with Badge */}
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative h-9 w-9 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        title="Notifications"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#d97757] opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#d97757]" />
                        </span>
                    </Button>
                </div>

                {/* Theme Mode Toggle (Dark / Light / System) */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                            title="Switch Theme Mode"
                        >
                            {appearance === 'light' && (
                                <Sun className="h-4 w-4 text-amber-500" />
                            )}
                            {appearance === 'dark' && (
                                <Moon className="h-4 w-4 text-blue-400" />
                            )}
                            {appearance === 'system' && (
                                <Monitor className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle theme mode</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem
                            onClick={() => updateAppearance('light')}
                            className="flex cursor-pointer items-center justify-between"
                        >
                            <span className="flex items-center gap-2">
                                <Sun className="h-4 w-4 text-amber-500" /> Light
                            </span>
                            {appearance === 'light' && (
                                <Check className="h-4 w-4" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => updateAppearance('dark')}
                            className="flex cursor-pointer items-center justify-between"
                        >
                            <span className="flex items-center gap-2">
                                <Moon className="h-4 w-4 text-blue-400" /> Dark
                            </span>
                            {appearance === 'dark' && (
                                <Check className="h-4 w-4" />
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => updateAppearance('system')}
                            className="flex cursor-pointer items-center justify-between"
                        >
                            <span className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" /> System
                            </span>
                            {appearance === 'system' && (
                                <Check className="h-4 w-4" />
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
