import { createClient } from '@/lib/supabase/server';
import { ClaimsReviewClient } from './ClaimsReviewClient';

export const metadata = {
    title: 'Claims Review - Admin',
    description: 'Review and manage venue ownership claims',
};

export default async function AdminClaimsPage() {
    const supabase = await createClient();

    const { data: claims } = await supabase
        .from('claims')
        .select(`
      *,
      venue:venues(id, name, slug, city, state)
    `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Claims Review</h1>
                <p className="text-muted-foreground">Review and manage venue ownership claims</p>
            </div>

            <ClaimsReviewClient claims={claims || []} />
        </div>
    );
}
