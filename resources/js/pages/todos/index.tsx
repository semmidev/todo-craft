import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Plus,
    Search,
    Tag,
    Trash2,
    UserCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';

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
        links: any[];
        meta: any;
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
    sort: _sort,
    currentTeam,
}: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters['search'] || '');
    const [statusFilter, setStatusFilter] = useState(filters['status'] || '');
    const [priorityFilter, setPriorityFilter] = useState(
        filters['priority'] || '',
    );
    const [categoryFilter, setCategoryFilter] = useState(
        filters['category_id'] || '',
    );
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingTodoTarget, setDeletingTodoTarget] = useState<Todo | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Form for creating Todo
    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'urgent';
        status: 'pending' | 'in_progress' | 'completed' | 'archived';
        category_id: string;
        assigned_to_id: string;
        due_date: string;
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
        attachments: [],
        items: [{ title: '', is_completed: false }],
    });

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (!value) delete newFilters[key];

        router.get(`/${currentTeam.slug}/todos`, newFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleFilterChange('search', searchQuery);
    };

    const handleCreateSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${currentTeam.slug}/todos`, {
            onSuccess: () => {
                reset();
                setIsCreateModalOpen(false);
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
            <Head title="Todos - Management" />

            <div className="w-full flex-1 space-y-8 p-6 lg:p-8">
                <Heading
                    badge="Tasks & Workflows"
                    title="Team Todos & Workflows"
                    description={`Organize tasks, assign team members, attach assets, and track activity audit trails for ${currentTeam.name}.`}
                >
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#121212] px-4 py-2.5 text-sm font-medium text-[#f8f8f6] shadow-sm transition-colors hover:bg-[#373734] dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                    >
                        <Plus className="size-4" />
                        New Todo Task
                    </button>
                </Heading>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <div className="bg-card border-border rounded-xl border p-4 shadow-xs">
                        <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                            Total Tasks
                        </div>
                        <div className="mt-1 text-2xl font-bold">
                            {stats.total}
                        </div>
                    </div>
                    <div className="bg-card border-border rounded-xl border p-4 shadow-xs">
                        <div className="text-xs font-medium tracking-wider text-amber-600 uppercase dark:text-amber-400">
                            In Progress
                        </div>
                        <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {stats.in_progress}
                        </div>
                    </div>
                    <div className="bg-card border-border rounded-xl border p-4 shadow-xs">
                        <div className="text-xs font-medium tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                            Completed
                        </div>
                        <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats.completed}
                        </div>
                    </div>
                    <div className="bg-card border-border rounded-xl border p-4 shadow-xs">
                        <div className="text-xs font-medium tracking-wider text-slate-600 uppercase dark:text-slate-400">
                            Pending
                        </div>
                        <div className="mt-1 text-2xl font-bold">
                            {stats.pending}
                        </div>
                    </div>
                    <div className="bg-card border-border col-span-2 rounded-xl border p-4 shadow-xs md:col-span-1">
                        <div className="text-xs font-medium tracking-wider text-red-600 uppercase dark:text-red-400">
                            Due Today
                        </div>
                        <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.due_today}
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-card border-border gap-4 space-y-4 rounded-xl border p-4 md:flex md:items-center md:justify-between md:space-y-0">
                    <form
                        onSubmit={handleSearchSubmit}
                        className="relative max-w-md flex-1"
                    >
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background border-input focus:ring-ring w-full rounded-lg border py-2 pr-4 pl-9 text-sm focus:ring-2 focus:outline-hidden"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                handleFilterChange('status', e.target.value);
                            }}
                            className="bg-background border-input focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-hidden"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>

                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                handleFilterChange('priority', e.target.value);
                            }}
                            className="bg-background border-input focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-hidden"
                        >
                            <option value="">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                handleFilterChange(
                                    'category_id',
                                    e.target.value,
                                );
                            }}
                            className="bg-background border-input focus:ring-ring rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-hidden"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Todo List Cards */}
                {todos.data.length === 0 ? (
                    <div className="bg-card border-border rounded-xl border border-dashed p-12 text-center">
                        <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
                        <h3 className="text-lg font-semibold">
                            No todo tasks found
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Try adjusting your filters or click "New Todo Task"
                            to get started.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {todos.data.map((todo) => (
                            <div
                                key={todo.id}
                                className="group bg-card hover:bg-accent/40 border-border relative flex flex-col justify-between rounded-xl border p-5 shadow-xs transition duration-200"
                            >
                                <div>
                                    {/* Top Row: Category & Status */}
                                    <div className="mb-3 flex items-center justify-between gap-2">
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
                                            <span className="text-muted-foreground text-xs font-medium">
                                                Uncategorized
                                            </span>
                                        )}

                                        <span
                                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(todo.status)}`}
                                        >
                                            {todo.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() =>
                                                handleToggleStatus(todo.id)
                                            }
                                            className="text-muted-foreground mt-0.5 shrink-0 transition hover:text-emerald-600"
                                            title="Toggle Completion"
                                        >
                                            {todo.status === 'completed' ? (
                                                <CheckCircle2 className="h-5 w-5 fill-emerald-500/20 text-emerald-500" />
                                            ) : (
                                                <div className="border-muted-foreground/40 h-5 w-5 rounded-full border-2 transition hover:border-emerald-500" />
                                            )}
                                        </button>
                                        <Link
                                            href={`/${currentTeam.slug}/todos/${todo.id}`}
                                            className={`hover:text-primary line-clamp-2 text-base font-semibold transition ${
                                                todo.status === 'completed'
                                                    ? 'text-muted-foreground line-through'
                                                    : ''
                                            }`}
                                        >
                                            {todo.title}
                                        </Link>
                                    </div>

                                    {/* Description */}
                                    {todo.description && (
                                        <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
                                            {todo.description}
                                        </p>
                                    )}

                                    {/* Meta Badges: Priority, Due Date, Items */}
                                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                        <span
                                            className={`rounded-md border px-2 py-0.5 font-medium uppercase ${getPriorityBadgeClass(todo.priority)}`}
                                        >
                                            {todo.priority}
                                        </span>

                                        {todo.due_date && (
                                            <span className="text-muted-foreground inline-flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(
                                                    todo.due_date,
                                                ).toLocaleDateString()}
                                            </span>
                                        )}

                                        {todo.attachments &&
                                            todo.attachments.length > 0 && (
                                                <span className="text-muted-foreground inline-flex items-center gap-1">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {todo.attachments.length}{' '}
                                                    files
                                                </span>
                                            )}
                                    </div>
                                </div>

                                {/* Footer Row */}
                                <div className="border-border text-muted-foreground mt-5 flex items-center justify-between border-t pt-3 text-xs">
                                    <div className="flex items-center gap-1">
                                        <UserCheck className="h-3.5 w-3.5" />
                                        <span>
                                            {todo.assignee
                                                ? todo.assignee.name
                                                : 'Unassigned'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/${currentTeam.slug}/todos/${todo.id}`}
                                            className="text-primary font-medium hover:underline"
                                        >
                                            Details
                                        </Link>
                                        <button
                                            onClick={() =>
                                                setDeletingTodoTarget(todo)
                                            }
                                            disabled={deletingId === todo.id}
                                            className="text-destructive transition group-hover:opacity-100 hover:text-red-700 disabled:opacity-50 cursor-pointer"
                                            title="Delete Todo"
                                        >
                                            {deletingId === todo.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Todo Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="bg-card border-border max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Create New Todo Task
                            </h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="Enter task title..."
                                    className="bg-background border-input w-full rounded-lg border px-3 py-2 text-sm"
                                />
                                {errors.title && (
                                    <p className="text-destructive mt-1 text-xs">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Detailed description or steps..."
                                    className="bg-background border-input w-full rounded-lg border px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                        Priority
                                    </label>
                                    <select
                                        value={data.priority}
                                        onChange={(e: any) =>
                                            setData('priority', e.target.value)
                                        }
                                        className="bg-background border-input w-full rounded-lg border px-3 py-2 text-sm"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                        Category
                                    </label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) =>
                                            setData(
                                                'category_id',
                                                e.target.value,
                                            )
                                        }
                                        className="bg-background border-input w-full rounded-lg border px-3 py-2 text-sm"
                                    >
                                        <option value="">None</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                        Assignee
                                    </label>
                                    <select
                                        value={data.assigned_to_id}
                                        onChange={(e) =>
                                            setData(
                                                'assigned_to_id',
                                                e.target.value,
                                            )
                                        }
                                        className="bg-background border-input w-full rounded-lg border px-3 py-2 text-sm"
                                    >
                                        <option value="">
                                            Select Assignee
                                        </option>
                                        {teamMembers.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                        Due Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.due_date}
                                        onChange={(e) =>
                                            setData('due_date', e.target.value)
                                        }
                                        className="bg-background border-input w-full rounded-lg border px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                                    File Attachments
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setData(
                                                'attachments',
                                                Array.from(e.target.files),
                                            );
                                        }
                                    }}
                                    className="bg-background border-input w-full rounded-lg border px-3 py-2 text-xs"
                                />
                            </div>

                            <div className="border-border flex justify-end gap-2 border-t pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={processing}
                                >
                                    Create Todo
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Todo Confirmation Dialog */}
            <ConfirmDialog
                open={deletingTodoTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setDeletingTodoTarget(null);
                }}
                title="Delete Todo Task"
                description={`Are you sure you want to delete "${deletingTodoTarget?.title}"? This task and its subtasks will be permanently deleted.`}
                loading={deletingId !== null}
                onConfirm={executeDeleteTodo}
            />
        </>
    );
}

TodosIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Todos',
            href: props.currentTeam ? `/${props.currentTeam.slug}/todos` : '#',
        },
    ],
});
