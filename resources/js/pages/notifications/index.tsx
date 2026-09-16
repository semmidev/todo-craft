import { Head, Link, router } from '@inertiajs/react';
import {
    Bell,
    Calendar,
    Check,
    CheckCheck,
    ExternalLink,
    Filter,
    Trash2,
    UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface NotificationItemData {
    id: string;
    type: string;
    title: string;
    message: string;
    action_url?: string | null;
    read_at?: string | null;
    created_at?: string;
    created_at_iso?: string;
    data?: any;
}

interface PageProps {
    notifications: {
        data: NotificationItemData[];
        links?: any[];
        current_page?: number;
        from?: number | null;
        to?: number | null;
        total?: number;
        last_page?: number;
        per_page?: number;
    };
    unreadCount: number;
}

export default function NotificationsIndex({
    notifications,
    unreadCount,
}: PageProps) {
    const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');

    const filteredItems = notifications.data.filter((item) => {
        if (filterTab === 'unread') return !item.read_at;
        return true;
    });

    const handleMarkAsRead = (id: string) => {
        router.patch(`/notifications/${id}/read`, {}, { preserveScroll: true });
    };

    const handleMarkAllAsRead = () => {
        router.post('/notifications/mark-all-read', {}, { preserveScroll: true });
    };

    const handleDelete = (id: string) => {
        router.delete(`/notifications/${id}`, { preserveScroll: true });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'team_invitation':
                return <UserPlus className="h-5 w-5 text-blue-500" />;
            case 'todo_reminder':
                return <Calendar className="h-5 w-5 text-amber-500" />;
            case 'todo_assigned':
                return <Check className="h-5 w-5 text-emerald-500" />;
            default:
                return <Bell className="h-5 w-5 text-primary" />;
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Notifikasi', href: '/notifications' },
            ]}
        >
            <Head title="Notifikasi - Pusat Pemberitahuan" />

            <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Heading
                            title="Pusat Notifikasi"
                            description="Kelola pemberitahuan pengingat tugas, undangan tim, dan aktivitas penugasan Anda."
                        />
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            onClick={handleMarkAllAsRead}
                            variant="outline"
                            className="cursor-pointer gap-2"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Tandai Semua Dibaca ({unreadCount})
                        </Button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                    <button
                        type="button"
                        onClick={() => setFilterTab('all')}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            filterTab === 'all'
                                ? 'bg-primary text-primary-foreground shadow-2xs'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        Semua ({notifications.total ?? notifications.data.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterTab('unread')}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            filterTab === 'unread'
                                ? 'bg-primary text-primary-foreground shadow-2xs'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        Belum Dibaca ({unreadCount})
                    </button>
                </div>

                {/* Notification List */}
                <div className="bg-card border-border space-y-3 rounded-2xl border p-4 shadow-xs">
                    {filteredItems.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <Bell className="mx-auto mb-3 h-10 w-10 opacity-30" />
                            <p className="text-sm font-semibold">Tidak ada notifikasi</p>
                            <p className="text-xs">
                                {filterTab === 'unread'
                                    ? 'Semua notifikasi Anda sudah dibaca.'
                                    : 'Belum ada notifikasi baru untuk ditampilkan.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {filteredItems.map((n) => {
                                const isUnread = !n.read_at;

                                return (
                                    <div
                                        key={n.id}
                                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-colors rounded-xl ${
                                            isUnread
                                                ? 'bg-primary/5 hover:bg-primary/10'
                                                : 'hover:bg-muted/50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background shadow-2xs">
                                                {getIcon(n.type)}
                                            </div>

                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="text-sm font-bold text-foreground">
                                                        {n.title}
                                                    </h4>
                                                    {isUnread && (
                                                        <Badge variant="default" className="text-[10px]">
                                                            Baru
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        • {n.created_at}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    {n.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions Cluster */}
                                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                            {n.action_url && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    asChild
                                                    className="h-8 text-xs cursor-pointer"
                                                >
                                                    <Link href={n.action_url}>
                                                        Buka
                                                        <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                            )}

                                            {isUnread && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    className="h-8 text-xs cursor-pointer"
                                                >
                                                    Tandai Dibaca
                                                </Button>
                                            )}

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleDelete(n.id)}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                                                title="Hapus notifikasi"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    {notifications.total && notifications.total > (notifications.per_page ?? 20) && (
                        <div className="pt-4 border-t border-border">
                            <DataTablePagination data={notifications} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
