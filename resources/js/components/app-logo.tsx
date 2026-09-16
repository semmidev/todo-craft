import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black/5 p-1 dark:bg-white/10">
                <AppLogoIcon className="size-full object-contain" />
            </div>
            <div className="ml-1.5 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-medium text-[#0a0a0a] dark:text-white">
                    {name}
                </span>
            </div>
        </>
    );
}
