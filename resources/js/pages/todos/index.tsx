import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    Filter,
    Plus,
    Search,
    SlidersHorizontal,
    Tag,
    Trash2,
    UserCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

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

export default function TodosIndex({ todos, categories, teamMembers, stats, filters, sort, currentTeam }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters['search'] || '');
    const [statusFilter, setStatusFilter] = useState(filters['status'] || '');
    const [priorityFilter, setPriorityFilter] = useState(filters['priority'] || '');
    const [categoryFilter, setCategoryFilter] = useState(filters['category_id'] || '');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

        const queryParams: Record<string, any> = {};
        Object.keys(newFilters).forEach((k) => {
            queryParams[`filter[${k}]`] = newFilters[k];
        });

        router.get(`/${currentTeam.slug}/todos`, queryParams, { preserveState: true, replace: true });
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
        router.patch(`/${currentTeam.slug}/todos/${todoId}/toggle-status`, {}, { preserveScroll: true });
    };

    const handleDeleteTodo = (todoId: number) => {
        if (confirm('Are you sure you want to delete this todo task?')) {
            router.delete(`/${currentTeam.slug}/todos/${todoId}`, { preserveScroll: true });
        }
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

            <div className="space-y-6 p-6">
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-500/10">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Team Todos & Workflows</h1>
                        <p className="text-blue-100 text-sm mt-1">
                            Organize tasks, assign team members, attach assets, and track activity audit trails.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl shadow border border-white/20 transition duration-150 ease-in-out cursor-pointer active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        New Todo Task
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
                        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Total Tasks</div>
                        <div className="text-2xl font-bold mt-1">{stats.total}</div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
                        <div className="text-amber-600 dark:text-amber-400 text-xs font-medium uppercase tracking-wider">In Progress</div>
                        <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{stats.in_progress}</div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
                        <div className="text-emerald-600 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider">Completed</div>
                        <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{stats.completed}</div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl shadow-xs">
                        <div className="text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Pending</div>
                        <div className="text-2xl font-bold mt-1">{stats.pending}</div>
                    </div>
                    <div className="bg-card border border-border p-4 rounded-xl shadow-xs col-span-2 md:col-span-1">
                        <div className="text-red-600 dark:text-red-400 text-xs font-medium uppercase tracking-wider">Due Today</div>
                        <div className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{stats.due_today}</div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-card border border-border p-4 rounded-xl space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-ring"
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
                            className="bg-background border border-input text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-ring"
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
                            className="bg-background border border-input text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-ring"
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
                                handleFilterChange('category_id', e.target.value);
                            }}
                            className="bg-background border border-input text-sm rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-ring"
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
                    <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
                        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">No todo tasks found</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Try adjusting your filters or click "New Todo Task" to get started.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {todos.data.map((todo) => (
                            <div
                                key={todo.id}
                                className="group relative bg-card hover:bg-accent/40 border border-border rounded-xl p-5 shadow-xs transition duration-200 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Row: Category & Status */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        {todo.category ? (
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                                                style={{
                                                    backgroundColor: `${todo.category.color}15`,
                                                    borderColor: `${todo.category.color}30`,
                                                    color: todo.category.color,
                                                }}
                                            >
                                                <Tag className="w-3 h-3" />
                                                {todo.category.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-medium">Uncategorized</span>
                                        )}

                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(todo.status)}`}>
                                            {todo.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() => handleToggleStatus(todo.id)}
                                            className="mt-0.5 shrink-0 text-muted-foreground hover:text-emerald-600 transition"
                                            title="Toggle Completion"
                                        >
                                            {todo.status === 'completed' ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 hover:border-emerald-500 transition" />
                                            )}
                                        </button>
                                        <Link
                                            href={`/${currentTeam.slug}/todos/${todo.id}`}
                                            className={`font-semibold text-base hover:text-primary transition line-clamp-2 ${
                                                todo.status === 'completed' ? 'line-through text-muted-foreground' : ''
                                            }`}
                                        >
                                            {todo.title}
                                        </Link>
                                    </div>

                                    {/* Description */}
                                    {todo.description && (
                                        <p className="text-muted-foreground text-xs mt-2 line-clamp-2">{todo.description}</p>
                                    )}

                                    {/* Meta Badges: Priority, Due Date, Items */}
                                    <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                                        <span className={`px-2 py-0.5 rounded-md border font-medium uppercase ${getPriorityBadgeClass(todo.priority)}`}>
                                            {todo.priority}
                                        </span>

                                        {todo.due_date && (
                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(todo.due_date).toLocaleDateString()}
                                            </span>
                                        )}

                                        {todo.attachments && todo.attachments.length > 0 && (
                                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                                <FileText className="w-3.5 h-3.5" />
                                                {todo.attachments.length} files
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Row */}
                                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>{todo.assignee ? todo.assignee.name : 'Unassigned'}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/${currentTeam.slug}/todos/${todo.id}`}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            Details
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteTodo(todo.id)}
                                            className="text-destructive hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                                            title="Delete Todo"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-card border border-border w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">Create New Todo Task</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter task title..."
                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                                />
                                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Detailed description or steps..."
                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Priority</label>
                                    <select
                                        value={data.priority}
                                        onChange={(e: any) => setData('priority', e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Category</label>
                                    <select
                                        value={data.category_id}
                                        onChange={(e) => setData('category_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
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
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Assignee</label>
                                    <select
                                        value={data.assigned_to_id}
                                        onChange={(e) => setData('assigned_to_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                                    >
                                        <option value="">Select Assignee</option>
                                        {teamMembers.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">File Attachments</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setData('attachments', Array.from(e.target.files));
                                        }
                                    }}
                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
                                >
                                    {processing ? 'Saving...' : 'Create Todo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
