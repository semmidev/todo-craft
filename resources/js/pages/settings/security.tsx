import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Link2, Unlink } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

type Props = {
    hasPassword: boolean;
    isGoogleConnected: boolean;
    googleEmail?: string | null;
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [disconnecting, setDisconnecting] = useState(false);

    const { data, setData, put, errors, processing, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (err) => {
                if (err.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (err.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const handleDisconnectGoogle = () => {
        if (!props.hasPassword) {
            return;
        }

        setDisconnecting(true);
        router.delete('/settings/google/disconnect', {
            preserveScroll: true,
            onFinish: () => setDisconnecting(false),
        });
    };

    const handleConnectGoogle = () => {
        window.location.href = '/auth/google';
    };

    return (
        <>
            <Head title="Pengaturan Keamanan" />

            <h1 className="sr-only">Pengaturan Keamanan</h1>

            <div className="space-y-6">
                <Heading
                    badge="Otentikasi & Kredensial"
                    title="Pengaturan Keamanan"
                    description="Kelola kata sandi, passkey, koneksi Google, dan otentikasi dua faktor Anda"
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="current_password">
                                Kata sandi saat ini
                            </Label>
                            {!props.hasPassword && (
                                <span className="text-xs text-muted-foreground font-medium">
                                    (Opsional - Anda masuk via Google)
                                </span>
                            )}
                        </div>

                        <PasswordInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            placeholder={
                                props.hasPassword
                                    ? 'Kata sandi saat ini'
                                    : 'Tidak diperlukan (masuk via Google)'
                            }
                        />

                        <InputError message={errors.current_password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Kata sandi baru</Label>

                        <PasswordInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder="Kata sandi baru"
                            passwordrules={props.passwordRules}
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Konfirmasi kata sandi
                        </Label>

                        <PasswordInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            className="mt-1 block w-full"
                            autoComplete="new-password"
                            placeholder="Konfirmasi kata sandi"
                            passwordrules={props.passwordRules}
                        />

                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            loading={processing}
                            data-test="update-password-button"
                        >
                            Simpan Kata Sandi
                        </Button>
                    </div>
                </form>

                {/* Google Connection Card */}
                <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-foreground">
                                    Koneksi Akun Google
                                </h3>
                                {props.isGoogleConnected ? (
                                    <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-900 gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Terhubung
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        Belum Terhubung
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Tautkan akun Google Anda untuk kemudahan masuk secara cepat dan aman.
                                Email akun Google harus sama dengan email pendaftaran Anda.
                            </p>
                        </div>

                        <div>
                            {props.isGoogleConnected ? (
                                <Button
                                    variant="outline"
                                    onClick={handleDisconnectGoogle}
                                    loading={disconnecting}
                                    disabled={!props.hasPassword}
                                    className="cursor-pointer gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Unlink className="h-4 w-4" />
                                    Putuskan Sambungan
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleConnectGoogle}
                                    variant="outline"
                                    className="cursor-pointer gap-2"
                                >
                                    <Link2 className="h-4 w-4 text-blue-500" />
                                    Hubungkan Google
                                </Button>
                            )}
                        </div>
                    </div>

                    {props.isGoogleConnected && props.googleEmail && (
                        <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground flex items-center justify-between">
                            <span>Akun Google Terhubung:</span>
                            <span className="font-semibold text-foreground">{props.googleEmail}</span>
                        </div>
                    )}

                    {!props.hasPassword && props.isGoogleConnected && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            * Anda belum membuat kata sandi lokal. Atur kata sandi baru di atas terlebih dahulu jika ingin memutuskan sambungan akun Google.
                        </p>
                    )}
                </div>
            </div>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Keamanan',
            href: edit(),
        },
    ],
};
