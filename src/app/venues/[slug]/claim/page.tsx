import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClaimVenueForm } from '@/components/venues/ClaimVenueForm';

interface ClaimPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClaimPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: venue } = await supabase
        .from('venues')
        .select('name')
        .eq('slug', slug)
        .single();

    return {
        title: venue ? `Claim ${venue.name}` : 'Claim Venue',
        description: 'Claim ownership of this venue to manage its listing',
    };
}

export default async function ClaimVenuePage({ params }: ClaimPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect(`/auth?next=/venues/${slug}/claim`);
    }

    // Get venue
    const { data: venue, error } = await supabase
        .from('venues')
        .select('id, name, slug, city, state, is_claimed')
        .eq('slug', slug)
        .single();

    if (error || !venue) {
        notFound();
    }

    // Check if already claimed
    if (venue.is_claimed) {
        redirect(`/venues/${slug}?error=already_claimed`);
    }

    return (
        <ClaimVenueForm
            venueId={venue.id}
            venueName={venue.name}
            venueCity={venue.city}
            venueState={venue.state}
        />
    );
}
