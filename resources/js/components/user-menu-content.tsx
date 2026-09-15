import { Link, router, usePage } from '@inertiajs/react';
import { Check, LogOut, Plus, Settings, Users } from 'lucide-react';
import { toast } from 'sonner';
import CreateTeamModal from '@/components/create-team-modal';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { switchMethod } from '@/routes/teams';
import type { Team, User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const page = usePage();
    const cleanup = useMobileNavigation();
    const currentTeam = page.props.currentTeam as Team | undefined;
    const teams = (page.props.teams as Team[]) ?? [];

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    const switchTeam = (team: Team) => {
        cleanup();
        if (currentTeam?.id === team.id) return;
        const previousTeamSlug = currentTeam?.slug;

        router.post(
            switchMethod.url(team.slug),
            {},
            {
                onSuccess: () => {
                    toast.success(`Berhasil beralih ke tim "${team.name}"`);
                    const currentUrl = window.location.pathname;
                    if (
                        previousTeamSlug &&
                        currentUrl.includes(`/${previousTeamSlug}`)
                    ) {
                        const newUrl = currentUrl.replace(
                            `/${previousTeamSlug}`,
                            `/${team.slug}`,
                        );
                        router.visit(newUrl);
                    } else {
                        router.visit(`/${team.slug}/dashboard`);
                    }
                },
            },
        );
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>

            {/* Teams Section */}
            {teams.length > 0 && (
                <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-muted-foreground text-xs font-semibold px-2 py-1 uppercase tracking-wider">
                        Daftar Tim
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                        {teams.map((team) => (
                            <DropdownMenuItem
                                key={team.id}
                                data-test="team-switcher-item"
                                className="cursor-pointer flex items-center justify-between gap-2 p-2"
                                onSelect={() => switchTeam(team)}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span className="truncate text-sm font-medium">{team.name}</span>
                                </div>
                                {currentTeam?.id === team.id && (
                                    <Check className="h-4 w-4 shrink-0 text-primary" />
                                )}
                            </DropdownMenuItem>
                        ))}
                        <CreateTeamModal>
                            <DropdownMenuItem
                                data-test="team-switcher-new-team"
                                className="cursor-pointer gap-2 p-2"
                                onSelect={(event) => event.preventDefault()}
                            >
                                <Plus className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground text-sm font-medium">Buat Tim Baru</span>
                            </DropdownMenuItem>
                        </CreateTeamModal>
                    </DropdownMenuGroup>
                </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Akun
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Keluar
                </Link>
            </DropdownMenuItem>
        </>
    );
}
