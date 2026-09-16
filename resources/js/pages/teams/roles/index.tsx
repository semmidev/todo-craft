import { Head, router, useForm } from '@inertiajs/react';
import { Edit3, Loader2, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permission';

interface RoleData {
    id: number;
    name: string;
    is_default: boolean;
    permissions: string[];
}

interface PageProps {
    team: {
        id: number;
        name: string;
        slug: string;
    };
    roles: RoleData[];
}

const PERMISSION_GROUPS: Record<
    string,
    { label: string; permissions: { id: string; label: string }[] }
> = {
    dashboard: {
        label: 'Dasbor & Analitik',
        permissions: [
            { id: 'dashboard.view', label: 'Lihat Dasbor Tim' },
            { id: 'admin.dashboard.access', label: 'Akses Dasbor Admin' },
        ],
    },
    team: {
        label: 'Manajemen Tim & Anggota',
        permissions: [
            { id: 'teams.update', label: 'Perbarui Info Tim' },
            { id: 'teams.delete', label: 'Hapus Tim' },
            { id: 'teams.members.manage', label: 'Kelola Anggota Tim' },
            { id: 'teams.invitations.manage', label: 'Kelola Undangan Tim' },
            { id: 'roles.manage', label: 'Kelola Peran & Izin' },
        ],
    },
    todos: {
        label: 'Manajemen Tugas Todo',
        permissions: [
            { id: 'todos.view', label: 'Lihat Todo' },
            { id: 'todos.create', label: 'Buat Todo' },
            { id: 'todos.update', label: 'Perbarui & Ubah Status Todo' },
            { id: 'todos.delete', label: 'Hapus Todo' },
        ],
    },
    categories: {
        label: 'Manajemen Kategori',
        permissions: [
            { id: 'categories.manage', label: 'Kelola Kategori' },
        ],
    },
    audit: {
        label: 'Jejak Audit',
        permissions: [
            { id: 'activity_log.view', label: 'Lihat Log Aktivitas' },
        ],
    },
};

export default function TeamRolesIndex({ team, roles }: PageProps) {
    const { can } = usePermission();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleData | null>(null);
    const [deletingRoleTarget, setDeletingRoleTarget] = useState<RoleData | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        permissions: [] as string[],
    });

    const openCreateModal = () => {
        setEditingRole(null);
        reset();
        setIsCreateModalOpen(true);
    };

    const openEditModal = (role: RoleData) => {
        setEditingRole(role);
        setData({
            name: role.name,
            permissions: role.permissions,
        });
        setIsCreateModalOpen(true);
    };

    const togglePermission = (permission: string) => {
        const current = data.permissions;
        if (current.includes(permission)) {
            setData(
                'permissions',
                current.filter((p) => p !== permission),
            );
        } else {
            setData('permissions', [...current, permission]);
        }
    };

    const toggleGroup = (groupPermissionIds: string[]) => {
        const allSelected = groupPermissionIds.every((p) =>
            data.permissions.includes(p),
        );
        if (allSelected) {
            setData(
                'permissions',
                data.permissions.filter((p) => !groupPermissionIds.includes(p)),
            );
        } else {
            const combined = new Set([
                ...data.permissions,
                ...groupPermissionIds,
            ]);
            setData('permissions', Array.from(combined));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (editingRole) {
            put(`/settings/teams/${team.slug}/roles/${editingRole.id}`, {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        } else {
            post(`/settings/teams/${team.slug}/roles`, {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        }
    };

    const executeDeleteRole = () => {
        if (!deletingRoleTarget) return;
        setDeletingId(deletingRoleTarget.id);
        router.delete(`/settings/teams/${team.slug}/roles/${deletingRoleTarget.id}`, {
            onFinish: () => {
                setDeletingId(null);
                setDeletingRoleTarget(null);
            },
        });
    };

    return (
        <>
            <Head title={`Peran Tim - ${team.name}`} />

            <div className="w-full flex-1 space-y-8 p-6 lg:p-8">
                <Heading
                    badge="Keamanan & RBAC"
                    title="Peran & Izin Tim"
                    description={`Konfigurasi izin dinamis dan kontrol akses untuk anggota di ${team.name}.`}
                >
                    {can('roles.manage') && (
                        <button
                            onClick={openCreateModal}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#121212] px-4 py-2.5 text-sm font-medium text-[#f8f8f6] shadow-sm transition-colors hover:bg-[#373734] active:scale-95 dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                        >
                            <Plus className="size-4" />
                            Buat Peran Khusus
                        </button>
                    )}
                </Heading>

                {/* Roles Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="flex flex-col justify-between rounded-2xl border border-[#e7e6e1] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:border-[#2f2f2c] dark:bg-[#1c1c1a]"
                        >
                            <div>
                                <div className="flex items-center justify-between border-b border-[#e7e6e1] pb-3 dark:border-[#2f2f2c]">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-serif text-xl font-normal text-[#121212] capitalize dark:text-[#f8f8f6]">
                                            {role.name}
                                        </h2>
                                        {role.is_default ? (
                                            <span className="rounded-md border border-[#e7e6e1] bg-[#efeeeb] px-2 py-0.5 font-mono text-[11px] text-[#373734] dark:border-[#2f2f2c] dark:bg-[#282826] dark:text-[#9c9a92]">
                                                Sistem
                                            </span>
                                        ) : (
                                            <span className="rounded-md bg-[#d97757]/10 px-2 py-0.5 font-mono text-[11px] text-[#d97757]">
                                                Khusus
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Permissions Badges List */}
                                <div className="mt-4">
                                    <span className="text-xs font-semibold tracking-wider text-[#7b7974] uppercase dark:text-[#9c9a92]">
                                        Izin Terpasang (
                                        {role.permissions.length})
                                    </span>
                                    <div className="mt-2.5 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto pr-1">
                                        {role.permissions.length === 0 ? (
                                            <span className="text-xs text-[#9c9a92] italic">
                                                Tidak ada izin yang terpasang
                                            </span>
                                        ) : (
                                            role.permissions.map((perm) => (
                                                <span
                                                    key={perm}
                                                    className="inline-flex items-center rounded-md border border-[#e7e6e1] bg-[#f8f8f6] px-2 py-1 font-mono text-xs text-[#373734] dark:border-[#2f2f2c] dark:bg-[#282826] dark:text-[#9c9a92]"
                                                >
                                                    {perm}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            {can('roles.manage') && (
                                <div className="mt-6 flex items-center justify-end gap-2 border-t border-[#e7e6e1] pt-4 dark:border-[#2f2f2c]">
                                    <button
                                        onClick={() => openEditModal(role)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e7e6e1] bg-[#f8f8f6] px-3 py-1.5 text-xs font-medium text-[#121212] transition-colors hover:bg-[#efeeeb] dark:border-[#2f2f2c] dark:bg-[#282826] dark:text-[#f8f8f6] dark:hover:bg-[#373734]"
                                    >
                                        <Edit3 className="size-3.5" />
                                        Edit Izin
                                    </button>
                                    {!role.is_default && (
                                        <button
                                            onClick={() => setDeletingRoleTarget(role)}
                                            disabled={deletingId === role.id}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d97757]/30 bg-[#d97757]/10 px-3 py-1.5 text-xs font-medium text-[#d97757] transition-colors hover:bg-[#d97757]/20 disabled:opacity-50 cursor-pointer"
                                        >
                                            {deletingId === role.id ? (
                                                <Loader2 className="size-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="size-3.5" />
                                            )}
                                            Hapus
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

                {/* Create / Edit Modal Dialog */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/60 p-4 backdrop-blur-sm">
                        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-[#e7e6e1] bg-white p-6 shadow-2xl dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                            <div className="flex items-center justify-between border-b border-[#e7e6e1] pb-4 dark:border-[#2f2f2c]">
                                <div>
                                    <h3 className="font-serif text-2xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                        {editingRole
                                            ? `Edit Peran: ${editingRole.name}`
                                            : 'Buat Peran Khusus'}
                                    </h3>
                                    <p className="text-xs text-[#7b7974] dark:text-[#9c9a92]">
                                        Aktifkan/nonaktifkan izin terperinci untuk anggota
                                        yang memiliki peran ini
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="rounded-lg p-1 text-[#7b7974] hover:text-[#121212] dark:hover:text-[#f8f8f6]"
                                >
                                    ✕
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-4 flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-5 overflow-y-auto pr-2">
                                    {/* Role Name Input */}
                                    <div>
                                        <label className="block text-xs font-semibold tracking-wider text-[#7b7974] uppercase dark:text-[#9c9a92]">
                                            Nama Peran
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            disabled={Boolean(
                                                editingRole?.is_default,
                                            )}
                                            placeholder="mis. Desainer, QA Lead"
                                            className="mt-1.5 w-full rounded-lg border border-[#b7b7b5] bg-white px-3.5 py-2.5 text-sm text-[#121212] focus:border-[#121212] focus:outline-none disabled:opacity-60 dark:border-[#373734] dark:bg-[#282826] dark:text-[#f8f8f6]"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-xs text-[#d97757]">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Permissions Checkbox Matrix */}
                                    <div className="space-y-4">
                                        <span className="block text-xs font-semibold tracking-wider text-[#7b7974] uppercase dark:text-[#9c9a92]">
                                            Matriks Izin
                                        </span>

                                        {Object.entries(PERMISSION_GROUPS).map(
                                            ([key, group]) => {
                                                const groupIds = group.permissions.map((p) => p.id);
                                                const allGroupSelected =
                                                    groupIds.every((id) =>
                                                        data.permissions.includes(id),
                                                    );
                                                return (
                                                    <div
                                                        key={key}
                                                        className="rounded-xl border border-[#e7e6e1] bg-[#f8f8f6] p-4 dark:border-[#2f2f2c] dark:bg-[#282826]"
                                                    >
                                                        <div className="flex items-center justify-between border-b border-[#e7e6e1] pb-2 dark:border-[#2f2f2c]">
                                                            <span className="text-xs font-semibold text-[#121212] dark:text-[#f8f8f6]">
                                                                {group.label}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleGroup(groupIds)
                                                                }
                                                                className="text-xs font-medium text-[#121212] underline hover:opacity-80 dark:text-[#f8f8f6]"
                                                            >
                                                                {allGroupSelected
                                                                    ? 'Batal Pilih Semua'
                                                                    : 'Pilih Semua'}
                                                            </button>
                                                        </div>

                                                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                            {group.permissions.map(
                                                                (perm) => {
                                                                    const isChecked =
                                                                        data.permissions.includes(
                                                                            perm.id,
                                                                        );
                                                                    return (
                                                                        <label
                                                                            key={perm.id}
                                                                            className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-[#efeeeb] dark:hover:bg-[#373734]"
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={
                                                                                    isChecked
                                                                                }
                                                                                onChange={() =>
                                                                                    togglePermission(
                                                                                        perm.id,
                                                                                    )
                                                                                }
                                                                                className="mt-0.5 size-4 rounded border-[#b7b7b5] text-[#121212] focus:ring-[#121212]"
                                                                            />
                                                                            <div className="flex flex-col">
                                                                                <span className="text-xs font-medium text-[#121212] dark:text-[#f8f8f6]">
                                                                                    {perm.label}
                                                                                </span>
                                                                                <span className="font-mono text-[11px] text-[#7b7974] dark:text-[#9c9a92]">
                                                                                    {perm.id}
                                                                                </span>
                                                                            </div>
                                                                        </label>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#e7e6e1] pt-4 dark:border-[#2f2f2c]">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            setIsCreateModalOpen(false)
                                        }
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={processing}
                                    >
                                        {editingRole
                                            ? 'Simpan Perubahan'
                                            : 'Buat Peran'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            {/* Delete Role Confirmation Dialog */}
            <ConfirmDialog
                open={deletingRoleTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeletingRoleTarget(null);
                }}
                title="Hapus Peran Tim"
                description={
                    deletingRoleTarget
                        ? `Apakah Anda yakin ingin menghapus peran "${deletingRoleTarget.name}"? Pengguna dengan peran ini akan dialihkan ke Anggota.`
                        : ''
                }
                loading={deletingId !== null}
                onConfirm={executeDeleteRole}
            />
        </>
    );
}

TeamRolesIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Pengaturan Tim',
            href: props.currentTeam
                ? `/settings/teams/${props.currentTeam.slug}/edit`
                : '#',
        },
        {
            title: 'Peran & Izin',
            href: props.currentTeam
                ? `/settings/teams/${props.currentTeam.slug}/roles`
                : '#',
        },
    ],
});
