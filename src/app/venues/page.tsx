import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VenueGrid } from '@/components/venues/VenueGrid';
import { VenueFilters } from '@/components/venues/VenueFilters';
import { Pagination } from '@/components/venues/Pagination';
import { VenueMapToggle } from '@/components/venues/VenueMapToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { getVenues } from '@/lib/actions/venues';

export const metadata: Metadata = {
    title: 'Find Pool Halls & Venues',
    description:
        'Browse our directory of pool halls, billiards rooms, and snooker venues. Filter by location, table types, and amenities.',
};

interface VenuesPageProps {
    searchParams: Promise<{
        query?: string;
        state?: string;
        tableTypes?: string;
        amenities?: string;
        page?: string;
        view?: 'grid' | 'map';
    }>;
}

async function VenuesList({
    searchParams,
}: {
    searchParams: VenuesPageProps['searchParams'];
}) {
    const params = await searchParams;
    const showMap = params.view === 'map';

    const result = await getVenues({
        query: params.query,
        state: params.state,
        tableTypes: params.tableTypes?.split(',').filter(Boolean),
        amenities: params.amenities?.split(',').filter(Boolean),
        page: params.page ? parseInt(params.page, 10) : 1,
        limit: showMap ? 100 : 12, // Load more for map view
    });

    // Transform venues for map component
    const mapVenues = result.data.map(venue => ({
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        latitude: venue.latitude || 0,
        longitude: venue.longitude || 0,
        address: venue.address,
        city: venue.city,
        state: venue.state,
        rating: venue.rating ?? undefined,
        num_tables: venue.num_tables,
    }));

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-muted-foreground">
                    Found {result.total} venue{result.total !== 1 ? 's' : ''}
                </div>
                <VenueMapToggle currentView={showMap ? 'map' : 'grid'} />
            </div>

            {showMap ? (
                <VenueMapToggle.MapView venues={mapVenues} />
            ) : (
                <>
                    <VenueGrid venues={result.data} />
                    <div className="mt-8">
                        <Pagination
                            currentPage={result.page}
                            totalPages={result.totalPages}
                        />
                    </div>
                </>
            )}
        </>
    );
}

function VenuesListSkeleton() {
    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-40" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-9 w-full" />
                    </div>
                ))}
            </div>
        </>
    );
}

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
    const params = await searchParams;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                    Find Pool Halls Near You
                </h1>
                <p className="text-muted-foreground">
                    Discover billiards venues, snooker rooms, and pool halls in your area.
                </p>
            </div>

            {/* Filters */}
            <div className="mb-8 p-5 bg-card rounded-xl border border-border">
                <VenueFilters
                    initialQuery={params.query}
                    initialState={params.state}
                    initialTableTypes={params.tableTypes?.split(',').filter(Boolean)}
                    initialAmenities={params.amenities?.split(',').filter(Boolean)}
                />
            </div>

            {/* Venue Grid or Map */}
            <Suspense fallback={<VenuesListSkeleton />}>
                <VenuesList searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
