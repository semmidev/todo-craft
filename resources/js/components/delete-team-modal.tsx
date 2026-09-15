import { Form } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { destroy } from '@/routes/teams';
import type { Team } from '@/types';

type Props = {
    team: Team;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export default function DeleteTeamModal({ team, open, onOpenChange }: Props) {
    const [confirmationName, setConfirmationName] = useState('');

    const canDeleteTeam = confirmationName === team.name;

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
            setConfirmationName('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <Form
                    key={String(open)}
                    action={destroy.url(team.slug)}
                    method="delete"
                    className="space-y-6"
                    onSuccess={() => handleOpenChange(false)}
                >
                    {({ errors, processing }) => (
                        <>
                            <DialogHeader>
                                <DialogTitle>Apakah Anda yakin?</DialogTitle>
                                <DialogDescription>
                                    Tindakan ini tidak dapat dibatalkan. Ini akan
                                    menghapus tim{' '}
                                    <strong>"{team.name}"</strong> secara permanen.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmation-name">
                                        Ketik <strong>"{team.name}"</strong> untuk
                                        mengonfirmasi
                                    </Label>
                                    <Input
                                        id="confirmation-name"
                                        name="name"
                                        data-test="delete-team-name"
                                        value={confirmationName}
                                        onChange={(event) =>
                                            setConfirmationName(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Masukkan nama tim"
                                        autoComplete="off"
                                    />
                                    <InputError message={errors.name} />
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">Batal</Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    type="submit"
                                    data-test="delete-team-confirm"
                                    disabled={!canDeleteTeam}
                                    loading={processing}
                                >
                                    Hapus tim
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}
