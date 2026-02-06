'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { NearMeButton } from '@/components/venues/NearMeButton';

function NearMeButtonFallback() {
    return (
        <Button variant="outline" disabled className="text-base w-full sm:w-auto h-11">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
        </Button>
    );
}

export function HeroButtons() {
    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <Button size="lg" asChild className="text-base w-full sm:w-auto">
                <Link href="/venues">
                    <Search className="mr-2 h-5 w-5" />
                    Browse All Venues
                </Link>
            </Button>
            <Suspense fallback={<NearMeButtonFallback />}>
                <NearMeButton
                    variant="outline"
                    className="text-base w-full sm:w-auto h-11"
                />
            </Suspense>
        </div>
    );
}

export function HeroBadge() {
    return (
        <Badge variant="secondary" className="mb-4 sm:mb-6 text-sm sm:text-base px-3 py-1">
            🎱 The #1 Pool Hall Directory for Players
        </Badge>
    );
}

