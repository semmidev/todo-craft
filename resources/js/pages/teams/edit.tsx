import { Form, Head, router } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Mail,
    RefreshCw,
    Search,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import CancelInvitationModal from '@/components/cancel-invitation-modal';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
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
    members: TeamMember[];
    invitations: TeamInvitation[];
    permissions: TeamPermissions;
    availableRoles: RoleOption[];
};

export default function TeamEdit({
    team,
    members,
    invitations,
    permissions,
    availableRoles,
}: Props) {
    const getInitials = useInitials();

    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
    const [cancelInvitationDialogOpen, setCancelInvitationDialogOpen] = useState(false);
    const [invitationToCancel, setInvitationToCancel] = useState<TeamInvitation | null>(null);

    // DataTable state
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortColumn, setSortColumn] = useState<'name' | 'email' | 'role'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

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

    // Client-side filtering
    const filteredMembers = useMemo(() => {
        return members.filter((m) => {
            const matchesSearch =
                searchQuery.trim() === '' ||
                m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole = roleFilter === 'all' || m.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [members, searchQuery, roleFilter]);

    // Client-side sorting
    const sortedMembers = useMemo(() => {
        return [...filteredMembers].sort((a, b) => {
            let valA = a[sortColumn] || '';
            let valB = b[sortColumn] || '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredMembers, sortColumn, sortDirection]);

    // Client-side pagination
    const totalItems = sortedMembers.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const currentFrom = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const currentTo = Math.min(currentPage * pageSize, totalItems);

    const paginatedMembers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedMembers.slice(start, start + pageSize);
    }, [sortedMembers, currentPage, pageSize]);

    const handleSort = (key: string) => {
        const col = key as 'name' | 'email' | 'role';
        if (sortColumn === col) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(col);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setRoleFilter('all');
        setCurrentPage(1);
    };

    const roleOptionsForFilter = useMemo(() => {
        return [
            { value: 'all', label: 'Semua Peran' },
            { value: 'owner', label: 'Pemilik (Owner)' },
            ...availableRoles.map((r) => ({ value: r.value, label: r.label })),
        ];
    }, [availableRoles]);

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

                {/* Team Members Comprehensive DataTable Section */}
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

                    {/* Filter and Search Toolbar */}
                    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Search Input */}
                            <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
                                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                                <Input
                                    type="text"
                                    placeholder="Cari nama atau email..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-9 pr-8"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
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
                                    onChange={(val) => {
                                        setRoleFilter(String(val));
                                        setCurrentPage(1);
                                    }}
                                    options={roleOptionsForFilter}
                                    placeholder="Filter Peran"
                                />
                            </div>

                            {(searchQuery || roleFilter !== 'all') && (
                                <Button
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
                            Total {filteredMembers.length} Anggota
                        </div>
                    </div>

                    {/* Comprehensive DataTable */}
                    <div className="bg-card border-border overflow-hidden rounded-xl border shadow-xs">
                        <Table>
                            <TableHeader className="bg-muted/40">
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">#</TableHead>
                                    <TableHead className="min-w-[200px]">
                                        <DataTableColumnHeader
                                            title="Anggota"
                                            sortKey="name"
                                            currentSort={
                                                sortColumn === 'name'
                                                    ? sortDirection === 'asc'
                                                        ? 'name'
                                                        : '-name'
                                                    : undefined
                                            }
                                            onSort={handleSort}
                                        />
                                    </TableHead>
                                    <TableHead className="min-w-[200px]">
                                        <DataTableColumnHeader
                                            title="Email"
                                            sortKey="email"
                                            currentSort={
                                                sortColumn === 'email'
                                                    ? sortDirection === 'asc'
                                                        ? 'email'
                                                        : '-email'
                                                    : undefined
                                            }
                                            onSort={handleSort}
                                        />
                                    </TableHead>
                                    <TableHead className="min-w-[150px]">
                                        <DataTableColumnHeader
                                            title="Peran / Akses"
                                            sortKey="role"
                                            currentSort={
                                                sortColumn === 'role'
                                                    ? sortDirection === 'asc'
                                                        ? 'role'
                                                        : '-role'
                                                    : undefined
                                            }
                                            onSort={handleSort}
                                        />
                                    </TableHead>
                                    <TableHead className="w-[100px] text-right">
                                        <span>Aksi</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedMembers.length === 0 ? (
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
                                                {(searchQuery || roleFilter !== 'all') && (
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
                                    paginatedMembers.map((member, index) => (
                                        <TableRow
                                            key={member.id}
                                            data-test="member-row"
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            {/* Index */}
                                            <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                {(currentPage - 1) * pageSize + index + 1}
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
                        {totalItems > 0 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-border px-4 py-3 sm:flex-row">
                                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
                                    <div>
                                        Menampilkan{' '}
                                        <span className="font-semibold text-foreground">
                                            {currentFrom}
                                        </span>{' '}
                                        sampai{' '}
                                        <span className="font-semibold text-foreground">
                                            {currentTo}
                                        </span>{' '}
                                        dari{' '}
                                        <span className="font-semibold text-foreground">
                                            {totalItems}
                                        </span>{' '}
                                        anggota
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <span>Baris per halaman:</span>
                                        <SearchableSelect
                                            value={pageSize}
                                            onChange={(val) => {
                                                setPageSize(Number(val));
                                                setCurrentPage(1);
                                            }}
                                            options={[
                                                { value: '5', label: '5' },
                                                { value: '10', label: '10' },
                                                { value: '25', label: '25' },
                                                { value: '50', label: '50' },
                                            ]}
                                            size="sm"
                                            className="w-18"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage(1)}
                                        className="h-8 w-8 cursor-pointer disabled:opacity-40"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        className="h-8 w-8 cursor-pointer disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <span className="text-xs font-semibold px-2">
                                        Halaman {currentPage} dari {totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        className="h-8 w-8 cursor-pointer disabled:opacity-40"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(totalPages)}
                                        className="h-8 w-8 cursor-pointer disabled:opacity-40"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
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
