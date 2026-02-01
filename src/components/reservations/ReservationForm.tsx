'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { checkAvailability, createReservation } from '@/lib/actions/reservations';
import {
    type TimeSlot,
    type TableType,
    TABLE_TYPE_LABELS,
    DURATION_OPTIONS
} from '@/types/reservations';

interface ReservationFormProps {
    venue: {
        id: string;
        name: string;
        slug: string;
    };
}

export function ReservationForm({ venue }: ReservationFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [slots, setSlots] = useState<TimeSlot[]>([]);

    // Form state
    const [date, setDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [duration, setDuration] = useState(60);
    const [partySize, setPartySize] = useState(2);
    const [tableType, setTableType] = useState<TableType | ''>('');
    const [specialRequests, setSpecialRequests] = useState('');

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Check availability when date changes
    useEffect(() => {
        if (date) {
            setIsCheckingAvailability(true);
            setSelectedTime('');
            checkAvailability(venue.id, date)
                .then(setSlots)
                .finally(() => setIsCheckingAvailability(false));
        }
    }, [date, venue.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !selectedTime) {
            toast.error('Please select a date and time');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createReservation({
                venue_id: venue.id,
                date,
                start_time: selectedTime,
                duration,
                party_size: partySize,
                preferred_table_type: tableType || undefined,
                any_table_ok: !tableType,
                special_requests: specialRequests || undefined,
            });

            if (result.success) {
                toast.success('🎱 Reservation confirmed!', {
                    description: `See you at ${venue.name}!`,
                });
                router.push('/my-reservations');
            } else {
                toast.error(result.error || 'Failed to create reservation');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Format time for display
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Select Date
                </Label>
                <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={today}
                    className="w-full"
                    required
                />
            </div>

            {/* Time Slots */}
            {date && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Select Time
                    </Label>

                    {isCheckingAvailability ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Checking availability...</span>
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No availability on this date.</p>
                            <p className="text-sm">The venue may be closed or fully booked.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {slots.map((slot) => (
                                <Button
                                    key={slot.time}
                                    type="button"
                                    variant={selectedTime === slot.time ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!slot.available}
                                    onClick={() => setSelectedTime(slot.time)}
                                    className={`relative ${!slot.available ? 'opacity-50' : ''}`}
                                >
                                    {formatTime(slot.time)}
                                    {slot.available && slot.tables_available <= 2 && (
                                        <Badge
                                            variant="secondary"
                                            className="absolute -top-2 -right-2 text-[10px] px-1"
                                        >
                                            {slot.tables_available} left
                                        </Badge>
                                    )}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Duration */}
            {selectedTime && (
                <div className="space-y-2">
                    <Label>Duration</Label>
                    <div className="flex flex-wrap gap-2">
                        {DURATION_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                type="button"
                                variant={duration === option.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setDuration(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Party Size */}
            {selectedTime && (
                <div className="space-y-2">
                    <Label htmlFor="partySize" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Party Size
                    </Label>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setPartySize(Math.max(1, partySize - 1))}
                        >
                            -
                        </Button>
                        <span className="text-xl font-medium w-8 text-center">{partySize}</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setPartySize(Math.min(10, partySize + 1))}
                        >
                            +
                        </Button>
                        <span className="text-muted-foreground text-sm ml-2">
                            {partySize === 1 ? 'player' : 'players'}
                        </span>
                    </div>
                </div>
            )}

            {/* Table Type Preference */}
            {selectedTime && (
                <div className="space-y-2">
                    <Label>Table Preference (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant={tableType === '' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTableType('')}
                        >
                            Any Table
                        </Button>
                        {(Object.keys(TABLE_TYPE_LABELS) as TableType[]).slice(0, 3).map((type) => (
                            <Button
                                key={type}
                                type="button"
                                variant={tableType === type ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setTableType(type)}
                            >
                                {TABLE_TYPE_LABELS[type]}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Special Requests */}
            {selectedTime && (
                <div className="space-y-2">
                    <Label htmlFor="requests">Special Requests (Optional)</Label>
                    <Textarea
                        id="requests"
                        placeholder="Any special requests? (e.g., tournament practice, coaching session, birthday celebration)"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={3}
                    />
                </div>
            )}

            {/* Summary & Submit */}
            {selectedTime && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Reservation Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Venue</span>
                            <span className="font-medium">{venue.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date</span>
                            <span className="font-medium">
                                {new Date(date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Time</span>
                            <span className="font-medium">{formatTime(selectedTime)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-medium">
                                {DURATION_OPTIONS.find(o => o.value === duration)?.label}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Players</span>
                            <span className="font-medium">{partySize}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Submit Button */}
            {selectedTime && (
                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Confirming...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Confirm Reservation
                        </>
                    )}
                </Button>
            )}
        </form>
    );
}
