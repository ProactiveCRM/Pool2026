'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NearMeButtonProps {
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
}

export function NearMeButton({ className, variant = 'outline' }: NearMeButtonProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);

    const handleNearMe = useCallback(() => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Build URL with coordinates
                const params = new URLSearchParams(searchParams.toString());
                params.set('lat', latitude.toFixed(6));
                params.set('lng', longitude.toFixed(6));
                params.set('radius', '25'); // 25 mile default radius

                router.push(`/venues?${params.toString()}`);
                toast.success('Showing venues near you');
                setIsLoading(false);
            },
            (error) => {
                setIsLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error('Location permission denied. Please enable location access.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error('Location information is unavailable.');
                        break;
                    case error.TIMEOUT:
                        toast.error('Location request timed out.');
                        break;
                    default:
                        toast.error('An error occurred getting your location.');
                }
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000, // 5 minutes
            }
        );
    }, [router, searchParams]);

    return (
        <Button
            variant={variant}
            onClick={handleNearMe}
            disabled={isLoading}
            className={className}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding...
                </>
            ) : (
                <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Near Me
                </>
            )}
        </Button>
    );
}
