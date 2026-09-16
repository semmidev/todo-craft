import { Form, Head, router } from '@inertiajs/react';
import {
    ChevronDown,
    Mail,
    RefreshCw,
    Search,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import CancelInvitationModal from '@/components/cancel-invitation-modal';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import DeleteTeamModal from '@/components/delete-team-modal';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import InviteMemberModal from '@/components/invite-member-modal';
import RemoveMemberModal from '@/components/remove-member-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInitials } from '@/hooks/use-initials';
import { edit, index, update } from '@/routes/teams';
import { update as updateMember } from '@/routes/teams/members';
import type {
    RoleOption,
    Team,
    TeamInvitation,
    TeamMember,
    TeamPermissions,
} from '@/types';

type Props = {
    team: Team;
    members: {
        data: TeamMember[];
        links?: any[];
        current_page?: number;
        from?: number | null;
        to?: number | null;
        total?: number;
        last_page?: number;
        per_page?: number;
    };
    invitations: TeamInvitation[];
    permissions: TeamPermissions;
    availableRoles: RoleOption[];
    filters?: {
        search?: string;
        role?: string;
    };
    sort?: string;
};

export default function TeamEdit({
    team,
    members,
    invitations,
    permissions,
    availableRoles,
    filters,
    sort,
}: Props) {
    const getInitials = useInitials();

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
    const [cancelInvitationDialogOpen, setCancelInvitationDialogOpen] = useState(false);
    const [invitationToCancel, setInvitationToCancel] = useState<TeamInvitation | null>(null);

    // Search and filter state (reflecting server props)
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters?.role ?? 'all');

    const pageTitle = useMemo(
        () =>
            permissions.canUpdateTeam
                ? `Edit ${team.name}`
                : `Lihat ${team.name}`,
        [permissions.canUpdateTeam, team.name],
    );

    const updateMemberRole = (member: TeamMember, newRole: string) => {
        router.visit(updateMember([team.slug, member.id]), {
            data: { role: newRole },
            preserveScroll: true,
        });
    };

    const confirmRemoveMember = (member: TeamMember) => {
        setMemberToRemove(member);
        setRemoveMemberDialogOpen(true);
    };

    const confirmCancelInvitation = (invitation: TeamInvitation) => {
        setInvitationToCancel(invitation);
        setCancelInvitationDialogOpen(true);
    };

    // Trigger server-side DB query update via Inertia router.get
    const updateQuery = (
        newFilters: { search?: string; role?: string },
        newSort?: string,
        newPerPage?: number
    ) => {
        const queryParams: Record<string, string> = {};

        const searchVal = newFilters.search !== undefined ? newFilters.search : searchQuery;
        const roleVal = newFilters.role !== undefined ? newFilters.role : roleFilter;
        const sortVal = newSort !== undefined ? newSort : sort;

        if (searchVal && searchVal.trim() !== '') {
            queryParams['filter[search]'] = searchVal.trim();
        }

        if (roleVal && roleVal !== 'all') {
            queryParams['filter[role]'] = roleVal;
        }

        if (sortVal) {
            queryParams['sort'] = sortVal;
        }

        if (newPerPage) {
            queryParams['per_page'] = String(newPerPage);
        } else if (members.per_page) {
            queryParams['per_page'] = String(members.per_page);
        }

        router.get(edit(team.slug), queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Debounced search effect (350ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search ?? '')) {
                updateQuery({ search: searchQuery });
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery, filters?.search]);

    const handleRoleFilterChange = (val: string) => {
        setRoleFilter(val);
        updateQuery({ role: val });
    };

    const handleSort = (key: string) => {
        let newSort = key;
        if (sort === key) {
            newSort = `-${key}`;
        } else if (sort === `-${key}`) {
            newSort = '';
        }

        updateQuery({}, newSort);
    };

    const handlePerPageChange = (newPerPage: number) => {
        updateQuery({}, undefined, newPerPage);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setRoleFilter('all');
        router.get(edit(team.slug), {}, { preserveState: true, replace: true });
    };

    const roleOptionsForFilter = useMemo(() => {
        return [
            { value: 'all', label: 'Semua Peran' },
            { value: 'owner', label: 'Pemilik (Owner)' },
            ...availableRoles.map((r) => ({ value: r.value, label: r.label })),
        ];
    }, [availableRoles]);

    const hasActiveFilters = Boolean(
        (searchQuery && searchQuery.trim() !== '') || (roleFilter && roleFilter !== 'all')
    );

    const membersData = members.data ?? [];
    const currentPage = members.current_page ?? 1;
    const perPage = members.per_page ?? 10;

    return (
        <>
            <Head title={pageTitle} />

            <h1 className="sr-only">{pageTitle}</h1>

            <div className="w-full flex-1 space-y-8 p-6 lg:p-8">
                <div className="space-y-6">
                    {permissions.canUpdateTeam ? (
                        <>
                            <Heading
                                badge="Administrasi Tim"
                                title="Pengaturan Tim"
                                description={`Perbarui nama tim, daftar anggota, dan undangan tertunda untuk ${team.name}.`}
                            />

                            <Form
                                action={update.url(team.slug)}
                                method="patch"
                                className="space-y-6"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">
                                                Nama tim
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                data-test="team-name-input"
                                                defaultValue={team.name}
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button
                                                type="submit"
                                                data-test="team-save-button"
                                                loading={processing}
                                            >
                                                Simpan
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </>
                    ) : (
                        <>
                            <Heading variant="small" title={team.name} />
                        </>
                    )}
                </div>

                {/* Team Members Database-Driven DataTable Section */}
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Heading
                            variant="small"
                            title="Anggota tim"
                            description={
                                permissions.canCreateInvitation
                                    ? 'Kelola siapa saja yang bergabung dalam tim ini'
                                    : ''
                            }
                        />

                        {permissions.canCreateInvitation ? (
                            <Button
                                data-test="invite-member-button"
                                onClick={() => setInviteDialogOpen(true)}
                                className="cursor-pointer gap-2"
                            >
                                <UserPlus className="h-4 w-4" /> Undang anggota
                            </Button>
                        ) : null}
                    </div>

                    {/* Filter & Search Controls Bar */}
                    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Search Input (Debounced Auto-Search) */}
                            <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama atau email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-8"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                        }}
                                        className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Role Filter */}
                            <div className="w-full sm:w-48">
                                <SearchableSelect
                                    value={roleFilter}
                                    onChange={(val) => handleRoleFilterChange(String(val))}
                                    options={roleOptionsForFilter}
                                    placeholder="Filter Peran"
                                />
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFilters}
                                    className="cursor-pointer gap-1.5 text-xs"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    Reset Filter
                                </Button>
                            )}
                        </div>

                        <div className="text-muted-foreground text-xs font-semibold">
                            Total {members.total ?? membersData.length} Anggota
                        </div>
                    </div>

                    {/* Comprehensive DB Table */}
                    <div className="bg-card border-border overflow-hidden rounded-xl border shadow-xs">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">#</TableHead>
                                    <TableHead className="min-w-[200px]">
                                        <DataTableColumnHeader
                                            title="Anggota"
                                            sortKey="name"
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                    </TableHead>
                                    <TableHead className="min-w-[200px]">
                                        <DataTableColumnHeader
                                            title="Email"
                                            sortKey="email"
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                    </TableHead>
                                    <TableHead className="min-w-[150px]">
                                        <DataTableColumnHeader
                                            title="Peran / Akses"
                                            sortKey="role"
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                    </TableHead>
                                    <TableHead className="w-[100px] text-right">
                                        <span>Aksi</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {membersData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="h-40 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Users className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-semibold">
                                                    Tidak ada anggota tim yang cocok
                                                </p>
                                                {hasActiveFilters && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        onClick={resetFilters}
                                                        className="text-xs cursor-pointer"
                                                    >
                                                        Bersihkan kata kunci filter
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    membersData.map((member, index) => (
                                        <TableRow
                                            key={member.id}
                                            data-test="member-row"
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            {/* Index */}
                                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                {(currentPage - 1) * perPage + index + 1}
                                            </TableCell>

                                            {/* Member Name + Avatar */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-border">
                                                        {member.avatar ? (
                                                            <AvatarImage
                                                                src={member.avatar}
                                                                alt={member.name}
                                                            />
                                                        ) : null}
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                            {getInitials(member.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="font-semibold text-foreground text-sm">
                                                        {member.name}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Member Email */}
                                            <TableCell className="text-sm text-muted-foreground">
                                                {member.email}
                                            </TableCell>

                                            {/* Member Role / Access */}
                                            <TableCell>
                                                {member.role !== 'owner' &&
                                                permissions.canUpdateMember ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                data-test="member-role-trigger"
                                                                className="cursor-pointer gap-1.5 h-8 text-xs font-medium"
                                                            >
                                                                {member.role_label}
                                                                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start">
                                                            {availableRoles.map((role) => (
                                                                <DropdownMenuItem
                                                                    key={role.value}
                                                                    data-test="member-role-option"
                                                                    onSelect={() =>
                                                                        updateMemberRole(
                                                                            member,
                                                                            role.value,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer text-xs"
                                                                >
                                                                    {role.label}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <Badge
                                                        variant={member.role === 'owner' ? 'default' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        {member.role_label}
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Action Button */}
                                            <TableCell className="text-right">
                                                {member.role !== 'owner' &&
                                                permissions.canRemoveMember ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    data-test="member-remove-button"
                                                                    onClick={() =>
                                                                        confirmRemoveMember(
                                                                            member,
                                                                        )
                                                                    }
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Keluarkah anggota</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : null}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination Footer */}
                        {members.total && members.total > 0 && (
                            <div className="border-t border-border">
                                <DataTablePagination
                                    data={members}
                                    onPerPageChange={handlePerPageChange}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {invitations.length > 0 ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Undangan tertunda"
                            description="Undangan yang belum diterima"
                        />

                        <div className="space-y-3">
                            {invitations.map((invitation) => (
                                <div
                                    key={invitation.code}
                                    data-test="invitation-row"
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                                            <Mail className="text-muted-foreground h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {invitation.email}
                                            </div>
                                            <div className="text-muted-foreground text-sm">
                                                {invitation.role_label}
                                            </div>
                                        </div>
                                    </div>

                                    {permissions.canCancelInvitation ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        data-test="invitation-cancel-button"
                                                        onClick={() =>
                                                            confirmCancelInvitation(
                                                                invitation,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Batalkan undangan</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                {permissions.canDeleteTeam && !team.isPersonal ? (
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Hapus tim"
                            description="Hapus tim Anda secara permanen"
                        />
                        <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                            <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                                <p className="font-medium">Peringatan</p>
                                <p className="text-sm">
                                    Harap berhati-hati, tindakan ini tidak dapat
                                    dibatalkan.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                data-test="delete-team-button"
                                onClick={() => setDeleteDialogOpen(true)}
                            >
                                Hapus tim
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>

            {permissions.canCreateInvitation ? (
                <InviteMemberModal
                    team={team}
                    availableRoles={availableRoles}
                    open={inviteDialogOpen}
                    onOpenChange={setInviteDialogOpen}
                />
            ) : null}

            <RemoveMemberModal
                team={team}
                member={memberToRemove}
                open={removeMemberDialogOpen}
                onOpenChange={setRemoveMemberDialogOpen}
            />

            <CancelInvitationModal
                team={team}
                invitation={invitationToCancel}
                open={cancelInvitationDialogOpen}
                onOpenChange={setCancelInvitationDialogOpen}
            />

            {permissions.canDeleteTeam && !team.isPersonal ? (
                <DeleteTeamModal
                    team={team}
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                />
            ) : null}
        </>
    );
}

TeamEdit.layout = (props: { team: { name: string; slug: string } }) => ({
    breadcrumbs: [
        {
            title: 'Tim',
            href: index(),
        },
        {
            title: props.team.name,
            href: edit(props.team.slug),
        },
    ],
});
