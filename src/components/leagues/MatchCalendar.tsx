'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Users
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';

interface Match {
    id: string;
    date: Date;
    time: string;
    opponent: string;
    venue: string;
    league: string;
    type: 'home' | 'away';
}

interface MatchCalendarProps {
    matches: Match[];
    onDateSelect?: (date: Date) => void;
    onMatchClick?: (match: Match) => void;
}

export function MatchCalendar({ matches, onDateSelect, onMatchClick }: MatchCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad the beginning with empty slots for proper alignment
    const startDay = monthStart.getDay();
    const paddedDays = [...Array(startDay).fill(null), ...days];

    const getMatchesForDate = (date: Date) => {
        return matches.filter(match => isSameDay(match.date, date));
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        onDateSelect?.(date);
    };

    const selectedMatches = selectedDate ? getMatchesForDate(selectedDate) : [];

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Match Schedule
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="font-medium min-w-[140px] text-center">
                                {format(currentMonth, 'MMMM yyyy')}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {paddedDays.map((day, index) => {
                            if (!day) {
                                return <div key={`empty-${index}`} className="aspect-square" />;
                            }

                            const dayMatches = getMatchesForDate(day);
                            const hasMatches = dayMatches.length > 0;
                            const isSelected = selectedDate && isSameDay(day, selectedDate);

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        aspect-square p-1 rounded-lg text-sm relative transition-all
                                        ${!isSameMonth(day, currentMonth) ? 'text-muted-foreground/50' : ''}
                                        ${isToday(day) ? 'bg-primary/10 font-bold' : ''}
                                        ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                                        ${hasMatches ? 'ring-2 ring-primary/50' : ''}
                                    `}
                                >
                                    <span>{format(day, 'd')}</span>
                                    {hasMatches && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                            {dayMatches.slice(0, 3).map((match, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full ${match.type === 'home' ? 'bg-green-500' : 'bg-blue-500'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Home
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            Away
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selected date matches */}
            {selectedDate && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedMatches.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                No matches scheduled for this day
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {selectedMatches.map(match => (
                                    <div
                                        key={match.id}
                                        onClick={() => onMatchClick?.(match)}
                                        className="p-4 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant={match.type === 'home' ? 'default' : 'secondary'}>
                                                    {match.type === 'home' ? 'Home' : 'Away'}
                                                </Badge>
                                                <span className="font-medium">vs {match.opponent}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {match.time}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {match.venue}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {match.league}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Demo matches for preview
export const demoMatches: Match[] = [
    { id: '1', date: new Date(2026, 1, 5), time: '7:00 PM', opponent: 'Cue Masters', venue: 'Championship Billiards', league: 'Austin 8-Ball', type: 'home' },
    { id: '2', date: new Date(2026, 1, 8), time: '8:00 PM', opponent: 'Break Kings', venue: 'The Rack Room', league: 'Austin 8-Ball', type: 'away' },
    { id: '3', date: new Date(2026, 1, 12), time: '7:30 PM', opponent: 'Scratch City', venue: 'Championship Billiards', league: 'Austin 8-Ball', type: 'home' },
    { id: '4', date: new Date(2026, 1, 15), time: '6:30 PM', opponent: 'Rail Runners', venue: 'Corner Pocket Bar', league: 'Austin 8-Ball', type: 'away' },
    { id: '5', date: new Date(2026, 1, 19), time: '7:00 PM', opponent: 'Chalk Dust', venue: 'Championship Billiards', league: 'Austin 8-Ball', type: 'home' },
    { id: '6', date: new Date(2026, 1, 22), time: '8:00 PM', opponent: 'The 8-Ballers', venue: 'Downtown Billiards', league: 'Austin 8-Ball', type: 'away' },
    { id: '7', date: new Date(2026, 1, 26), time: '7:00 PM', opponent: 'Corner Pocket', venue: 'Championship Billiards', league: 'Austin 8-Ball', type: 'home' },
];
