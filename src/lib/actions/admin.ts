'use server';

import { createClient } from '@/lib/supabase/server';

interface DashboardStats {
    totalVenues: number;
    claimedVenues: number;
    pendingClaims: number;
    totalLeads: number;
    recentLeads: number;
}

export async function getAdminDashboardStats(): Promise<DashboardStats> {
    const supabase = await createClient();

    // Get venue counts
    const { count: totalVenues } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true });

    const { count: claimedVenues } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })
        .eq('is_claimed', true);

    // Get pending claims count
    const { count: pendingClaims } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Get leads counts
    const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

    // Recent leads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString());

    return {
        totalVenues: totalVenues ?? 0,
        claimedVenues: claimedVenues ?? 0,
        pendingClaims: pendingClaims ?? 0,
        totalLeads: totalLeads ?? 0,
        recentLeads: recentLeads ?? 0,
    };
}

export async function getRecentClaims(limit = 5) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('claims')
        .select(`
      *,
      venue:venues(id, name, slug, city, state)
    `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent claims:', error);
        return [];
    }

    return data ?? [];
}

export async function getRecentLeads(limit = 5) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('leads')
        .select(`
      *,
      venue:venues(id, name, slug)
    `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching recent leads:', error);
        return [];
    }

    return data ?? [];
}

export async function updateClaimStatus(
    claimId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Verify admin
    const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!adminUser) {
        return { success: false, error: 'Unauthorized' };
    }

    // Update claim
    const { error } = await supabase
        .from('claims')
        .update({
            status,
            admin_notes: adminNotes,
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
        })
        .eq('id', claimId);

    if (error) {
        console.error('Error updating claim:', error);
        return { success: false, error: 'Failed to update claim' };
    }

    // If approved, update venue is_claimed and owner_id
    if (status === 'approved') {
        const { data: claim } = await supabase
            .from('claims')
            .select('venue_id, user_id')
            .eq('id', claimId)
            .single();

        if (claim) {
            await supabase
                .from('venues')
                .update({
                    is_claimed: true,
                    owner_id: claim.user_id,
                })
                .eq('id', claim.venue_id);
        }
    }

    return { success: true };
}
