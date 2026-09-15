import { router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

type FlashData = {
    toast?: FlashToast;
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
};

export function useFlashToast(): void {
    const lastToastRef = useRef<string | null>(null);

    useEffect(() => {
        const handleFlashData = (flash?: FlashData, errors?: Record<string, string>) => {
            if (flash?.toast?.message && flash.toast.message !== lastToastRef.current) {
                lastToastRef.current = flash.toast.message;
                toast[flash.toast.type || 'success'](flash.toast.message);
                setTimeout(() => {
                    lastToastRef.current = null;
                }, 4000);
            } else if (flash?.error && flash.error !== lastToastRef.current) {
                lastToastRef.current = flash.error;
                toast.error(flash.error);
                setTimeout(() => {
                    lastToastRef.current = null;
                }, 4000);
            } else if (flash?.success && flash.success !== lastToastRef.current) {
                lastToastRef.current = flash.success;
                toast.success(flash.success);
                setTimeout(() => {
                    lastToastRef.current = null;
                }, 4000);
            } else if (errors && Object.keys(errors).length > 0) {
                const firstError = errors.error || Object.values(errors)[0];
                if (typeof firstError === 'string' && firstError !== lastToastRef.current) {
                    lastToastRef.current = firstError;
                    toast.error(firstError);
                    setTimeout(() => {
                        lastToastRef.current = null;
                    }, 4000);
                }
            }
        };

        const unbindFlash = router.on('flash', (event) => {
            const flashData = (event as CustomEvent).detail?.flash;
            handleFlashData(flashData);
        });

        const unbindFinish = router.on('finish', (event) => {
            const pageProps = (event as any).detail?.page?.props;
            handleFlashData(pageProps?.flash, pageProps?.errors);
        });

        const unbindNavigate = router.on('navigate', (event) => {
            const pageProps = (event as any).detail?.page?.props;
            handleFlashData(pageProps?.flash, pageProps?.errors);
        });

        return () => {
            unbindFlash();
            unbindFinish();
            unbindNavigate();
        };
    }, []);
}
