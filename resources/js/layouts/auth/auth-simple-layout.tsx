import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center bg-white px-4 py-12 text-[#171717] bg-grid-pattern dark:bg-[#0a0a0a] dark:text-[#f5f5f5]">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <Link
                            href={home()}
                            className="group flex items-center justify-center gap-2"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 p-1.5 transition-transform group-hover:scale-105 dark:bg-white/10">
                                <AppLogoIcon className="size-full object-contain" />
                            </div>
                        </Link>

                        <div className="space-y-1 mt-2">
                            <h1 className="text-2xl font-medium tracking-tight text-[#0a0a0a] dark:text-white">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-sm text-[#737373] dark:text-[#a3a3a3]">
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 shadow-subtle dark:border-[#262626] dark:bg-[#171717]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

