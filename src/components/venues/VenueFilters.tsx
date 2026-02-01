'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { US_STATES, TABLE_TYPES, AMENITIES } from '@/lib/validations/venue';
import { useCallback, useState, useTransition } from 'react';

interface VenueFiltersProps {
    initialQuery?: string;
    initialState?: string;
    initialTableTypes?: string[];
    initialAmenities?: string[];
}

export function VenueFilters({
    initialQuery = '',
    initialState = '',
    initialTableTypes = [],
    initialAmenities = [],
}: VenueFiltersProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [query, setQuery] = useState(initialQuery);
    const [state, setState] = useState(initialState);
    const [tableTypes, setTableTypes] = useState<string[]>(initialTableTypes);
    const [amenities, setAmenities] = useState<string[]>(initialAmenities);

    const updateFilters = useCallback(() => {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (state) params.set('state', state);
        if (tableTypes.length > 0) params.set('tableTypes', tableTypes.join(','));
        if (amenities.length > 0) params.set('amenities', amenities.join(','));
        params.set('page', '1'); // Reset to first page on filter change

        startTransition(() => {
            router.push(`/venues?${params.toString()}`);
        });
    }, [query, state, tableTypes, amenities, router]);

    const clearFilters = useCallback(() => {
        setQuery('');
        setState('');
        setTableTypes([]);
        setAmenities([]);
        startTransition(() => {
            router.push('/venues');
        });
    }, [router]);

    const toggleTableType = (type: string) => {
        setTableTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const toggleAmenity = (amenity: string) => {
        setAmenities((prev) =>
            prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity]
        );
    };

    const hasActiveFilters =
        query || state || tableTypes.length > 0 || amenities.length > 0;

    return (
        <div className="space-y-4">
            {/* Search and State */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search venues by name or city..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && updateFilters()}
                        className="pl-9"
                    />
                </div>
                <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="All States" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {US_STATES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button onClick={updateFilters} disabled={isPending}>
                    {isPending ? 'Searching...' : 'Search'}
                </Button>
            </div>

            {/* Table Types */}
            <div>
                <p className="text-sm font-medium mb-2">Table Types</p>
                <div className="flex flex-wrap gap-2">
                    {TABLE_TYPES.map((type) => (
                        <Badge
                            key={type}
                            variant={tableTypes.includes(type) ? 'default' : 'outline'}
                            className="cursor-pointer hover:bg-primary/80"
                            onClick={() => toggleTableType(type)}
                        >
                            {type}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Amenities */}
            <div>
                <p className="text-sm font-medium mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((amenity) => (
                        <Badge
                            key={amenity}
                            variant={amenities.includes(amenity) ? 'default' : 'outline'}
                            className="cursor-pointer hover:bg-primary/80"
                            onClick={() => toggleAmenity(amenity)}
                        >
                            {amenity}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Active Filters / Clear */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Clear all
                    </Button>
                </div>
            )}
        </div>
    );
}
