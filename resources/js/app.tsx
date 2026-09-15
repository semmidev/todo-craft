import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import TeamLayout from '@/layouts/team/layout';

const appName = import.meta.env.VITE_APP_NAME || 'TodoCraft';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name === 'settings/profile':
            case name === 'settings/security':
            case name === 'settings/appearance':
                return [AppLayout, SettingsLayout];
            case name.startsWith('teams/'):
                return [AppLayout, TeamLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        delay: 0,
        color: '#d97757',
        includeCSS: true,
        showSpinner: true,
    },
});

// This will set light / dark mode on load...
initializeTheme();
