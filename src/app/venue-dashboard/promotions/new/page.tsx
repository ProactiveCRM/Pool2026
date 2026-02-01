import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyVenues } from '@/lib/actions/analytics';
import { CreatePromotionForm } from '@/components/analytics/CreatePromotionForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Create Promotion',
    description: 'Create a new promotion for your venue',
};

export default async function NewPromotionPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?next=/venue-dashboard/promotions/new');
    }

    const myVenues = await getMyVenues();

    if (myVenues.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="text-center p-8 max-w-md">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">No Venues Found</h2>
                        <p className="text-muted-foreground mb-4">
                            You need to own a venue to create promotions.
                        </p>
                        <Button asChild>
                            <Link href="/venues">Find Your Venue</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Use first venue for now
    const venue = myVenues[0];

    return <CreatePromotionForm venueId={venue.id} venueName={venue.name} />;
}
