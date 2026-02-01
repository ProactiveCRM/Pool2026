import { VenueCard } from './VenueCard';
import type { Venue } from '@/lib/types';

interface VenueGridProps {
    venues: Venue[];
}

export function VenueGrid({ venues }: VenueGridProps) {
    if (venues.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                    No venues found matching your criteria.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                    Try adjusting your filters or search terms.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
            ))}
        </div>
    );
}
