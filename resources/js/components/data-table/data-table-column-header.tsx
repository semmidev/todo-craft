import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps {
    title: string;
    sortKey: string;
    currentSort?: string;
    onSort: (key: string) => void;
    className?: string;
}

export function DataTableColumnHeader({
    title,
    sortKey,
    currentSort,
    onSort,
    className,
}: DataTableColumnHeaderProps) {
    const isAscending = currentSort === sortKey;
    const isDescending = currentSort === `-${sortKey}`;

    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onSort(sortKey)}
                className="-ml-3 h-8 data-[state=open]:bg-accent font-semibold text-xs tracking-wider uppercase cursor-pointer"
            >
                <span>{title}</span>
                {isAscending ? (
                    <ArrowUp className="ml-2 h-3.5 w-3.5 text-primary" />
                ) : isDescending ? (
                    <ArrowDown className="ml-2 h-3.5 w-3.5 text-primary" />
                ) : (
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                )}
            </Button>
        </div>
    );
}
