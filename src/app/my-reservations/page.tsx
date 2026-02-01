import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getUserReservations, cancelReservation } from '@/lib/actions/reservations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Table2, Plus } from 'lucide-react';
import { RESERVATION_STATUS } from '@/types/reservations';

export const metadata: Metadata = {
    title: 'My Reservations',
    description: 'View and manage your pool table reservations',
};

export default async function MyReservationsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?next=/my-reservations');
    }

    const reservations = await getUserReservations();

    // Split into upcoming and past
    const now = new Date();
    const upcoming = reservations.filter(r =>
        new Date(r.start_time) > now && r.status !== 'cancelled'
    );
    const past = reservations.filter(r =>
        new Date(r.start_time) <= now || r.status === 'cancelled'
    );

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">My Reservations 🎱</h1>
                        <p className="text-muted-foreground">Manage your pool table bookings</p>
                    </div>
                    <Button asChild>
                        <Link href="/venues">
                            <Plus className="mr-2 h-4 w-4" />
                            Book a Table
                        </Link>
                    </Button>
                </div>

                {/* Upcoming Reservations */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Upcoming ({upcoming.length})
                    </h2>

                    {upcoming.length === 0 ? (
                        <Card className="bg-card/50">
                            <CardContent className="py-12 text-center">
                                <div className="text-4xl mb-4">🎱</div>
                                <h3 className="text-lg font-medium mb-2">No upcoming reservations</h3>
                                <p className="text-muted-foreground mb-4">
                                    Ready to play? Find a venue and book a table.
                                </p>
                                <Button asChild>
                                    <Link href="/venues">Browse Venues</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {upcoming.map((reservation) => (
                                <Card key={reservation.id} className="overflow-hidden">
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Date Badge */}
                                        <div className="bg-primary/10 p-4 sm:p-6 flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 sm:min-w-[100px]">
                                            <span className="text-sm text-primary font-medium">
                                                {formatDate(reservation.start_time).split(',')[0]}
                                            </span>
                                            <span className="text-2xl sm:text-3xl font-bold text-primary">
                                                {new Date(reservation.start_time).getDate()}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(reservation.start_time).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <CardContent className="flex-1 p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {reservation.venue?.name || 'Unknown Venue'}
                                                        </h3>
                                                        <Badge className={RESERVATION_STATUS[reservation.status].color}>
                                                            {RESERVATION_STATUS[reservation.status].label}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-4 w-4" />
                                                            {reservation.party_size} {reservation.party_size === 1 ? 'player' : 'players'}
                                                        </span>
                                                        {reservation.table && (
                                                            <span className="flex items-center gap-1">
                                                                <Table2 className="h-4 w-4" />
                                                                {reservation.table.name}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {reservation.venue && (
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {reservation.venue.city}, {reservation.venue.state}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/venues/${reservation.venue?.slug}`}>
                                                            View Venue
                                                        </Link>
                                                    </Button>
                                                    <form action={async () => {
                                                        'use server';
                                                        await cancelReservation(reservation.id);
                                                    }}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            type="submit"
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </form>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>

                {/* Past Reservations */}
                {past.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
                            Past Reservations ({past.length})
                        </h2>

                        <div className="space-y-3">
                            {past.slice(0, 10).map((reservation) => (
                                <Card key={reservation.id} className="bg-card/30">
                                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-4">
                                            <div className="text-center min-w-[60px]">
                                                <span className="text-xs text-muted-foreground block">
                                                    {new Date(reservation.start_time).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-lg font-medium">
                                                    {new Date(reservation.start_time).getDate()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{reservation.venue?.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatTime(reservation.start_time)} • {reservation.duration_minutes} min
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={RESERVATION_STATUS[reservation.status].color}>
                                            {RESERVATION_STATUS[reservation.status].label}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
