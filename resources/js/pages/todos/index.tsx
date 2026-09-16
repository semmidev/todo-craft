import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Filter,
    Loader2,
    MoreHorizontal,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Tag,
    Trash2,
    UserCheck,
    X,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import Heading from '@/components/heading';
import Modal from '@/components/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { usePermission } from '@/hooks/use-permission';
import { usePresignedUpload } from '@/hooks/use-presigned-upload';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import {
    formatDatetimeLocalToIsoWithTimezone,
    formatToDatetimeLocalInput,
    formatUserDateTime,
} from '@/lib/date-utils';

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon?: string;
}

interface UserSummary {
    id: number;
    name: string;
    email: string;
}

interface TodoItem {
    id: number;
    title: string;
    is_completed: boolean;
    order: number;
}

interface Attachment {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    original_url: string;
    thumb_url: string;
}

interface Todo {
    id: number;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'archived';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    completed_at?: string;
    category?: Category;
    creator?: UserSummary;
    assignee?: UserSummary;
    items?: TodoItem[];
    attachments?: Attachment[];
    created_at: string;
    updated_at: string;
}

interface PageProps {
    todos: {
        data: Todo[];
        links?: any[];
        current_page?: number;
        from?: number | null;
        to?: number | null;
        total?: number;
        last_page?: number;
        per_page?: number;
        meta?: {
            current_page: number;
            from: number | null;
            to: number | null;
            total: number;
            last_page: number;
            per_page: number;
        };
    };
    categories: Category[];
    teamMembers: UserSummary[];
    stats: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
        due_today: number;
    };
    filters: Record<string, string>;
    sort: string;
    currentTeam: {
        id: number;
        name: string;
        slug: string;
    };
}

export default function TodosIndex({
    todos,
    categories,
    teamMembers,
    stats,
    filters,
    sort,
    currentTeam,
}: PageProps) {
    const { can } = usePermission();

    const [searchQuery, setSearchQuery] = useState(filters['search'] || '');
    const [statusFilter, setStatusFilter] = useState(filters['status'] || '');
    const [priorityFilter, setPriorityFilter] = useState(
        filters['priority'] || '',
    );
    const [categoryFilter, setCategoryFilter] = useState(
        filters['category_id'] || '',
    );
    const [assigneeFilter, setAssigneeFilter] = useState(
        filters['assigned_to_id'] || '',
    );

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [deletingTodoTarget, setDeletingTodoTarget] = useState<Todo | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { uploadMultiple, isUploading: isPresignedUploading, progress } = usePresignedUpload();
    const [createFiles, setCreateFiles] = useState<File[]>([]);
    const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

    useKeyboardShortcut('c', () => {
        setIsCreateModalOpen(true);
    });

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters['search'] || '')) {
                applyFilter('search', searchQuery);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery]);

const REMINDER_OPTIONS = [
    { value: '', label: 'Tidak ada pengingat' },
    { value: '0', label: 'Pada waktu tenggat' },
    { value: '15', label: '15 menit sebelum' },
    { value: '30', label: '30 menit sebelum' },
    { value: '60', label: '1 jam sebelum' },
    { value: '1440', label: '1 hari sebelum' },
    { value: '2880', label: '2 hari sebelum' },
    { value: '10080', label: '1 minggu sebelum' },
];

    // Form for creating Todo
    const createForm = useForm<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        status: 'pending' | 'in_progress' | 'completed' | 'archived';
        category_id: string;
        assigned_to_id: string;
        due_date: string;
        reminder_offset: string;
        attachments: File[];
        items: { title: string; is_completed: boolean }[];
    }>({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        category_id: '',
        assigned_to_id: '',
        due_date: '',
        reminder_offset: '',
        attachments: [],
        items: [{ title: '', is_completed: false }],
    });

    // Form for editing Todo
    const editForm = useForm<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        status: 'pending' | 'in_progress' | 'completed' | 'archived';
        category_id: string;
        assigned_to_id: string;
        due_date: string;
        reminder_offset: string;
    }>({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        category_id: '',
        assigned_to_id: '',
        due_date: '',
        reminder_offset: '',
    });

    const applyFilter = (key: string, value: string) => {
        const queryParams: Record<string, string> = {};

        const currentFilters = {
            search: searchQuery,
            status: statusFilter,
            priority: priorityFilter,
            category_id: categoryFilter,
            assigned_to_id: assigneeFilter,
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

        router.get(`/${currentTeam.slug}/todos`, queryParams, {
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

        router.get(`/${currentTeam.slug}/todos`, queryParams, {
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

        router.get(`/${currentTeam.slug}/todos`, queryParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetAllFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setPriorityFilter('');
        setCategoryFilter('');
        setAssigneeFilter('');

        router.get(`/${currentTeam.slug}/todos`, {}, {
            preserveState: true,
            replace: true,
        });
    };

    const hasActiveFilters = Boolean(
        searchQuery || statusFilter || priorityFilter || categoryFilter || assigneeFilter,
    );

    const handleCreateSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmittingCreate(true);

        try {
            let attachmentKeys: { key: string }[] = [];

            if (createFiles.length > 0) {
                const uploadResults = await uploadMultiple(createFiles);
                attachmentKeys = uploadResults.map((res) => ({ key: res.key }));
            }

            const payload = {
                ...createForm.data,
                due_date: formatDatetimeLocalToIsoWithTimezone(createForm.data.due_date),
                attachment_keys: attachmentKeys,
            };

            router.post(`/${currentTeam.slug}/todos`, payload, {
                onSuccess: () => {
                    createForm.reset();
                    setCreateFiles([]);
                    setIsCreateModalOpen(false);
                },
                onFinish: () => setIsSubmittingCreate(false),
            });
        } catch {
            setIsSubmittingCreate(false);
        }
    };

    const openEditModal = (todo: Todo) => {
        setEditingTodo(todo);
        editForm.setData({
            title: todo.title,
            description: todo.description || '',
            priority: todo.priority,
            status: todo.status,
            category_id: todo.category?.id ? String(todo.category.id) : '',
            assigned_to_id: todo.assignee?.id ? String(todo.assignee.id) : '',
            due_date: formatToDatetimeLocalInput(todo.due_date),
            reminder_offset: (todo as any).reminder_offset !== null && (todo as any).reminder_offset !== undefined ? String((todo as any).reminder_offset) : '',
        });
    };

    const handleEditSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingTodo) return;

        editForm.transform((formData) => ({
            ...formData,
            due_date: formatDatetimeLocalToIsoWithTimezone(formData.due_date),
        }));

        editForm.patch(`/${currentTeam.slug}/todos/${editingTodo.id}`, {
            onSuccess: () => {
                setEditingTodo(null);
            },
        });
    };

    const handleToggleStatus = (todoId: number) => {
        router.patch(
            `/${currentTeam.slug}/todos/${todoId}/toggle-status`,
            {},
            { preserveScroll: true },
        );
    };

    const executeDeleteTodo = () => {
        if (!deletingTodoTarget) return;
        setDeletingId(deletingTodoTarget.id);
        router.delete(`/${currentTeam.slug}/todos/${deletingTodoTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingId(null);
                setDeletingTodoTarget(null);
            },
        });
    };

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
            case 'high':
                return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
            case 'medium':
                return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'in_progress':
                return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            default:
                return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    return (
        <>
            <Head title="Daftar Tugas - Todo App" />

            <div className="w-full flex-1 space-y-6 p-6 lg:p-8">
                <Heading
                    badge="Tugas & Alur Kerja"
                    title="Daftar Tugas Tim"
                    description={`Kelola tugas, atur penanggung jawab, filter dinamis, dan atur alur kerja untuk tim ${currentTeam.name}.`}
                >
                    {can('todos.create') && (
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="cursor-pointer font-medium gap-2"
                        >
                            <span>Tambah Tugas Baru</span>
                            <Kbd className="border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground ml-1">
                                C
                            </Kbd>
                        </Button>
                    )}
                </Heading>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div className="bg-card border-border rounded-xl border p-4 shadow-xs">
                        <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                            Total Tugas
                        </div>
                        <div className="mt-1 text-2xl font-bold">
                            {stats.total}
                        </div>
                    </div>
                    <div className="bg-card border-border rounded-xl border p-4 shadow-xs">
                        <div className="text-xs font-medium tracking-wider text-amber-600 uppercase dark:text-amber-400">
                            Sedang Dikerjakan
                        </div>
                        <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {stats.in_progress}
                        </div>
                    </div>
                    <div className="bg-card border-border rounded-xl border p-4 shadow-xs">
                        <div className="text-xs font-medium tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                            Selesai
                        </div>
                        <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.completed}
                        </div>
                    </div>
                    <div className="bg-card border-border rounded-xl border p-4 shadow-xs">
                        <div className="text-xs font-medium tracking-wider text-slate-600 uppercase dark:text-slate-400">
                            Menunggu
                        </div>
                        <div className="mt-1 text-2xl font-bold">
                            {stats.pending}
                        </div>
                    </div>
                    <div className="bg-card border-border col-span-2 rounded-xl border p-4 shadow-xs md:col-span-1">
                        <div className="text-xs font-medium tracking-wider text-red-600 uppercase dark:text-red-400">
                            Jatuh Tempo Hari Ini
                        </div>
                        <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.due_today}
                        </div>
                    </div>
                </div>

                {/* Data Table Control Bar (Search & Advanced Filters) */}
                <div className="bg-card border-border gap-4 space-y-4 rounded-xl border p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search Input with Debounce */}
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari tugas berdasarkan judul atau deskripsi..."
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
                            {/* Status Filter */}
                            <SearchableSelect
                                value={statusFilter}
                                onChange={(val) => {
                                    setStatusFilter(val);
                                    applyFilter('status', val);
                                }}
                                placeholder="Semua Status"
                                searchPlaceholder="Cari status..."
                                options={[
                                    { value: '', label: 'Semua Status' },
                                    { value: 'pending', label: 'Menunggu' },
                                    { value: 'in_progress', label: 'Sedang Dikerjakan' },
                                    { value: 'completed', label: 'Selesai' },
                                    { value: 'archived', label: 'Diarsipkan' },
                                ]}
                                className="w-40"
                            />

                            {/* Priority Filter */}
                            <SearchableSelect
                                value={priorityFilter}
                                onChange={(val) => {
                                    setPriorityFilter(val);
                                    applyFilter('priority', val);
                                }}
                                placeholder="Semua Prioritas"
                                searchPlaceholder="Cari prioritas..."
                                options={[
                                    { value: '', label: 'Semua Prioritas' },
                                    { value: 'urgent', label: 'Mendesak' },
                                    { value: 'high', label: 'Tinggi' },
                                    { value: 'medium', label: 'Sedang' },
                                    { value: 'low', label: 'Rendah' },
                                ]}
                                className="w-40"
                            />

                            {/* Category Filter */}
                            <SearchableSelect
                                value={categoryFilter}
                                onChange={(val) => {
                                    setCategoryFilter(val);
                                    applyFilter('category_id', val);
                                }}
                                placeholder="Semua Kategori"
                                searchPlaceholder="Cari kategori..."
                                options={[
                                    { value: '', label: 'Semua Kategori' },
                                    ...categories.map((cat) => ({
                                        value: String(cat.id),
                                        label: cat.name,
                                        color: cat.color,
                                    })),
                                ]}
                                className="w-44"
                            />

                            {/* Assignee Filter */}
                            <SearchableSelect
                                value={assigneeFilter}
                                onChange={(val) => {
                                    setAssigneeFilter(val);
                                    applyFilter('assigned_to_id', val);
                                }}
                                placeholder="Semua Penanggung Jawab"
                                searchPlaceholder="Cari nama..."
                                options={[
                                    { value: '', label: 'Semua Penanggung Jawab' },
                                    ...teamMembers.map((member) => ({
                                        value: String(member.id),
                                        label: member.name,
                                        description: member.email,
                                    })),
                                ]}
                                className="w-48"
                            />

                            {/* Reset Filters Button */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetAllFilters}
                                    className="text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                    Reset Filter
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
                                <TableHead className="w-[300px]">
                                    <DataTableColumnHeader
                                        title="Judul Tugas"
                                        sortKey="title"
                                        currentSort={sort}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead className="w-[130px]">
                                    <DataTableColumnHeader
                                        title="Status"
                                        sortKey="status"
                                        currentSort={sort}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead className="w-[120px]">
                                    <DataTableColumnHeader
                                        title="Prioritas"
                                        sortKey="priority"
                                        currentSort={sort}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead className="w-[150px]">
                                    <DataTableColumnHeader
                                        title="Kategori"
                                        sortKey="category_id"
                                        currentSort={sort}
                                        onSort={handleSort}
                                    />
                                </TableHead>
                                <TableHead className="w-[150px]">
                                    <span>Penanggung Jawab</span>
                                </TableHead>
                                <TableHead className="w-[180px]">
                                    <DataTableColumnHeader
                                        title="Tenggat Waktu"
                                        sortKey="due_date"
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
                            {todos.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-1">
                                            <Clock className="h-8 w-8 opacity-40 mb-2" />
                                            <p className="text-sm font-semibold">Tidak ada tugas ditemukan</p>
                                            <p className="text-xs text-muted-foreground">
                                                Coba ubah kata kunci pencarian atau filter aktif.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                todos.data.map((todo, index) => {
                                    const completedItemsCount =
                                        todo.items?.filter((i) => i.is_completed).length || 0;
                                    const totalItemsCount = todo.items?.length || 0;
                                    const startFrom = todos.meta?.from ?? todos.from ?? 1;
                                    const rowNumber = startFrom + index;

                                    return (
                                        <TableRow
                                            key={todo.id}
                                            className="group transition-colors hover:bg-muted/30"
                                        >
                                            {/* Row Number */}
                                            <TableCell className="text-center text-xs font-semibold text-muted-foreground">
                                                {rowNumber}
                                            </TableCell>

                                            {/* Task Title & Meta */}
                                            <TableCell className="font-medium">
                                                <div className="flex items-start gap-3">
                                                    {can('todos.update') ? (
                                                        <button
                                                            onClick={() => handleToggleStatus(todo.id)}
                                                            className="mt-0.5 shrink-0 text-muted-foreground transition hover:text-emerald-600 cursor-pointer"
                                                            title="Ubah status penyelesaian"
                                                        >
                                                            {todo.status === 'completed' ? (
                                                                <CheckCircle2 className="h-5 w-5 fill-emerald-500/20 text-emerald-500" />
                                                            ) : (
                                                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40 transition hover:border-emerald-500" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="mt-0.5 shrink-0 text-muted-foreground">
                                                            {todo.status === 'completed' ? (
                                                                <CheckCircle2 className="h-5 w-5 fill-emerald-500/20 text-emerald-500" />
                                                            ) : (
                                                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="space-y-1">
                                                        <Link
                                                            href={`/${currentTeam.slug}/todos/${todo.id}`}
                                                            className={`font-semibold text-foreground hover:text-primary transition line-clamp-1 ${
                                                                todo.status === 'completed'
                                                                    ? 'line-through text-muted-foreground'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {todo.title}
                                                        </Link>
                                                        {todo.description && (
                                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                                {todo.description}
                                                            </p>
                                                        )}

                                                        {totalItemsCount > 0 && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                                                                <span className="font-medium">
                                                                    Daftar Periksa: {completedItemsCount}/{totalItemsCount}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Status Badge */}
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(todo.status)}`}
                                                >
                                                    {todo.status === 'completed' ? 'Selesai' : todo.status === 'in_progress' ? 'Sedang Dikerjakan' : todo.status === 'archived' ? 'Diarsipkan' : 'Menunggu'}
                                                </span>
                                            </TableCell>

                                            {/* Priority Badge */}
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium uppercase ${getPriorityBadgeClass(todo.priority)}`}
                                                >
                                                    {todo.priority === 'urgent' ? 'Mendesak' : todo.priority === 'high' ? 'Tinggi' : todo.priority === 'medium' ? 'Sedang' : 'Rendah'}
                                                </span>
                                            </TableCell>

                                            {/* Category */}
                                            <TableCell>
                                                {todo.category ? (
                                                    <span
                                                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                                                        style={{
                                                            backgroundColor: `${todo.category.color}15`,
                                                            borderColor: `${todo.category.color}30`,
                                                            color: todo.category.color,
                                                        }}
                                                    >
                                                        <Tag className="h-3 w-3" />
                                                        {todo.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        Tanpa Kategori
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Assignee */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs text-foreground">
                                                    <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>
                                                        {todo.assignee ? todo.assignee.name : 'Belum Ditugaskan'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Due Date (Formatted in User Timezone) */}
                                            <TableCell>
                                                {todo.due_date ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span>{formatUserDateTime(todo.due_date)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        Tanpa Tenggat
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Meatballs Actions Menu */}
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
                                                        <DropdownMenuSeparator />
                                                        {can('todos.view') && (
                                                            <DropdownMenuItem asChild>
                                                                <Link
                                                                    href={`/${currentTeam.slug}/todos/${todo.id}`}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Lihat Detail
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {can('todos.update') && (
                                                            <>
                                                                <DropdownMenuItem
                                                                    onClick={() => openEditModal(todo)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit Tugas
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleToggleStatus(todo.id)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                    Ubah Status
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {can('todos.delete') && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => setDeletingTodoTarget(todo)}
                                                                    className="text-destructive focus:text-destructive cursor-pointer font-medium"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Hapus Tugas
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
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
                        data={todos}
                        meta={todos.meta}
                        links={todos.links}
                        onPerPageChange={handlePerPageChange}
                    />
                </div>
            </div>

            {/* Create Todo Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setCreateFiles([]);
                }}
                icon={<Plus className="h-5 w-5" />}
                title="Buat Tugas Baru"
                description="Isi detail tugas, tentukan prioritas, penanggung jawab, dan lampirkan berkas untuk tim Anda."
            >
                <form
                    onSubmit={handleCreateSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                            Judul Tugas *
                        </label>
                        <input
                            type="text"
                            required
                            value={createForm.data.title}
                            onChange={(e) =>
                                createForm.setData('title', e.target.value)
                            }
                            placeholder="Masukkan judul tugas..."
                            className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                        />
                        {createForm.errors.title && (
                            <p className="text-destructive mt-1 text-xs">
                                {createForm.errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                            Deskripsi
                        </label>
                        <textarea
                            rows={3}
                            value={createForm.data.description}
                            onChange={(e) =>
                                createForm.setData('description', e.target.value)
                            }
                            placeholder="Deskripsi detail atau langkah-langkah..."
                            className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Prioritas
                            </label>
                            <SearchableSelect
                                value={createForm.data.priority}
                                onChange={(val) =>
                                    createForm.setData('priority', val as any)
                                }
                                options={[
                                    { value: 'low', label: 'Rendah' },
                                    { value: 'medium', label: 'Sedang' },
                                    { value: 'high', label: 'Tinggi' },
                                    { value: 'urgent', label: 'Mendesak' },
                                ]}
                                placeholder="Pilih prioritas"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Kategori
                            </label>
                            <SearchableSelect
                                value={createForm.data.category_id}
                                onChange={(val) =>
                                    createForm.setData('category_id', val)
                                }
                                options={[
                                    { value: '', label: 'Tanpa Kategori' },
                                    ...categories.map((c) => ({
                                        value: String(c.id),
                                        label: c.name,
                                        color: c.color,
                                    })),
                                ]}
                                placeholder="Pilih Kategori"
                                searchPlaceholder="Cari kategori..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Penanggung Jawab
                            </label>
                            <SearchableSelect
                                value={createForm.data.assigned_to_id}
                                onChange={(val) =>
                                    createForm.setData('assigned_to_id', val)
                                }
                                options={[
                                    { value: '', label: 'Pilih Penanggung Jawab' },
                                    ...teamMembers.map((m) => ({
                                        value: String(m.id),
                                        label: m.name,
                                    })),
                                ]}
                                placeholder="Pilih Penanggung Jawab"
                                searchPlaceholder="Cari anggota..."
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Tenggat Waktu
                            </label>
                            <input
                                type="datetime-local"
                                value={createForm.data.due_date}
                                onChange={(e) =>
                                    createForm.setData('due_date', e.target.value)
                                }
                                className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Pengingat Notifikasi
                            </label>
                            <SearchableSelect
                                value={createForm.data.reminder_offset}
                                onChange={(val) =>
                                    createForm.setData('reminder_offset', val)
                                }
                                options={REMINDER_OPTIONS}
                                placeholder="Pilih pengingat"
                                searchPlaceholder="Cari pengingat..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                            Lampiran File
                        </label>
                        <div className="bg-accent/20 border-border space-y-3 rounded-xl border p-4">
                            <input
                                type="file"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files) {
                                        setCreateFiles(Array.from(e.target.files));
                                    }
                                }}
                                className="w-full text-xs"
                            />
                            {createFiles.length > 0 && (
                                <div className="space-y-1">
                                    {createFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="truncate font-medium">{file.name}</span>
                                            <span className="ml-2 shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isPresignedUploading && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                        <span>Mengunggah berkas...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-border flex justify-end gap-2 border-t pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsCreateModalOpen(false);
                                setCreateFiles([]);
                            }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            loading={createForm.processing || isPresignedUploading || isSubmittingCreate}
                            disabled={createForm.processing || isPresignedUploading || isSubmittingCreate}
                        >
                            Buat Tugas
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Todo Modal */}
            <Modal
                isOpen={Boolean(editingTodo)}
                onClose={() => setEditingTodo(null)}
                icon={<Pencil className="h-5 w-5" />}
                title="Edit Tugas"
                description="Perbarui informasi tugas, ubah status alur kerja, atau atur ulang penanggung jawab."
            >
                <form
                    onSubmit={handleEditSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                            Judul Tugas *
                        </label>
                        <input
                            type="text"
                            required
                            value={editForm.data.title}
                            onChange={(e) =>
                                editForm.setData('title', e.target.value)
                            }
                            placeholder="Masukkan judul tugas..."
                            className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                        />
                        {editForm.errors.title && (
                            <p className="text-destructive mt-1 text-xs">
                                {editForm.errors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                            Deskripsi
                        </label>
                        <textarea
                            rows={3}
                            value={editForm.data.description}
                            onChange={(e) =>
                                editForm.setData('description', e.target.value)
                            }
                            placeholder="Deskripsi detail atau langkah-langkah..."
                            className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Status
                            </label>
                            <SearchableSelect
                                value={editForm.data.status}
                                onChange={(val) =>
                                    editForm.setData('status', val as any)
                                }
                                options={[
                                    { value: 'pending', label: 'Menunggu' },
                                    { value: 'in_progress', label: 'Sedang Dikerjakan' },
                                    { value: 'completed', label: 'Selesai' },
                                    { value: 'archived', label: 'Diarsipkan' },
                                ]}
                                placeholder="Pilih status"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Prioritas
                            </label>
                            <SearchableSelect
                                value={editForm.data.priority}
                                onChange={(val) =>
                                    editForm.setData('priority', val as any)
                                }
                                options={[
                                    { value: 'low', label: 'Rendah' },
                                    { value: 'medium', label: 'Sedang' },
                                    { value: 'high', label: 'Tinggi' },
                                    { value: 'urgent', label: 'Mendesak' },
                                ]}
                                placeholder="Pilih prioritas"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Kategori
                            </label>
                            <SearchableSelect
                                value={editForm.data.category_id}
                                onChange={(val) =>
                                    editForm.setData('category_id', val)
                                }
                                options={[
                                    { value: '', label: 'Tanpa Kategori' },
                                    ...categories.map((c) => ({
                                        value: String(c.id),
                                        label: c.name,
                                        color: c.color,
                                    })),
                                ]}
                                placeholder="Pilih Kategori"
                                searchPlaceholder="Cari kategori..."
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Penanggung Jawab
                            </label>
                            <SearchableSelect
                                value={editForm.data.assigned_to_id}
                                onChange={(val) =>
                                    editForm.setData('assigned_to_id', val)
                                }
                                options={[
                                    { value: '', label: 'Pilih Penanggung Jawab' },
                                    ...teamMembers.map((m) => ({
                                        value: String(m.id),
                                        label: m.name,
                                    })),
                                ]}
                                placeholder="Pilih Penanggung Jawab"
                                searchPlaceholder="Cari anggota..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Tenggat Waktu (Waktu Lokal Anda)
                            </label>
                            <input
                                type="datetime-local"
                                value={editForm.data.due_date}
                                onChange={(e) =>
                                    editForm.setData('due_date', e.target.value)
                                }
                                className="bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                Pengingat Notifikasi
                            </label>
                            <SearchableSelect
                                value={editForm.data.reminder_offset}
                                onChange={(val) =>
                                    editForm.setData('reminder_offset', val)
                                }
                                options={REMINDER_OPTIONS}
                                placeholder="Pilih pengingat"
                                searchPlaceholder="Cari pengingat..."
                            />
                        </div>
                    </div>

                    <div className="border-border flex justify-end gap-2 border-t pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setEditingTodo(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            loading={editForm.processing}
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Todo Confirmation Dialog */}
            <ConfirmDialog
                open={deletingTodoTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeletingTodoTarget(null);
                }}
                title="Hapus Tugas"
                description={`Apakah Anda yakin ingin menghapus "${deletingTodoTarget?.title}"? Tugas ini dan daftar periksanya akan dihapus secara permanen.`}
                loading={deletingId !== null}
                onConfirm={executeDeleteTodo}
            />
        </>
    );
}

TodosIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Daftar Tugas',
            href: props.currentTeam ? `/${props.currentTeam.slug}/todos` : '#',
        },
    ],
});
