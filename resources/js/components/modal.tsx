import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    icon?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
};

export default function Modal({
    isOpen,
    onClose,
    icon,
    title,
    description,
    children,
    maxWidth = 'lg',
    className,
}: ModalProps) {
    // Close modal on Escape keypress and lock body scroll
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                        onClick={onClose}
                    />

                    {/* Modal Dialog Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{
                            duration: 0.2,
                            ease: [0.16, 1, 0.3, 1],
                        }}
                        className={cn(
                            'relative z-10 w-full rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] flex flex-col',
                            maxWidthClasses[maxWidth],
                            className,
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(title || description || icon) && (
                            <div className="flex items-start justify-between pb-4 mb-4 border-b border-border/60">
                                <div className="flex items-start gap-3">
                                    {icon && (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs">
                                            {icon}
                                        </div>
                                    )}
                                    <div className="space-y-0.5">
                                        {title && (
                                            <h2 className="text-xl font-bold tracking-tight text-foreground">
                                                {title}
                                            </h2>
                                        )}
                                        {description && (
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0 ml-2"
                                    aria-label="Tutup modal"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        <div className="overflow-y-auto flex-1 pr-1">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
