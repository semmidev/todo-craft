import { useForm } from '@inertiajs/react';
import { FormEvent, useRef, useState } from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser = (e: FormEvent) => {
        e.preventDefault();

        destroy('/settings/profile', {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                reset();
            },
            onError: () => passwordInput.current?.focus(),
        });
    };

    const closeModal = () => {
        setOpen(false);
        reset();
        clearErrors();
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Hapus akun"
                description="Hapus akun Anda beserta seluruh sumber dayanya"
            />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Peringatan</p>
                    <p className="text-sm">
                        Harap berhati-hati, tindakan ini tidak dapat dibatalkan.
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            Hapus akun
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Apakah Anda yakin ingin menghapus akun Anda?
                        </DialogTitle>
                        <DialogDescription>
                            Setelah akun Anda dihapus, semua sumber daya dan datanya
                            akan dihapus secara permanen. Silakan masukkan kata sandi Anda
                            untuk mengonfirmasi penghapusan akun secara permanen.
                        </DialogDescription>

                        <form onSubmit={deleteUser} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    Kata sandi
                                </Label>

                                <PasswordInput
                                    id="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    placeholder="Kata sandi"
                                    autoComplete="current-password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={closeModal}
                                    >
                                        Batal
                                    </Button>
                                </DialogClose>

                                <Button
                                    type="submit"
                                    variant="destructive"
                                    loading={processing}
                                    data-test="confirm-delete-user-button"
                                >
                                    Hapus akun
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
