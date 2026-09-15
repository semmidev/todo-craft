import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PaginationMeta {
    current_page?: number;
    from?: number | null;
    to?: number | null;
    total?: number;
    last_page?: number;
    per_page?: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface DataTablePaginationProps {
    data?: {
        current_page?: number;
        from?: number | null;
        to?: number | null;
        total?: number;
        last_page?: number;
        per_page?: number;
        links?: PaginationLink[];
        meta?: PaginationMeta;
    };
    meta?: PaginationMeta;
    links?: PaginationLink[];
    current_page?: number;
    from?: number | null;
    to?: number | null;
    total?: number;
    last_page?: number;
    per_page?: number;
    perPageOptions?: number[];
    onPerPageChange?: (perPage: number) => void;
}

export function DataTablePagination({
    data,
    meta,
    links: linksProp,
    current_page: directCurrentPage,
    from: directFrom,
    to: directTo,
    total: directTotal,
    last_page: directLastPage,
    per_page: directPerPage,
    perPageOptions = [10, 15, 25, 50, 100],
    onPerPageChange,
}: DataTablePaginationProps) {
    const effectiveMeta = meta ?? data?.meta ?? data;
    const links = linksProp ?? data?.links ?? [];

    const currentPage = effectiveMeta?.current_page ?? directCurrentPage ?? 1;
    const from = effectiveMeta?.from ?? directFrom ?? 0;
    const to = effectiveMeta?.to ?? directTo ?? 0;
    const total = effectiveMeta?.total ?? directTotal ?? 0;
    const lastPage = effectiveMeta?.last_page ?? directLastPage ?? 1;
    const perPage = effectiveMeta?.per_page ?? directPerPage ?? 15;

    if (total === 0) return null;

    const prevLink = links.find((l) => l.label.includes('Previous') || l.label.includes('&laquo;'));
    const nextLink = links.find((l) => l.label.includes('Next') || l.label.includes('&raquo;'));
    const firstLink = links[1]?.url ? links[1].url : null;
    const lastLink = links[links.length - 2]?.url ? links[links.length - 2].url : null;

    return (
        <div className="flex flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row">
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <div>
                    Menampilkan{' '}
                    <span className="font-semibold text-foreground">
                        {from ?? 0}
                    </span>{' '}
                    sampai{' '}
                    <span className="font-semibold text-foreground">
                        {to ?? 0}
                    </span>{' '}
                    dari{' '}
                    <span className="font-semibold text-foreground">
                        {total}
                    </span>{' '}
                    data
                </div>

                {onPerPageChange && (
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium">Baris per halaman:</span>
                        <select
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="bg-background border-input focus:ring-ring rounded-md border px-2 py-1 text-xs font-medium focus:ring-2 focus:outline-hidden cursor-pointer"
                        >
                            {perPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
                {/* First Page */}
                {firstLink && currentPage > 1 ? (
                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" asChild>
                        <Link href={firstLink} preserveState preserveScroll>
                            <ChevronsLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="icon" className="h-8 w-8 opacity-50" disabled>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                )}

                {/* Previous Page */}
                {prevLink?.url ? (
                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" asChild>
                        <Link href={prevLink.url} preserveState preserveScroll>
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="icon" className="h-8 w-8 opacity-50" disabled>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}

                {/* Page Number Indicator */}
                <div className="flex items-center justify-center text-sm font-medium px-2">
                    Halaman {currentPage} dari {lastPage}
                </div>

                {/* Next Page */}
                {nextLink?.url ? (
                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" asChild>
                        <Link href={nextLink.url} preserveState preserveScroll>
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="icon" className="h-8 w-8 opacity-50" disabled>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                )}

                {/* Last Page */}
                {lastLink && currentPage < lastPage ? (
                    <Button variant="outline" size="icon" className="h-8 w-8 cursor-pointer" asChild>
                        <Link href={lastLink} preserveState preserveScroll>
                            <ChevronsRight className="h-4 w-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button variant="outline" size="icon" className="h-8 w-8 opacity-50" disabled>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
