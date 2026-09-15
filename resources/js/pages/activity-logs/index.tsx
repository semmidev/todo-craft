import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    Eye,
    History,
    MoreHorizontal,
    RotateCcw,
    Search,
    User,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatUserDateTime } from '@/lib/date-utils';

interface ActivityItem {
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    subject_id: number;
    causer?: {
        id: number;
        name: string;
        email: string;
    };
    properties: any;
    created_at?: string;
}

interface PageProps {
    activities: {
        data: ActivityItem[];
        links?: any[];
        current_page?: number;
        from?: number | null;
        to?: number | null;
        total?: number;
        last_page?: number;
        per_page?: number;
        meta?: any;
    };
    filters?: Record<string, string>;
    sort?: string;
    logNames?: string[];
    currentTeam: {
        id: number;
        name: string;
        slug: string;
    };
}

export default function ActivityLogsIndex({
    activities,
    filters = {},
    sort = '-id',
    logNames = [],
    currentTeam,
}: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters['search'] || '');
    const [logNameFilter, setLogNameFilter] = useState(filters['log_name'] || '');
    const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters['search'] || '')) {
                applyFilter('search', searchQuery);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const applyFilter = (key: string, value: string) => {
        const queryParams: Record<string, string> = {};

        const currentFilters = {
            search: searchQuery,
            log_name: logNameFilter,
            [key]: value,
        };

        Object.entries(currentFilters).forEach(([k, v]) => {
            if (v && v.trim() !== '') {
                queryParams[`filter[${k}]`] = v;
            }
        });

        if (sort) {
            queryParams['sort'] = sort;
        }

        router.get(`/${currentTeam.slug}/activity-logs`, queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSort = (key: string) => {
        let newSort = key;

        if (sort === key) {
            newSort = `-${key}`;
        } else if (sort === `-${key}`) {
            newSort = '';
        }

        const queryParams: Record<string, string> = {};

        Object.entries(filters).forEach(([k, v]) => {
            if (v) queryParams[`filter[${k}]`] = v;
        });

        if (newSort) {
            queryParams['sort'] = newSort;
        }

        router.get(`/${currentTeam.slug}/activity-logs`, queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handlePerPageChange = (newPerPage: number) => {
        const queryParams: Record<string, string> = {};

        Object.entries(filters).forEach(([k, v]) => {
            if (v) queryParams[`filter[${k}]`] = v;
        });

        if (sort) {
            queryParams['sort'] = sort;
        }

        queryParams['per_page'] = String(newPerPage);

        router.get(`/${currentTeam.slug}/activity-logs`, queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetAllFilters = () => {
        setSearchQuery('');
        setLogNameFilter('');

        router.get(`/${currentTeam.slug}/activity-logs`, {}, {
            preserveState: true,
            replace: true,
        });
    };

    const hasActiveFilters = Boolean(searchQuery || logNameFilter);

    return (
        <>
            <Head title="Log Jejak Audit - Aplikasi Todo" />

            <div className="w-full flex-1 space-y-6 p-6 lg:p-8">
                <Heading
                    badge="Keamanan & Audit"
                    title="Log Jejak Audit"
                    description={`Riwayat tindakan sistem dan jejak audit yang terekam untuk ${currentTeam.name}.`}
                />

                {/* Data Table Control Bar (Search & Advanced Filters) */}
                <div className="bg-card border-border gap-4 space-y-4 rounded-xl border p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search Input with Debounce */}
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari log audit berdasarkan deskripsi, pengguna, atau saluran..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-background border-input focus:ring-ring w-full rounded-lg border py-2 pr-9 pl-9 text-sm focus:ring-2 focus:outline-hidden"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        applyFilter('search', '');
                                    }}
                                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Select Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Log Name Filter */}
                            <select
                                value={logNameFilter}
                                onChange={(e) => {
                                    setLogNameFilter(e.target.value);
                                    applyFilter('log_name', e.target.value);
                                }}
                                className="bg-background border-input focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-hidden cursor-pointer"
                            >
                                <option value="">Semua Saluran</option>
                                {logNames.map((name) => (
                                    <option key={name} value={name}>
                                        {name}
                                    </option>
                                ))}
                            </select>

                            {/* Reset Filters Button */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetAllFilters}
                                    className="text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                    Atur Ulang Filter
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Best Practice Shadcn Data Table */}
                <div className="bg-card border-border overflow-hidden rounded-xl border shadow-xs">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="w-[50px] text-center">#</TableHead>
                                <TableHead className="w-[180px]">
                                    <span>Pengguna / Pelaku</span>
                                </TableHead>
                                <TableHead className="min-w-[250px]">
                                    <DataTableColumnHeader
                                        title="Deskripsi Tindakan"
                                        sortKey="description"
                                        currentSort={sort}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead className="w-[150px]">
                                    <DataTableColumnHeader
                                        title="Subjek"
                                        sortKey="subject_type"
                                        currentSort={sort}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead className="w-[140px]">
                                    <DataTableColumnHeader
                                        title="Saluran"
                                        sortKey="log_name"
                                        currentSort={sort}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead className="w-[180px]">
                                    <DataTableColumnHeader
                                        title="Waktu"
                                        sortKey="created_at"
                                        currentSort={sort}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead className="w-[70px] text-right">
                                    <span className="sr-only">Aksi</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <History className="h-8 w-8 opacity-40 mb-2" />
                                            <p className="text-sm font-semibold">Log aktivitas tidak ditemukan</p>
                                            <p className="text-xs text-muted-foreground">
                                                Coba sesuaikan kata kunci pencarian atau filter yang aktif.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activities.data.map((act, index) => {
                                    const startFrom = activities.meta?.from ?? activities.from ?? 1;
                                    const rowNumber = startFrom + index;

                                    return (
                                        <TableRow
                                            key={act.id}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            {/* Row Number */}
                                            <TableCell className="text-center text-xs font-semibold text-muted-foreground">
                                                {rowNumber}
                                            </TableCell>

                                            {/* Causer / User */}
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full shrink-0">
                                                        <User className="h-3.5 w-3.5" />
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-semibold text-foreground line-clamp-1">
                                                            {act.causer ? act.causer.name : 'Sistem'}
                                                        </p>
                                                        {act.causer?.email && (
                                                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                                                                {act.causer.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Description */}
                                            <TableCell>
                                                <p className="text-xs font-medium text-foreground">
                                                    {act.description}
                                                </p>
                                            </TableCell>

                                            {/* Subject */}
                                            <TableCell>
                                                <span className="inline-flex items-center rounded-md bg-accent/60 px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
                                                    {act.subject_type || 'Umum'}{' '}
                                                    {act.subject_id ? `#${act.subject_id}` : ''}
                                                </span>
                                            </TableCell>

                                            {/* Log Name Channel */}
                                            <TableCell>
                                                <Badge variant="outline" className="text-[11px] uppercase tracking-wider">
                                                    {act.log_name}
                                                </Badge>
                                            </TableCell>

                                            {/* Timestamp */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{formatUserDateTime(act.created_at)}</span>
                                                </div>
                                            </TableCell>

                                            {/* Meatballs Menu */}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 cursor-pointer"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Aksi</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => setSelectedActivity(act)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Lihat Detail Log
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* Server-Side Data Table Pagination */}
                    <DataTablePagination
                        data={activities}
                        meta={activities.meta}
                        links={activities.links}
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            </div>

            {/* View Payload Modal */}
            {selectedActivity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-card border-border max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-lg font-bold">
                                Detail Muatan Log Aktivitas #{selectedActivity.id}
                            </h2>
                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="text-muted-foreground hover:text-foreground text-sm font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-2 bg-muted/40 p-3 rounded-lg">
                                <div>
                                    <span className="text-muted-foreground">Pengguna:</span>{' '}
                                    <span className="font-semibold">{selectedActivity.causer?.name || 'Sistem'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Waktu:</span>{' '}
                                    <span className="font-semibold">{formatUserDateTime(selectedActivity.created_at)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Saluran:</span>{' '}
                                    <span className="font-semibold">{selectedActivity.log_name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Subjek:</span>{' '}
                                    <span className="font-semibold">{selectedActivity.subject_type} {selectedActivity.subject_id ? `#${selectedActivity.subject_id}` : ''}</span>
                                </div>
                            </div>

                            <div>
                                <p className="font-semibold text-muted-foreground mb-1">Deskripsi:</p>
                                <p className="p-2 rounded bg-muted font-medium text-foreground">{selectedActivity.description}</p>
                            </div>

                            <div>
                                <p className="font-semibold text-muted-foreground mb-1">Properti (Payload JSON):</p>
                                <pre className="p-3 rounded-lg bg-slate-950 text-slate-50 overflow-x-auto font-mono text-[11px] leading-relaxed max-h-60">
                                    {JSON.stringify(selectedActivity.properties, null, 2) || '{}'}
                                </pre>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setSelectedActivity(null)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

ActivityLogsIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Log Jejak Audit',
            href: props.currentTeam
                ? `/${props.currentTeam.slug}/activity-logs`
                : '#',
        },
    ],
});
