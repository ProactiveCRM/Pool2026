'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Map } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import VenueMap to avoid SSR issues with Google Maps
const VenueMap = dynamic(
    () => import('@/components/maps/VenueMap').then(mod => mod.VenueMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-[500px] bg-muted rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-muted-foreground">Loading map...</span>
            </div>
        ),
    }
);

interface VenueMapToggleProps {
    currentView: 'grid' | 'map';
}

export function VenueMapToggle({ currentView }: VenueMapToggleProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const toggleView = (view: 'grid' | 'map') => {
        const params = new URLSearchParams(searchParams.toString());
        if (view === 'grid') {
            params.delete('view');
        } else {
            params.set('view', 'map');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
                variant={currentView === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => toggleView('grid')}
                className="gap-2"
            >
                <LayoutGrid className="h-4 w-4" />
                Grid
            </Button>
            <Button
                variant={currentView === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => toggleView('map')}
                className="gap-2"
            >
                <Map className="h-4 w-4" />
                Map
            </Button>
        </div>
    );
}

// Static component for map view
interface MapViewProps {
    venues: Array<{
        id: string;
        name: string;
        slug: string;
        latitude: number;
        longitude: number;
        address?: string;
        city?: string;
        state?: string;
        rating?: number;
        num_tables?: number;
    }>;
}

function MapView({ venues }: MapViewProps) {
    const validVenues = venues.filter(v => v.latitude && v.longitude);

    if (validVenues.length === 0) {
        return (
            <div className="h-[500px] bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                    <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No venues with location data found</p>
                </div>
            </div>
        );
    }

    return (
        <VenueMap
            venues={validVenues}
            height="500px"
            zoom={4}
            className="rounded-xl border border-border"
        />
    );
}

// Attach MapView to VenueMapToggle for convenient access
VenueMapToggle.MapView = MapView;
