import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

    const { data, setData, patch, processing, errors } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

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
                    description="Perbarui informasi profil dan alamat email akun Anda"
                />

                <form onSubmit={submit} className="space-y-6">
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
                            loading={processing}
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
