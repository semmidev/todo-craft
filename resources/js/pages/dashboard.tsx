import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity as ActivityIcon,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Clock,
    FolderKanban,
    ListTodo,
    Plus,
    Shield,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { formatUserDate } from '@/lib/date-utils';
import type { DashboardInvitation } from '@/types';

interface DashboardStats {
    totalTodos: number;
    completedTodos: number;
    inProgressTodos: number;
    pendingTodos: number;
    urgentTodos: number;
    completionRate: number;
    membersCount: number;
}

interface RecentTodo {
    id: number;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    is_overdue: boolean;
    category?: {
        id: number;
        name: string;
        color: string;
    };
    items_count: number;
    completed_items_count: number;
}

interface CategoryStat {
    id: number;
    name: string;
    color: string;
    todos_count: number;
}

interface RecentActivity {
    id: number;
    description: string;
    causer_name: string;
    created_at: string;
}

type SharedProps = {
    auth?: {
        user?: {
            name: string;
            email: string;
        };
    };
    currentTeam?: {
        id: number;
        name: string;
        slug: string;
    };
    userPermissions?: string[];
};

type Props = {
    pendingInvitations?: DashboardInvitation[];
    stats?: DashboardStats;
    recentTodos?: RecentTodo[];
    categoriesStats?: CategoryStat[];
    recentActivities?: RecentActivity[];
};

export default function Dashboard({
    pendingInvitations = [],
    stats = {
        totalTodos: 0,
        completedTodos: 0,
        inProgressTodos: 0,
        pendingTodos: 0,
        urgentTodos: 0,
        completionRate: 0,
        membersCount: 1,
    },
    recentTodos = [],
    categoriesStats = [],
    recentActivities = [],
}: Props) {
    const {
        auth,
        currentTeam,
        userPermissions = [],
    } = usePage<SharedProps>().props;
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );

    const teamSlug = currentTeam?.slug || '';

    return (
        <>
            <Head title="Dasbor" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />

            <div className="w-full flex-1 space-y-8 p-6 lg:p-8">
                <Heading
                    badge="Ikhtisar Ruang Kerja"
                    title={`Selamat datang, ${auth?.user?.name || 'Anggota'}`}
                    description={`Ringkasan aktivitas dan rincian tugas untuk ${currentTeam?.name || 'Ruang Kerja'}.`}
                >
                    {userPermissions.includes('todos.create') && (
                        <Link
                            href={`/${teamSlug}/todos`}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-4 py-2 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                        >
                            <Plus className="size-4" />
                            Tugas Baru
                        </Link>
                    )}
                    {userPermissions.includes('categories.manage') && (
                        <Link
                            href={`/${teamSlug}/categories`}
                            className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium text-[#171717] shadow-subtle transition-colors hover:bg-[#f5f5f5] dark:border-[#262626] dark:bg-[#171717] dark:text-[#f5f5f5] dark:hover:bg-[#262626]"
                        >
                            <FolderKanban className="size-4" />
                            Kategori
                        </Link>
                    )}
                </Heading>

                {/* Top Metrics Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Tasks */}
                    <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-subtle dark:border-[#262626] dark:bg-[#171717]">
                        <div className="flex items-center justify-between text-[#737373] dark:text-[#a3a3a3]">
                            <span className="text-xs font-medium uppercase tracking-wider">
                                Total Tugas
                            </span>
                            <ListTodo className="size-4 text-[#2563eb]" />
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-medium tracking-tight text-[#0a0a0a] dark:text-white">
                                {stats.totalTodos}
                            </span>
                            <span className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                                ({stats.inProgressTodos + stats.pendingTodos} aktif)
                            </span>
                        </div>
                        <p className="mt-2 text-xs text-[#737373] dark:text-[#a3a3a3]">
                            {stats.completedTodos} tugas selesai
                        </p>
                    </div>

                    {/* Completion Rate */}
                    <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-subtle dark:border-[#262626] dark:bg-[#171717]">
                        <div className="flex items-center justify-between text-[#737373] dark:text-[#a3a3a3]">
                            <span className="text-xs font-medium uppercase tracking-wider">
                                Penyelesaian
                            </span>
                            <CheckCircle2 className="size-4 text-[#16a34a]" />
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-medium tracking-tight text-[#0a0a0a] dark:text-white">
                                {stats.completionRate}%
                            </span>
                            <span className="text-xs font-medium text-[#16a34a]">
                                Progres
                            </span>
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#f5f5f5] dark:bg-[#262626]">
                            <div
                                className="h-full rounded-full bg-[#000000] transition-all duration-500 dark:bg-white"
                                style={{ width: `${stats.completionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Urgent Tasks */}
                    <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-subtle dark:border-[#262626] dark:bg-[#171717]">
                        <div className="flex items-center justify-between text-[#737373] dark:text-[#a3a3a3]">
                            <span className="text-xs font-medium uppercase tracking-wider">
                                Tugas Mendesak
                            </span>
                            <AlertTriangle className="size-4 text-[#ea580c]" />
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-medium tracking-tight text-[#0a0a0a] dark:text-white">
                                {stats.urgentTodos}
                            </span>
                            {stats.urgentTodos > 0 && (
                                <span className="rounded-full bg-[#ea580c]/10 px-2.5 py-0.5 text-xs font-medium text-[#ea580c]">
                                    Tindakan
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-[#737373] dark:text-[#a3a3a3]">
                            Prioritas tinggi dalam antrean
                        </p>
                    </div>

                    {/* Team Members */}
                    <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-subtle dark:border-[#262626] dark:bg-[#171717]">
                        <div className="flex items-center justify-between text-[#737373] dark:text-[#a3a3a3]">
                            <span className="text-xs font-medium uppercase tracking-wider">
                                Anggota Tim
                            </span>
                            <Users className="size-4 text-[#7c3aed]" />
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-3xl font-medium tracking-tight text-[#0a0a0a] dark:text-white">
                                {stats.membersCount}
                            </span>
                            <span className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                                Aktif
                            </span>
                        </div>
                        {userPermissions.includes('roles.manage') && (
                            <Link
                                href={`/settings/teams/${teamSlug}/roles`}
                                className="mt-2 block text-xs font-medium text-[#2563eb] hover:underline"
                            >
                                Peran & Izin →
                            </Link>
                        )}
                    </div>
                </div>

                {/* Main Content Layout (2 Columns) */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left Column (2 Cols): Recent Tasks & Category Breakdown */}
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        {/* Recent Tasks Card */}
                        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 dark:border-[#262626] dark:bg-[#171717]">
                            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4 dark:border-[#262626]">
                                <div>
                                    <h2 className="text-lg font-medium text-[#0a0a0a] dark:text-white">
                                        Tugas Terbaru
                                    </h2>
                                    <p className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                                        Tugas aktif terbaru di {currentTeam?.name}
                                    </p>
                                </div>
                                {userPermissions.includes('todos.view') && (
                                    <Link
                                        href={`/${teamSlug}/todos`}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-[#2563eb] hover:underline"
                                    >
                                        Lihat Semua
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                )}
                            </div>

                            <div className="mt-4 divide-y divide-[#e5e5e5] dark:divide-[#262626]">
                                {recentTodos.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-[#737373] dark:text-[#a3a3a3]">
                                        Tidak ada tugas yang ditemukan di ruang kerja ini.
                                    </div>
                                ) : (
                                    recentTodos.map((todo) => (
                                        <div
                                            key={todo.id}
                                            className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-xs font-medium text-[#404040] capitalize dark:bg-[#262626] dark:text-[#a3a3a3]">
                                                    {todo.status.replace('_', ' ')}
                                                </span>
                                                <div>
                                                    <h3 className="line-clamp-1 text-sm font-medium text-[#171717] dark:text-[#f5f5f5]">
                                                        {todo.title}
                                                    </h3>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#737373] dark:text-[#a3a3a3]">
                                                        {todo.category && (
                                                            <span
                                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white"
                                                                style={{
                                                                    backgroundColor: todo.category.color,
                                                                }}
                                                            >
                                                                {todo.category.name}
                                                            </span>
                                                        )}
                                                        {todo.due_date && (
                                                            <span
                                                                className={`inline-flex items-center gap-1 ${todo.is_overdue ? 'font-medium text-[#ea580c]' : ''}`}
                                                            >
                                                                <Clock className="size-3" />
                                                                {formatUserDate(todo.due_date)}{' '}
                                                                {todo.is_overdue && '(Terlambat)'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="self-start rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-0.5 font-mono text-xs text-[#404040] capitalize sm:self-auto dark:border-[#262626] dark:bg-[#171717] dark:text-[#a3a3a3]">
                                                {todo.priority}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Category Breakdown Card */}
                        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 dark:border-[#262626] dark:bg-[#171717]">
                            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4 dark:border-[#262626]">
                                <div>
                                    <h2 className="text-lg font-medium text-[#0a0a0a] dark:text-white">
                                        Kategori
                                    </h2>
                                    <p className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                                        Distribusi tugas per kategori
                                    </p>
                                </div>
                                {userPermissions.includes('categories.manage') && (
                                    <Link
                                        href={`/${teamSlug}/categories`}
                                        className="text-xs font-medium text-[#2563eb] hover:underline"
                                    >
                                        Kelola Kategori
                                    </Link>
                                )}
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {categoriesStats.length === 0 ? (
                                    <div className="col-span-2 py-4 text-center text-sm text-[#737373] dark:text-[#a3a3a3]">
                                        Belum ada kategori yang ditambahkan.
                                    </div>
                                ) : (
                                    categoriesStats.map((cat) => {
                                        const percent =
                                            stats.totalTodos > 0
                                                ? Math.round((cat.todos_count / stats.totalTodos) * 100)
                                                : 0;
                                        return (
                                            <div
                                                key={cat.id}
                                                className="rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] p-3.5 dark:border-[#262626] dark:bg-[#0a0a0a]"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="size-2.5 rounded-full"
                                                            style={{
                                                                backgroundColor: cat.color,
                                                            }}
                                                        />
                                                        <span className="text-sm font-medium text-[#171717] dark:text-[#f5f5f5]">
                                                            {cat.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-[#737373] dark:text-[#a3a3a3]">
                                                        {cat.todos_count} ({percent}%)
                                                    </span>
                                                </div>
                                                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e5e5e5] dark:bg-[#262626]">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-300"
                                                        style={{
                                                            backgroundColor: cat.color,
                                                            width: `${percent}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (1 Col): Quick Navigation & Audit Log */}
                    <div className="flex flex-col gap-6">
                        {/* Quick Navigation Card */}
                        <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 dark:border-[#262626] dark:bg-[#171717]">
                            <h2 className="border-b border-[#e5e5e5] pb-3 text-lg font-medium text-[#0a0a0a] dark:border-[#262626] dark:text-white">
                                Aksi Cepat
                            </h2>
                            <div className="mt-4 flex flex-col gap-2">
                                {userPermissions.includes('todos.view') && (
                                    <Link
                                        href={`/${teamSlug}/todos`}
                                        className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-white p-3 text-xs font-medium text-[#171717] transition-colors hover:bg-[#f5f5f5] dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#f5f5f5] dark:hover:bg-[#262626]"
                                    >
                                        <span className="flex items-center gap-2">
                                            <ListTodo className="size-4 text-[#171717] dark:text-white" />
                                            Daftar & Papan Tugas
                                        </span>
                                        <ArrowRight className="size-3.5 text-[#737373]" />
                                    </Link>
                                )}
                                {userPermissions.includes('categories.manage') && (
                                    <Link
                                        href={`/${teamSlug}/categories`}
                                        className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-white p-3 text-xs font-medium text-[#171717] transition-colors hover:bg-[#f5f5f5] dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#f5f5f5] dark:hover:bg-[#262626]"
                                    >
                                        <span className="flex items-center gap-2">
                                            <FolderKanban className="size-4 text-[#171717] dark:text-white" />
                                            Kategori
                                        </span>
                                        <ArrowRight className="size-3.5 text-[#737373]" />
                                    </Link>
                                )}
                                {userPermissions.includes('roles.manage') && (
                                    <Link
                                        href={`/settings/teams/${teamSlug}/roles`}
                                        className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-white p-3 text-xs font-medium text-[#171717] transition-colors hover:bg-[#f5f5f5] dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#f5f5f5] dark:hover:bg-[#262626]"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Shield className="size-4 text-[#171717] dark:text-white" />
                                            Peran & Izin
                                        </span>
                                        <ArrowRight className="size-3.5 text-[#737373]" />
                                    </Link>
                                )}
                                {userPermissions.includes('activity_log.view') && (
                                    <Link
                                        href={`/${teamSlug}/activity-logs`}
                                        className="flex items-center justify-between rounded-lg border border-[#e5e5e5] bg-white p-3 text-xs font-medium text-[#171717] transition-colors hover:bg-[#f5f5f5] dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#f5f5f5] dark:hover:bg-[#262626]"
                                    >
                                        <span className="flex items-center gap-2">
                                            <ActivityIcon className="size-4 text-[#171717] dark:text-white" />
                                            Log Jejak Audit
                                        </span>
                                        <ArrowRight className="size-3.5 text-[#737373]" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity Log Stream */}
                        {userPermissions.includes('activity_log.view') && (
                            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 dark:border-[#262626] dark:bg-[#171717]">
                                <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-3 dark:border-[#262626]">
                                    <h2 className="text-lg font-medium text-[#0a0a0a] dark:text-white">
                                        Aktivitas Audit
                                    </h2>
                                    <Link
                                        href={`/${teamSlug}/activity-logs`}
                                        className="text-xs font-medium text-[#2563eb] hover:underline"
                                    >
                                        Lihat Semua
                                    </Link>
                                </div>

                                <div className="mt-4 space-y-3.5">
                                    {recentActivities.length === 0 ? (
                                        <div className="py-4 text-center text-xs text-[#737373] dark:text-[#a3a3a3]">
                                            Belum ada aktivitas terbaru yang terekam.
                                        </div>
                                    ) : (
                                        recentActivities.map((act) => (
                                            <div
                                                key={act.id}
                                                className="flex items-start gap-3"
                                            >
                                                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f5f5f5] text-[10px] font-semibold text-[#171717] dark:bg-[#262626] dark:text-white">
                                                    {act.causer_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <p className="text-xs text-[#404040] dark:text-[#a3a3a3]">
                                                        <span className="font-medium text-[#0a0a0a] dark:text-white">
                                                            {act.causer_name}
                                                        </span>{' '}
                                                        {act.description}
                                                    </p>
                                                    <span className="mt-0.5 text-[10px] text-[#737373] dark:text-[#737373]">
                                                        {act.created_at}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dasbor',
            href: props.currentTeam
                ? `/${props.currentTeam.slug}/dashboard`
                : '/',
        },
    ],
});
