'use client';

import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface VenueMarker {
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
}

interface VenueMapProps {
    venues: VenueMarker[];
    center?: { lat: number; lng: number };
    zoom?: number;
    height?: string;
    className?: string;
    onVenueClick?: (venue: VenueMarker) => void;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const defaultCenter = {
    lat: 39.8283, // Center of US
    lng: -98.5795,
};

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
        {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
        },
    ],
};

export function VenueMap({
    venues,
    center,
    zoom = 10,
    height = '400px',
    className = '',
    onVenueClick,
}: VenueMapProps) {
    const [selectedVenue, setSelectedVenue] = useState<VenueMarker | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    });

    // Calculate center from venues if not provided
    const mapCenter = useMemo(() => {
        if (center) return center;
        if (venues.length === 0) return defaultCenter;

        const validVenues = venues.filter(v => v.latitude && v.longitude);
        if (validVenues.length === 0) return defaultCenter;

        const avgLat = validVenues.reduce((sum, v) => sum + v.latitude, 0) / validVenues.length;
        const avgLng = validVenues.reduce((sum, v) => sum + v.longitude, 0) / validVenues.length;

        return { lat: avgLat, lng: avgLng };
    }, [center, venues]);

    const handleMarkerClick = useCallback((venue: VenueMarker) => {
        setSelectedVenue(venue);
        onVenueClick?.(venue);
    }, [onVenueClick]);

    const handleInfoWindowClose = useCallback(() => {
        setSelectedVenue(null);
    }, []);

    if (loadError) {
        return (
            <div className={`flex items-center justify-center bg-muted rounded-lg ${className}`} style={{ height }}>
                <p className="text-muted-foreground">Failed to load map</p>
            </div>
        );
    }

    if (!isLoaded) {
        return <Skeleton className={`rounded-lg ${className}`} style={{ height }} />;
    }

    return (
        <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={zoom}
                options={mapOptions}
            >
                {venues
                    .filter(v => v.latitude && v.longitude)
                    .map((venue) => (
                        <Marker
                            key={venue.id}
                            position={{ lat: venue.latitude, lng: venue.longitude }}
                            onClick={() => handleMarkerClick(venue)}
                            icon={{
                                url: '/marker-pool.svg',
                                scaledSize: new google.maps.Size(32, 32),
                            }}
                        />
                    ))}

                {selectedVenue && (
                    <InfoWindow
                        position={{ lat: selectedVenue.latitude, lng: selectedVenue.longitude }}
                        onCloseClick={handleInfoWindowClose}
                    >
                        <div className="p-2 min-w-[200px]">
                            <h3 className="font-semibold text-foreground mb-1">{selectedVenue.name}</h3>
                            {selectedVenue.address && (
                                <p className="text-sm text-muted-foreground mb-2">
                                    {selectedVenue.address}, {selectedVenue.city}, {selectedVenue.state}
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-sm mb-3">
                                {selectedVenue.rating && (
                                    <span className="flex items-center gap-1">
                                        ⭐ {selectedVenue.rating.toFixed(1)}
                                    </span>
                                )}
                                {selectedVenue.num_tables && (
                                    <span>{selectedVenue.num_tables} tables</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="default" asChild>
                                    <Link href={`/venues/${selectedVenue.slug}`}>
                                        View Details
                                    </Link>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.latitude},${selectedVenue.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Navigation className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}

// Simple static map for venue detail pages
interface StaticVenueMapProps {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
    height?: string;
    className?: string;
}

export function StaticVenueMap({
    latitude,
    longitude,
    name,
    address,
    height = '300px',
    className = '',
}: StaticVenueMapProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    });

    const center = { lat: latitude, lng: longitude };

    if (loadError) {
        return (
            <div className={`flex flex-col items-center justify-center bg-muted rounded-lg ${className}`} style={{ height }}>
                <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{address}</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Open in Maps <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                </Button>
            </div>
        );
    }

    if (!isLoaded) {
        return <Skeleton className={`rounded-lg ${className}`} style={{ height }} />;
    }

    return (
        <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={15}
                options={{ ...mapOptions, zoomControl: false, fullscreenControl: false }}
            >
                <Marker position={center} title={name} />
            </GoogleMap>
        </div>
    );
}
