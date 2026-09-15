import type { ReactNode } from 'react';

export default function Heading({
    title,
    description,
    badge,
    variant = 'default',
    children,
}: {
    title: string;
    description?: string;
    badge?: string;
    variant?: 'default' | 'small';
    children?: ReactNode;
}) {
    if (variant === 'small') {
        return (
            <header className="border-border flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-0.5">
                    <h3 className="text-foreground text-lg font-bold tracking-tight">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-muted-foreground text-xs">
                            {description}
                        </p>
                    )}
                </div>
                {children && (
                    <div className="flex items-center gap-2">{children}</div>
                )}
            </header>
        );
    }

    return (
        <header className="border-border flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
                {badge && (
                    <div className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#d97757]" />
                        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            {badge}
                        </span>
                    </div>
                )}
                <h1 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
                    {title}
                </h1>
                {description && (
                    <p className="text-muted-foreground text-sm">
                        {description}
                    </p>
                )}
            </div>
            {children && (
                <div className="flex flex-wrap items-center gap-3">
                    {children}
                </div>
            )}
        </header>
    );
}
