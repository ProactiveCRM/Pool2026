import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getVenueById } from '@/lib/actions/venues';
import { ClaimForm } from '@/components/forms/ClaimForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, CheckCircle } from 'lucide-react';

interface ClaimPageProps {
    params: Promise<{ venueId: string }>;
}

export async function generateMetadata({ params }: ClaimPageProps): Promise<Metadata> {
    const { venueId } = await params;
    const venue = await getVenueById(venueId);

    if (!venue) {
        return { title: 'Venue Not Found' };
    }

    return {
        title: `Claim ${venue.name}`,
        description: `Submit a claim request to manage ${venue.name} on Pool Directory.`,
    };
}

export default async function ClaimPage({ params }: ClaimPageProps) {
    const { venueId } = await params;

    // Check if user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth?next=/claim/${venueId}`);
    }

    // Get venue details
    const venue = await getVenueById(venueId);

    if (!venue) {
        notFound();
    }

    // Check if venue is already claimed
    if (venue.is_claimed) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href={`/venues/${venue.slug}`}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to venue
                </Link>

                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardContent className="py-12 text-center">
                        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Already Claimed</h2>
                        <p className="text-muted-foreground">
                            This venue has already been claimed by its owner.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Check if user already has a pending claim
    const { data: existingClaim } = await supabase
        .from('claims')
        .select('id, status')
        .eq('venue_id', venueId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .single();

    if (existingClaim) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to dashboard
                </Link>

                <Card className="bg-card/50 backdrop-blur-sm border-secondary/20">
                    <CardContent className="py-12 text-center">
                        <Badge variant="secondary" className="mb-4">Pending Review</Badge>
                        <h2 className="text-2xl font-bold mb-2">Claim Already Submitted</h2>
                        <p className="text-muted-foreground">
                            You have already submitted a claim for this venue. Our team is reviewing it.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Link
                href={`/venues/${venue.slug}`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to venue
            </Link>

            {/* Venue Summary */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6">
                <CardHeader>
                    <CardTitle>Claim This Venue</CardTitle>
                    <CardDescription>
                        Submit proof of ownership to manage this listing
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-2xl">🎱</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{venue.name}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mr-1" />
                                {venue.city}, {venue.state}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Claim Form */}
            <ClaimForm
                venueId={venue.id}
                venueName={venue.name}
                userEmail={user.email || ''}
            />
        </div>
    );
}
