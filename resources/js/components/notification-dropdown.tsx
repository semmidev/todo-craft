import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Calendar, Check, CheckCheck, Trash2, UserPlus, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import type { DashboardInvitation } from '@/types';

export interface NotificationItem {
    id: string;
    type: 'team_invitation' | 'todo_reminder' | 'todo_assigned' | string;
    title: string;
    message: string;
    action_url?: string | null;
    read_at?: string | null;
    created_at?: string;
    created_at_iso?: string;
}

export default function NotificationDropdown() {
    const page = usePage();
    const pendingInvitations = ((page.props as any).pendingInvitations ?? []) as DashboardInvitation[];
    const [showPendingInvitations, setShowPendingInvitations] = useState(false);

    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/notifications/dropdown');
            if (response.ok) {
                const data = await response.json();
                setUnreadCount(data.unread_count ?? 0);
                setNotifications(data.notifications ?? []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 45 seconds for new notifications
        const interval = setInterval(fetchNotifications, 45000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        router.patch(
            `/notifications/${id}/read`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setNotifications((prev) =>
                        prev.map((n) =>
                            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
                        )
                    );
                    setUnreadCount((prev) => Math.max(0, prev - 1));
                },
            }
        );
    };

    const handleMarkAllAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.post(
            '/notifications/mark-all-read',
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setNotifications((prev) =>
                        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
                    );
                    setUnreadCount(0);
                },
            }
        );
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'team_invitation':
                return <UserPlus className="h-4 w-4 text-blue-500" />;
            case 'todo_reminder':
                return <Calendar className="h-4 w-4 text-amber-500" />;
            case 'todo_assigned':
                return <Check className="h-4 w-4 text-emerald-500" />;
            default:
                return <Bell className="h-4 w-4 text-primary" />;
        }
    };

    const handleNotificationClick = (n: NotificationItem) => {
        if (!n.read_at) {
            router.patch(
                `/notifications/${n.id}/read`,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        setNotifications((prev) =>
                            prev.map((item) =>
                                item.id === n.id ? { ...item, read_at: new Date().toISOString() } : item
                            )
                        );
                        setUnreadCount((prev) => Math.max(0, prev - 1));
                    },
                }
            );
        }

        setIsOpen(false);

        if (n.type === 'team_invitation') {
            if (pendingInvitations && pendingInvitations.length > 0) {
                setShowPendingInvitations(true);
            } else {
                router.visit('/teams');
            }
        } else if (n.action_url) {
            router.visit(n.action_url);
        }
    };

    return (
        <div ref={containerRef} className="relative inline-block">
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => {
                    setIsOpen((prev) => !prev);
                    if (!isOpen) fetchNotifications();
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-2xs transition-colors hover:bg-muted focus:outline-none cursor-pointer"
                aria-label="Notifikasi"
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 4 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl outline-none"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Notifikasi
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                                        {unreadCount} baru
                                    </span>
                                )}
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    className="flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Tandai dibaca
                                </button>
                            )}
                        </div>

                        {/* List Area */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-xs text-muted-foreground">
                                    <Bell className="mx-auto mb-2 h-6 w-6 opacity-30" />
                                    Belum ada notifikasi
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const isUnread = !n.read_at;

                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer ${
                                                isUnread
                                                    ? 'bg-primary/5 hover:bg-primary/10'
                                                    : 'hover:bg-muted/60'
                                            }`}
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background shadow-2xs">
                                                {getIcon(n.type)}
                                            </div>

                                            <div className="flex-1 space-y-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <span className={`text-xs truncate ${isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                                                        {n.title}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                                        {n.created_at}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                    {n.message}
                                                </p>
                                            </div>

                                            {isUnread && (
                                                <button
                                                    type="button"
                                                    title="Tandai dibaca"
                                                    onClick={(e) => handleMarkAsRead(n.id, e)}
                                                    className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                                                >
                                                    <span className="h-2 w-2 rounded-full bg-primary block" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border/60 p-2 text-center">
                            <Link
                                href="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="block rounded-lg py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                            >
                                Lihat Semua Notifikasi
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pending Invitations Modal */}
            {pendingInvitations.length > 0 && (
                <PendingInvitationsModal
                    invitations={pendingInvitations}
                    open={showPendingInvitations}
                    onOpenChange={setShowPendingInvitations}
                />
            )}
        </div>
    );
}
