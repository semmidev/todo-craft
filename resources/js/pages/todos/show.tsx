import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckSquare,
    Clock,
    FileText,
    History,
    Paperclip,
    Tag,
    User,
    UserCheck,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { usePresignedUpload } from '@/hooks/use-presigned-upload';
import { formatUserDateTime } from '@/lib/date-utils';

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
    const { uploadMultiple, isUploading: isPresignedUploading, progress } = usePresignedUpload();
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmittingUpload, setIsSubmittingUpload] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const handleToggleItem = (itemId: number) => {
        router.patch(
            `/${currentTeam.slug}/todos/${todo.id}/items/${itemId}/toggle`,
            {},
            { preserveScroll: true },
        );
    };

    const handleUploadFiles = async (e: FormEvent) => {
        e.preventDefault();
        if (files.length === 0) return;

        setIsSubmittingUpload(true);
        try {
            const uploadResults = await uploadMultiple(files);
            const attachmentKeys = uploadResults.map((res) => ({ key: res.key }));

            router.put(
                `/${currentTeam.slug}/todos/${todo.id}`,
                {
                    title: todo.title,
                    status: todo.status,
                    priority: todo.priority,
                    attachment_keys: attachmentKeys,
                },
                {
                    onSuccess: () => {
                        setFiles([]);
                        setIsUploading(false);
                    },
                    onFinish: () => setIsSubmittingUpload(false),
                },
            );
        } catch {
            setIsSubmittingUpload(false);
        }
    };

    return (
        <>
            <Head title={`Todo: ${todo.title}`} />

            <div className="w-full flex-1 space-y-8 p-6 lg:p-8">
                <Heading
                    badge="Task Details"
                    title={todo.title}
                    description={`Detailed view, checklist, attachments, and audit history for ${currentTeam.name}.`}
                >
                    <Link
                        href={`/${currentTeam.slug}/todos`}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#e7e6e1] bg-[#efeeeb] px-4 py-2.5 text-sm font-medium text-[#121212] transition-colors hover:bg-[#e7e6e1] dark:border-[#2f2f2c] dark:bg-[#282826] dark:text-[#f8f8f6] dark:hover:bg-[#373734]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Todos
                    </Link>
                </Heading>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content (2 Cols) */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Title Header Card */}
                        <div className="bg-card border-border space-y-4 rounded-2xl border p-6 shadow-xs">
                            <div className="flex items-center gap-2">
                                {todo.category && (
                                    <span
                                        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                                        style={{
                                            backgroundColor: `${todo.category.color}15`,
                                            borderColor: `${todo.category.color}30`,
                                            color: todo.category.color,
                                        }}
                                    >
                                        <Tag className="h-3 w-3" />
                                        {todo.category.name}
                                    </span>
                                )}
                                <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase">
                                    {todo.priority} Priority
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight">
                                {todo.title}
                            </h1>

                            {todo.description ? (
                                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                                    {todo.description}
                                </p>
                            ) : (
                                <p className="text-muted-foreground/60 text-sm italic">
                                    No description provided.
                                </p>
                            )}
                        </div>

                        {/* Checklist Section */}
                        <div className="bg-card border-border space-y-4 rounded-2xl border p-6 shadow-xs">
                            <h3 className="flex items-center gap-2 text-lg font-bold">
                                <CheckSquare className="text-primary h-5 w-5" />
                                Checklist Items
                            </h3>

                            {todo.items && todo.items.length > 0 ? (
                                <div className="space-y-2">
                                    {todo.items.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() =>
                                                handleToggleItem(item.id)
                                            }
                                            className="bg-accent/30 hover:bg-accent/60 border-border/50 flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={item.is_completed}
                                                onChange={() => {}}
                                                className="text-primary h-4 w-4 rounded"
                                            />
                                            <span
                                                className={`text-sm font-medium ${
                                                    item.is_completed
                                                        ? 'text-muted-foreground line-through'
                                                        : ''
                                                }`}
                                            >
                                                {item.title}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm italic">
                                    No checklist items defined.
                                </p>
                            )}
                        </div>

                        {/* File Attachments */}
                        <div className="bg-card border-border space-y-4 rounded-2xl border p-6 shadow-xs">
                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-lg font-bold">
                                    <Paperclip className="text-primary h-5 w-5" />
                                    File Attachments (
                                    {todo.attachments?.length || 0})
                                </h3>
                                <button
                                    onClick={() => setIsUploading(!isUploading)}
                                    className="text-primary text-xs font-semibold hover:underline"
                                >
                                    {isUploading ? 'Cancel' : '+ Add Files'}
                                </button>
                            </div>

                            {isUploading && (
                                <form
                                    onSubmit={handleUploadFiles}
                                    className="bg-accent/20 border-border space-y-3 rounded-xl border p-4"
                                >
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) =>
                                            e.target.files &&
                                            setFiles(Array.from(e.target.files))
                                        }
                                        className="w-full text-xs"
                                    />
                                    {isPresignedUploading && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                                <span>Mengunggah via Presigned URL...</span>
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
                                    <Button
                                        type="submit"
                                        size="sm"
                                        loading={isSubmittingUpload || isPresignedUploading}
                                        disabled={files.length === 0 || isPresignedUploading}
                                    >
                                        Upload via Presigned URL
                                    </Button>
                                </form>
                            )}

                            {todo.attachments && todo.attachments.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {todo.attachments.map((file) => (
                                        <a
                                            key={file.id}
                                            href={file.original_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group border-border bg-background hover:bg-accent block rounded-xl border p-3 transition"
                                        >
                                            {file.mime_type?.startsWith(
                                                'image/',
                                            ) ? (
                                                <img
                                                    src={file.thumb_url}
                                                    alt={file.name}
                                                    className="mb-2 h-24 w-full rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="bg-accent/50 mb-2 flex h-24 w-full items-center justify-center rounded-lg">
                                                    <FileText className="text-muted-foreground h-8 w-8" />
                                                </div>
                                            )}
                                            <div className="truncate text-xs font-medium">
                                                {file.file_name}
                                            </div>
                                            <div className="text-muted-foreground text-[10px]">
                                                {(file.size / 1024).toFixed(1)}{' '}
                                                KB
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm italic">
                                    No files attached to this todo.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar (1 Col): Activity Log & Meta */}
                    <div className="space-y-6">
                        {/* Status & Metadata */}
                        <div className="bg-card border-border space-y-4 rounded-2xl border p-6 shadow-xs">
                            <h3 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                                Metadata
                            </h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" /> Status
                                    </span>
                                    <span className="font-semibold capitalize">
                                        {todo.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <UserCheck className="h-4 w-4" />{' '}
                                        Assignee
                                    </span>
                                    <span className="font-semibold">
                                        {todo.assignee
                                            ? todo.assignee.name
                                            : 'Unassigned'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <User className="h-4 w-4" /> Created By
                                    </span>
                                    <span className="font-semibold">
                                        {todo.creator
                                            ? todo.creator.name
                                            : 'System'}
                                    </span>
                                </div>

                                {todo.due_date && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4" /> Due
                                            Date
                                        </span>
                                        <span className="font-semibold">
                                            {formatUserDateTime(todo.due_date)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Audit Trail Stream (Spatie Activitylog) */}
                        <div className="bg-card border-border space-y-4 rounded-2xl border p-6 shadow-xs">
                            <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                                <History className="text-primary h-4 w-4" />
                                Audit Trail Log
                            </h3>

                            {todo.activities && todo.activities.length > 0 ? (
                                <div className="before:bg-border relative space-y-4 before:absolute before:inset-0 before:left-3 before:w-0.5">
                                    {todo.activities.map((act) => (
                                        <div
                                            key={act.id}
                                            className="relative space-y-1 pl-7 text-xs"
                                        >
                                            <div className="bg-primary ring-background absolute top-1 left-1.5 h-3 w-3 rounded-full ring-4" />
                                            <div className="font-semibold">
                                                {act.description}
                                            </div>
                                            <div className="text-muted-foreground text-[11px]">
                                                {act.causer
                                                    ? act.causer.name
                                                    : 'User'}{' '}
                                                • {act.created_at}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-xs italic">
                                    No activity logged yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

TodoShow.layout = (props: {
    currentTeam?: { slug: string } | null;
    todo?: { id: number; title: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Todos',
            href: props.currentTeam ? `/${props.currentTeam.slug}/todos` : '#',
        },
        {
            title: props.todo?.title ?? 'Todo Detail',
            href:
                props.currentTeam && props.todo
                    ? `/${props.currentTeam.slug}/todos/${props.todo.id}`
                    : '#',
        },
    ],
});
