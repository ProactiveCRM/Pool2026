import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, Table2 } from 'lucide-react';
import { ReservationForm } from '@/components/reservations/ReservationForm';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: venue } = await supabase
        .from('venues')
        .select('name, city, state')
        .eq('slug', slug)
        .single();

    if (!venue) {
        return { title: 'Venue Not Found' };
    }

    return {
        title: `Book a Table at ${venue.name}`,
        description: `Reserve a pool table at ${venue.name} in ${venue.city}, ${venue.state}. Book online and skip the wait!`,
    };
}

export default async function BookingPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth?next=/venues/${slug}/book`);
    }

    // Get venue details
    const { data: venue, error } = await supabase
        .from('venues')
        .select(`
      id,
      name,
      slug,
      address,
      city,
      state,
      zip,
      num_tables,
      description
    `)
        .eq('slug', slug)
        .single();

    if (error || !venue) {
        notFound();
    }

    // Get table count
    const { count: tableCount } = await supabase
        .from('tables')
        .select('*', { count: 'exact', head: true })
        .eq('venue_id', venue.id)
        .eq('is_active', true);

    const totalTables = tableCount || venue.num_tables || 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back Link */}
                <Link
                    href={`/venues/${slug}`}
                    className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to venue
                </Link>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Venue Info Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs">🎱 Reserve a Table</Badge>
                                </div>
                                <CardTitle className="text-xl">{venue.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {venue.city}, {venue.state}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Table2 className="h-4 w-4 text-primary" />
                                    <span>{totalTables} {totalTables === 1 ? 'table' : 'tables'} available</span>
                                </div>

                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>✓ Instant confirmation</p>
                                    <p>✓ Free cancellation up to 2 hours before</p>
                                    <p>✓ No payment required to reserve</p>
                                </div>

                                {venue.description && (
                                    <p className="text-sm text-muted-foreground border-t pt-4">
                                        {venue.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-primary" />
                                    Select Date & Time
                                </CardTitle>
                                <CardDescription>
                                    Choose when you&apos;d like to play
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ReservationForm venue={venue} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
