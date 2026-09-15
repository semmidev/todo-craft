import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import AppLayout from '@/layouts/app-layout';

interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon?: string;
    todos_count: number;
}

interface PageProps {
    categories: Category[];
    currentTeam: {
        id: number;
        name: string;
        slug: string;
    };
}

export default function CategoriesIndex({ categories, currentTeam }: PageProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        color: '#3b82f6',
        icon: 'tag',
    });

    const handleCreateSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/${currentTeam.slug}/categories`, {
            onSuccess: () => {
                reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleDelete = (categoryId: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(`/${currentTeam.slug}/categories/${categoryId}`, { preserveScroll: true });
        }
    };

    const presetColors = ['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];

    return (
        <>
            <Head title="Categories - Todo App" />

            <div className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Todo Categories</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Group and organize your team tasks into visual categories.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl shadow hover:bg-primary/90 transition"
                    >
                        <Plus className="w-5 h-5" />
                        Create Category
                    </button>
                </div>

                {categories.length === 0 ? (
                    <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center">
                        <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">No categories yet</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            Create your first category to group your todo tasks.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="bg-card border border-border p-5 rounded-2xl shadow-xs flex items-center justify-between group hover:border-primary/40 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs"
                                        style={{ backgroundColor: cat.color }}
                                    >
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-base">{cat.name}</div>
                                        <div className="text-muted-foreground text-xs">{cat.todos_count} tasks</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-muted-foreground hover:text-destructive p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Category Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold">New Category</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-muted-foreground font-bold">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Design System"
                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                                />
                                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2">Badge Color</label>
                                <div className="flex items-center gap-2">
                                    {presetColors.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setData('color', c)}
                                            className={`w-8 h-8 rounded-full border-2 transition ${
                                                data.color === c ? 'scale-110 border-foreground' : 'border-transparent'
                                            }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0"
                                    />
                                </div>
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
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

CategoriesIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Categories',
            href: props.currentTeam ? `/${props.currentTeam.slug}/categories` : '#',
        },
    ],
});
