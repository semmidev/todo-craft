import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckSquare,
    Clock,
    FileText,
    History,
    Paperclip,
    Plus,
    Tag,
    Trash2,
    User,
    UserCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Category {
    id: number;
    name: string;
    color: string;
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

interface Activity {
    id: number;
    description: string;
    event?: string;
    causer?: { id: number; name: string };
    properties?: any;
    created_at: string;
}

interface TodoDetail {
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
    activities?: Activity[];
    created_at: string;
    updated_at: string;
}

interface PageProps {
    todo: TodoDetail;
    currentTeam: {
        id: number;
        name: string;
        slug: string;
    };
}

export default function TodoShow({ todo, currentTeam }: PageProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleToggleItem = (itemId: number) => {
        router.patch(
            `/${currentTeam.slug}/todos/${todo.id}/items/${itemId}/toggle`,
            {},
            { preserveScroll: true }
        );
    };

    const handleUploadFiles = (e: FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach((f) => formData.append('attachments[]', f));
        formData.append('title', todo.title);
        formData.append('status', todo.status);
        formData.append('priority', todo.priority);
        formData.append('_method', 'PUT');

        router.post(`/${currentTeam.slug}/todos/${todo.id}`, formData, {
            onSuccess: () => {
                setFiles([]);
                setIsUploading(false);
            },
        });
    };

    return (
        <>
            <Head title={`Todo: ${todo.title}`} />

            <div className="space-y-6 p-6 max-w-6xl mx-auto">
                {/* Top Navigation */}
                <Link
                    href={`/${currentTeam.slug}/todos`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Todos
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content (2 Cols) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title Header Card */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                            <div className="flex items-center gap-2">
                                {todo.category && (
                                    <span
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                                        style={{
                                            backgroundColor: `${todo.category.color}15`,
                                            borderColor: `${todo.category.color}30`,
                                            color: todo.category.color,
                                        }}
                                    >
                                        <Tag className="w-3 h-3" />
                                        {todo.category.name}
                                    </span>
                                )}
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-secondary text-secondary-foreground">
                                    {todo.priority} Priority
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight">{todo.title}</h1>

                            {todo.description ? (
                                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                                    {todo.description}
                                </p>
                            ) : (
                                <p className="text-muted-foreground/60 text-sm italic">No description provided.</p>
                            )}
                        </div>

                        {/* Checklist Section */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-primary" />
                                Checklist Items
                            </h3>

                            {todo.items && todo.items.length > 0 ? (
                                <div className="space-y-2">
                                    {todo.items.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleToggleItem(item.id)}
                                            className="flex items-center gap-3 p-3 bg-accent/30 hover:bg-accent/60 rounded-xl border border-border/50 cursor-pointer transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.is_completed}
                                                onChange={() => {}}
                                                className="w-4 h-4 rounded text-primary"
                                            />
                                            <span
                                                className={`text-sm font-medium ${
                                                    item.is_completed ? 'line-through text-muted-foreground' : ''
                                                }`}
                                            >
                                                {item.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm italic">No checklist items defined.</p>
                            )}
                        </div>

                        {/* File Attachments */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Paperclip className="w-5 h-5 text-primary" />
                                    File Attachments ({todo.attachments?.length || 0})
                                </h3>
                                <button
                                    onClick={() => setIsUploading(!isUploading)}
                                    className="text-xs text-primary hover:underline font-semibold"
                                >
                                    {isUploading ? 'Cancel' : '+ Add Files'}
                                </button>
                            </div>

                            {isUploading && (
                                <form onSubmit={handleUploadFiles} className="space-y-3 bg-accent/20 p-4 rounded-xl border border-border">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))}
                                        className="text-xs w-full"
                                    />
                                    <button
                                        type="submit"
                                        disabled={files.length === 0}
                                        className="px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg font-medium"
                                    >
                                        Upload
                                    </button>
                                </form>
                            )}

                            {todo.attachments && todo.attachments.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {todo.attachments.map((file) => (
                                        <a
                                            key={file.id}
                                            href={file.original_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group block border border-border rounded-xl p-3 bg-background hover:bg-accent transition"
                                        >
                                            {file.mime_type?.startsWith('image/') ? (
                                                <img
                                                    src={file.thumb_url}
                                                    alt={file.name}
                                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                                />
                                            ) : (
                                                <div className="w-full h-24 bg-accent/50 rounded-lg mb-2 flex items-center justify-center">
                                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="text-xs font-medium truncate">{file.file_name}</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm italic">No files attached to this todo.</p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar (1 Col): Activity Log & Meta */}
                    <div className="space-y-6">
                        {/* Status & Metadata */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Metadata</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" /> Status
                                    </span>
                                    <span className="font-semibold capitalize">{todo.status.replace('_', ' ')}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <UserCheck className="w-4 h-4" /> Assignee
                                    </span>
                                    <span className="font-semibold">{todo.assignee ? todo.assignee.name : 'Unassigned'}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <User className="w-4 h-4" /> Created By
                                    </span>
                                    <span className="font-semibold">{todo.creator ? todo.creator.name : 'System'}</span>
                                </div>

                                {todo.due_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" /> Due Date
                                        </span>
                                        <span className="font-semibold">{new Date(todo.due_date).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audit Trail Stream (Spatie Activitylog) */}
                        <div className="bg-card border border-border p-6 rounded-2xl shadow-xs space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <History className="w-4 h-4 text-primary" />
                                Audit Trail Log
                            </h3>

                            {todo.activities && todo.activities.length > 0 ? (
                                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-border">
                                    {todo.activities.map((act) => (
                                        <div key={act.id} className="relative pl-7 text-xs space-y-1">
                                            <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
                                            <div className="font-semibold">{act.description}</div>
                                            <div className="text-muted-foreground text-[11px]">
                                                {act.causer ? act.causer.name : 'User'} • {act.created_at}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-xs italic">No activity logged yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

TodoShow.layout = (props: { currentTeam?: { slug: string } | null; todo?: { id: number; title: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Todos',
            href: props.currentTeam ? `/${props.currentTeam.slug}/todos` : '#',
        },
        {
            title: props.todo?.title ?? 'Todo Detail',
            href: props.currentTeam && props.todo ? `/${props.currentTeam.slug}/todos/${props.todo.id}` : '#',
        },
    ],
});
