'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';

const TABLE_TYPES = [
    { value: 'pool', label: '🎱 Pool Tables' },
    { value: 'snooker', label: '🟢 Snooker Tables' },
    { value: 'carom', label: '⚪ Carom/Billiards' },
];

const AMENITIES = [
    { value: 'food', label: '🍔 Food' },
    { value: 'bar', label: '🍺 Full Bar' },
    { value: 'parking', label: '🅿️ Parking' },
    { value: 'wifi', label: '📶 WiFi' },
    { value: 'tournaments', label: '🏆 Tournaments' },
    { value: 'lessons', label: '📚 Lessons' },
    { value: 'pro_shop', label: '🛒 Pro Shop' },
    { value: 'private_room', label: '🚪 Private Room' },
];

const PRICE_RANGES = [
    { value: 'free', label: 'Free' },
    { value: 'budget', label: '$ Budget' },
    { value: 'moderate', label: '$$ Moderate' },
    { value: 'premium', label: '$$$ Premium' },
];

interface VenueSearchFiltersProps {
    onApply?: () => void;
}

export function VenueSearchFilters({ onApply }: VenueSearchFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isOpen, setIsOpen] = useState(false);

    // Filter state
    const [selectedTableTypes, setSelectedTableTypes] = useState<string[]>(
        searchParams.get('tables')?.split(',').filter(Boolean) || []
    );
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        searchParams.get('amenities')?.split(',').filter(Boolean) || []
    );
    const [priceRange, setPriceRange] = useState<string>(
        searchParams.get('price') || ''
    );
    const [minRating, setMinRating] = useState<number>(
        Number(searchParams.get('rating')) || 0
    );
    const [claimedOnly, setClaimedOnly] = useState(
        searchParams.get('claimed') === 'true'
    );

    const toggleTableType = (value: string) => {
        setSelectedTableTypes(prev =>
            prev.includes(value)
                ? prev.filter(t => t !== value)
                : [...prev, value]
        );
    };

    const toggleAmenity = (value: string) => {
        setSelectedAmenities(prev =>
            prev.includes(value)
                ? prev.filter(a => a !== value)
                : [...prev, value]
        );
    };

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        // Update params
        if (selectedTableTypes.length > 0) {
            params.set('tables', selectedTableTypes.join(','));
        } else {
            params.delete('tables');
        }

        if (selectedAmenities.length > 0) {
            params.set('amenities', selectedAmenities.join(','));
        } else {
            params.delete('amenities');
        }

        if (priceRange) {
            params.set('price', priceRange);
        } else {
            params.delete('price');
        }

        if (minRating > 0) {
            params.set('rating', minRating.toString());
        } else {
            params.delete('rating');
        }

        if (claimedOnly) {
            params.set('claimed', 'true');
        } else {
            params.delete('claimed');
        }

        router.push(`/venues?${params.toString()}`);
        setIsOpen(false);
        onApply?.();
    };

    const clearFilters = () => {
        setSelectedTableTypes([]);
        setSelectedAmenities([]);
        setPriceRange('');
        setMinRating(0);
        setClaimedOnly(false);

        const params = new URLSearchParams(searchParams.toString());
        params.delete('tables');
        params.delete('amenities');
        params.delete('price');
        params.delete('rating');
        params.delete('claimed');

        router.push(`/venues?${params.toString()}`);
    };

    const activeFilterCount = [
        selectedTableTypes.length > 0,
        selectedAmenities.length > 0,
        priceRange !== '',
        minRating > 0,
        claimedOnly,
    ].filter(Boolean).length;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Filter Venues</SheetTitle>
                    <SheetDescription>
                        Narrow down your search to find the perfect spot
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                    {/* Table Types */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Table Types</Label>
                        <div className="grid grid-cols-1 gap-2">
                            {TABLE_TYPES.map(type => (
                                <div key={type.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`table-${type.value}`}
                                        checked={selectedTableTypes.includes(type.value)}
                                        onCheckedChange={() => toggleTableType(type.value)}
                                    />
                                    <Label htmlFor={`table-${type.value}`} className="font-normal">
                                        {type.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Amenities</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {AMENITIES.map(amenity => (
                                <div key={amenity.value} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`amenity-${amenity.value}`}
                                        checked={selectedAmenities.includes(amenity.value)}
                                        onCheckedChange={() => toggleAmenity(amenity.value)}
                                    />
                                    <Label htmlFor={`amenity-${amenity.value}`} className="font-normal text-sm">
                                        {amenity.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                        <Label className="text-base font-medium">Price Range</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {PRICE_RANGES.map(range => (
                                <Button
                                    key={range.value}
                                    variant={priceRange === range.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setPriceRange(priceRange === range.value ? '' : range.value)}
                                    className="justify-start"
                                >
                                    {range.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Minimum Rating */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Minimum Rating</Label>
                            <span className="text-sm text-muted-foreground">
                                {minRating > 0 ? `${minRating}+ stars` : 'Any'}
                            </span>
                        </div>
                        <Slider
                            value={[minRating]}
                            onValueChange={([val]: number[]) => setMinRating(val)}
                            max={5}
                            step={0.5}
                            className="py-2"
                        />
                    </div>

                    {/* Claimed Only */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="claimed-only"
                            checked={claimedOnly}
                            onCheckedChange={(checked: boolean) => setClaimedOnly(checked)}
                        />
                        <Label htmlFor="claimed-only" className="font-normal">
                            ✅ Verified venues only
                        </Label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={clearFilters} className="flex-1">
                        <X className="mr-2 h-4 w-4" />
                        Clear All
                    </Button>
                    <Button onClick={applyFilters} className="flex-1">
                        Apply Filters
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
