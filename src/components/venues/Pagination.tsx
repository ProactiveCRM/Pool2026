'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    baseUrl = '/venues',
}: PaginationProps) {
    const searchParams = useSearchParams();

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    if (totalPages <= 1) {
        return null;
    }

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const showEllipsisThreshold = 7;

        if (totalPages <= showEllipsisThreshold) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first, last, and pages around current
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis');
            }

            for (
                let i = Math.max(2, currentPage - 1);
                i <= Math.min(totalPages - 1, currentPage + 1);
                i++
            ) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
            <Button
                variant="outline"
                size="icon"
                asChild
                disabled={currentPage <= 1}
            >
                <Link
                    href={createPageUrl(currentPage - 1)}
                    aria-label="Previous page"
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Link>
            </Button>

            {getPageNumbers().map((page, index) =>
                page === 'ellipsis' ? (
                    <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-muted-foreground"
                    >
                        ...
                    </span>
                ) : (
                    <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="icon"
                        asChild
                    >
                        <Link href={createPageUrl(page)}>{page}</Link>
                    </Button>
                )
            )}

            <Button
                variant="outline"
                size="icon"
                asChild
                disabled={currentPage >= totalPages}
            >
                <Link
                    href={createPageUrl(currentPage + 1)}
                    aria-label="Next page"
                    className={
                        currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''
                    }
                >
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </Button>
        </nav>
    );
}
