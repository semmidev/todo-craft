import { Head, router, useForm } from '@inertiajs/react';
import { Loader2, Plus, Tag, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';
import ConfirmDialog from '@/components/confirm-dialog';
import Heading from '@/components/heading';
import Modal from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';

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

export default function CategoriesIndex({
    categories,
    currentTeam,
}: PageProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        color: '#3b82f6',
        icon: 'tag',
    });

    useKeyboardShortcut('c', () => {
        setIsCreateModalOpen(true);
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

    const executeDelete = () => {
        if (!deletingCategory) return;
        setDeletingId(deletingCategory.id);
        router.delete(`/${currentTeam.slug}/categories/${deletingCategory.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeletingId(null);
                setDeletingCategory(null);
            },
        });
    };

    const presetColors = [
        '#3b82f6',
        '#10b981',
        '#ef4444',
        '#8b5cf6',
        '#f59e0b',
        '#ec4899',
        '#6366f1',
    ];

    return (
        <>
            <Head title="Kategori - Aplikasi Todo" />

            <div className="w-full flex-1 space-y-8 p-6 lg:p-8">
                <Heading
                    badge="Organisasi Tugas"
                    title="Kategori Todo"
                    description={`Kelompokkan dan atur tugas tim Anda ke dalam kategori visual untuk ${currentTeam.name}.`}
                >
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="cursor-pointer gap-2 font-medium"
                    >
                        <span>Buat Kategori</span>
                        <Kbd className="border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground ml-1">
                            C
                        </Kbd>
                    </Button>
                </Heading>

                {categories.length === 0 ? (
                    <div className="bg-card border-border rounded-2xl border border-dashed p-12 text-center">
                        <Tag className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
                        <h3 className="text-lg font-semibold">
                            Belum ada kategori
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Buat kategori pertama Anda untuk mengelompokkan tugas todo.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {categories.map((cat) => (
                            <div
                                key={cat.id}
                                className="bg-card border-border group hover:border-primary/40 flex items-center justify-between rounded-2xl border p-5 shadow-xs transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-xs"
                                        style={{ backgroundColor: cat.color }}
                                    >
                                        <Tag className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-base font-bold">
                                            {cat.name}
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {cat.todos_count} tugas
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setDeletingCategory(cat)}
                                    disabled={deletingId === cat.id}
                                    className="text-muted-foreground hover:text-destructive rounded-lg p-2 transition group-hover:opacity-100 disabled:opacity-50 cursor-pointer"
                                >
                                    {deletingId === cat.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Category Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Kategori Baru"
                maxWidth="md"
            >
                <form
                    onSubmit={handleCreateSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="mb-1 block text-xs font-semibold tracking-wider uppercase">
                            Nama Kategori *
                        </label>
                        <input
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) =>
                                setData('name', e.target.value)
                            }
                            placeholder="mis. Sistem Desain"
                            className="bg-background border-input w-full rounded-lg border px-3 py-2 text-sm"
                        />
                        {errors.name && (
                            <p className="text-destructive mt-1 text-xs">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-semibold tracking-wider uppercase">
                            Warna Lencana
                        </label>
                        <div className="flex items-center gap-2">
                            {presetColors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setData('color', c)}
                                    className={`h-8 w-8 rounded-full border-2 transition cursor-pointer ${
                                        data.color === c
                                            ? 'border-foreground scale-110'
                                            : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <input
                                type="color"
                                value={data.color}
                                onChange={(e) =>
                                    setData('color', e.target.value)
                                }
                                className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent"
                            />
                        </div>
                    </div>

                    <div className="border-border flex justify-end gap-2 border-t pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            loading={processing}
                        >
                            Simpan Kategori
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Category Confirmation Dialog */}
            <ConfirmDialog
                open={deletingCategory !== null}
                onOpenChange={(open) => {
                    if (!open) setDeletingCategory(null);
                }}
                title="Hapus Kategori"
                description={`Apakah Anda yakin ingin menghapus "${deletingCategory?.name}"? Tugas yang terkait dengan kategori ini akan tetap disimpan.`}
                loading={deletingId !== null}
                onConfirm={executeDelete}
            />
        </>
    );
}

CategoriesIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Kategori',
            href: props.currentTeam
                ? `/${props.currentTeam.slug}/categories`
                : '#',
        },
    ],
});
