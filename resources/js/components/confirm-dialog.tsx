import { AlertTriangle } from 'lucide-react';
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

type ConfirmDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default';
    loading?: boolean;
    onConfirm: () => void;
};

export default function ConfirmDialog({
    open,
    onOpenChange,
    title = 'Apakah Anda yakin?',
    description = 'Tindakan ini tidak dapat dibatalkan.',
    confirmText = 'Hapus',
    cancelText = 'Batal',
    variant = 'destructive',
    loading = false,
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-row items-center gap-3 space-y-0 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-base font-semibold">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-xs">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className="mt-4 gap-2 sm:justify-end">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={loading}
                        >
                            {cancelText}
                        </Button>
                    </DialogClose>
                    <Button
                        type="button"
                        variant={variant}
                        loading={loading}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
