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
            <header className="flex flex-col gap-2 border-b border-[#e5e5e5] pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#262626]">
                <div className="space-y-0.5">
                    <h3 className="text-[#0a0a0a] text-base font-medium tracking-tight dark:text-white">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-[#737373] text-xs dark:text-[#a3a3a3]">
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
        <header className="flex flex-col gap-4 border-b border-[#e5e5e5] pb-6 sm:flex-row sm:items-center sm:justify-between dark:border-[#262626]">
            <div className="space-y-1">
                {badge && (
                    <div className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#2563eb]" />
                        <span className="text-[#737373] text-xs font-medium tracking-wider uppercase dark:text-[#a3a3a3]">
                            {badge}
                        </span>
                    </div>
                )}
                <h1 className="text-[#0a0a0a] text-2xl font-medium tracking-tight md:text-3xl dark:text-white">
                    {title}
                </h1>
                {description && (
                    <p className="text-[#737373] text-sm dark:text-[#a3a3a3]">
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
