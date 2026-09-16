import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface OptionItem {
    value: string | number;
    label: string;
    icon?: React.ReactNode;
    color?: string;
    description?: string;
}

export interface SearchableSelectProps {
    options: OptionItem[];
    value: string | number | null | undefined;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    triggerClassName?: string;
    disabled?: boolean;
    clearable?: boolean;
    size?: 'sm' | 'default';
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Pilih opsi...',
    searchPlaceholder = 'Cari...',
    emptyMessage = 'Tidak ada hasil ditemukan',
    className,
    triggerClassName,
    disabled = false,
    clearable = false,
    size = 'default',
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(
        (opt) => String(opt.value) === String(value),
    );

    const filteredOptions = options.filter(
        (opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (opt.description &&
                opt.description.toLowerCase().includes(searchQuery.toLowerCase())),
    );

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => searchInputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        } else {
            setSearchQuery('');
        }
    }, [isOpen]);

    const handleSelect = (optionValue: string | number) => {
        onChange(String(optionValue));
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-2xs transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
                    size === 'sm' ? 'h-8 py-1 text-xs' : 'h-9',
                    triggerClassName,
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon}
                    {selectedOption?.color && (
                        <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: selectedOption.color }}
                        />
                    )}
                    <span className={cn('truncate font-medium', !selectedOption && 'text-muted-foreground')}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                    {clearable && selectedOption && (
                        <span
                            role="button"
                            onClick={handleClear}
                            className="rounded-full p-0.5 hover:bg-muted hover:text-foreground transition cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </span>
                    )}
                    <ChevronDown
                        className={cn('h-4 w-4 transition-transform duration-200 opacity-60', isOpen && 'rotate-180')}
                    />
                </div>
            </button>

            {/* Dropdown Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 4 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 top-full z-50 mt-1 min-w-[200px] w-full rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-xl outline-none"
                    >
                        {/* Search Bar */}
                        <div className="relative mb-1.5 border-b border-border/60 pb-1.5 px-1 pt-1">
                            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full rounded-md bg-muted/50 py-1 pr-2 pl-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                            />
                        </div>

                        {/* Options List */}
                        <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
                            {filteredOptions.length === 0 ? (
                                <div className="p-3 text-center text-xs text-muted-foreground">
                                    {emptyMessage}
                                </div>
                            ) : (
                                filteredOptions.map((opt) => {
                                    const isSelected = String(opt.value) === String(value);

                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => handleSelect(opt.value)}
                                            className={cn(
                                                'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer select-none',
                                                isSelected
                                                    ? 'bg-primary/10 font-semibold text-primary'
                                                    : 'hover:bg-muted text-foreground',
                                            )}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                {opt.icon}
                                                {opt.color && (
                                                    <span
                                                        className="h-2.5 w-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: opt.color }}
                                                    />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="truncate">{opt.label}</span>
                                                    {opt.description && (
                                                        <span className="text-[10px] text-muted-foreground font-normal">
                                                            {opt.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
