import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { usePresignedUpload } from '@/hooks/use-presigned-upload';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(auth.user.avatar || null);
    const { uploadFile, isUploading, progress, error: uploadError } = usePresignedUpload();

    const { data, setData, patch, processing, errors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        avatar: auth.user.avatar || '',
    });

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Local instant preview
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        try {
            const result = await uploadFile(file);
            setData('avatar', result.key);
        } catch {
            setPreviewUrl(auth.user.avatar || null);
        }
    };

    const handleRemoveAvatar = () => {
        setPreviewUrl(null);
        setData('avatar', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch('/settings/profile', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Profil" />

            <h1 className="sr-only">Profil</h1>

            <div className="space-y-6">
                <Heading
                    badge="Profil Akun"
                    title="Profil"
                    description="Perbarui informasi profil, foto profil, dan alamat email akun Anda"
                />

                <form onSubmit={submit} className="space-y-6">
                    {/* Avatar Upload Section */}
                    <div className="space-y-2">
                        <Label>Foto Profil</Label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-card dark:bg-card/50">
                            <div className="relative group">
                                <Avatar className="h-20 w-20 border-2 border-background shadow-md">
                                    {previewUrl ? (
                                        <AvatarImage src={previewUrl} alt={data.name} className="object-cover" />
                                    ) : null}
                                    <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                                        {getInitials(data.name || auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>

                                {isUploading && (
                                    <div className="absolute inset-0 bg-background/70 backdrop-blur-xs rounded-full flex flex-col items-center justify-center p-1">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <span className="text-[10px] font-semibold mt-0.5">{progress}%</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp, image/gif"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={isUploading || processing}
                                    />

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading || processing}
                                        className="gap-2"
                                    >
                                        {isUploading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Upload className="h-4 w-4" />
                                        )}
                                        {previewUrl ? 'Ubah Foto' : 'Unggah Foto'}
                                    </Button>

                                    {previewUrl && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveAvatar}
                                            disabled={isUploading || processing}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Hapus Foto
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Format JPG, PNG, WEBP, atau GIF (Maks. 10MB). Diunggah aman ke S3.
                                </p>

                                {uploadError && (
                                    <p className="text-xs font-medium text-destructive mt-1">
                                        {uploadError}
                                    </p>
                                )}
                            </div>
                        </div>
                        <InputError className="mt-2" message={errors.avatar} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lengkap</Label>

                        <Input
                            id="name"
                            className="mt-1 block w-full"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Nama Lengkap"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Alamat email</Label>

                        <Input
                            id="email"
                            type="email"
                            className="mt-1 block w-full"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Alamat email"
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {mustVerifyEmail &&
                        auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Alamat email Anda belum diverifikasi.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Klik di sini untuk mengirim ulang email verifikasi.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        Tautan verifikasi baru telah dikirim ke alamat email Anda.
                                    </div>
                                )}
                            </div>
                        )}

                    <div className="flex items-center gap-4">
                        <Button
                            loading={processing || isUploading}
                            data-test="update-profile-button"
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profil',
            href: edit(),
        },
    ],
};
