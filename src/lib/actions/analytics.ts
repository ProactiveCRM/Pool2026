'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    VenuePromotion,
    DashboardStats,
    CreatePromotionFormData,
} from '@/types/analytics';

// Get dashboard stats for a venue
export async function getVenueDashboardStats(venueId: string): Promise<DashboardStats | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .rpc('get_venue_dashboard_stats', { p_venue_id: venueId });

    if (error) {
        console.error('Error fetching dashboard stats:', error);
        // Return mock data if function doesn't exist yet
        return {
            reservations: { total: 0, today: 0, this_week: 0, this_month: 0, pending: 0, confirmed: 0 },
            reviews: { total: 0, average_rating: 0, new_this_month: 0 },
            promotions: { active: 0, total_views: 0, total_redemptions: 0 },
        };
    }

    return data;
}

// Get venues owned by current user
export async function getMyVenues() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('venues')
        .select('id, name, slug, city, state, image_url')
        .eq('owner_id', user.id)
        .order('name');

    if (error) {
        console.error('Error fetching my venues:', error);
        return [];
    }

    return data || [];
}

// Get promotions for a venue
export async function getVenuePromotions(venueId: string): Promise<VenuePromotion[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('venue_promotions')
        .select('*')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching promotions:', error);
        return [];
    }

    return data || [];
}

// Get active promotions (for public display)
export async function getActivePromotions(venueId?: string): Promise<VenuePromotion[]> {
    const supabase = await createClient();

    let query = supabase
        .from('venue_promotions')
        .select('*')
        .eq('is_active', true)
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString().split('T')[0]}`);

    if (venueId) {
        query = query.eq('venue_id', venueId);
    }

    const { data, error } = await query.order('is_featured', { ascending: false });

    if (error) {
        console.error('Error fetching active promotions:', error);
        return [];
    }

    return data || [];
}

// Create a promotion
export async function createPromotion(formData: CreatePromotionFormData): Promise<{
    success: boolean;
    promotion?: VenuePromotion;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in' };
    }

    // Verify user owns the venue
    const { data: venue } = await supabase
        .from('venues')
        .select('owner_id')
        .eq('id', formData.venue_id)
        .single();

    if (!venue || venue.owner_id !== user.id) {
        return { success: false, error: 'You can only create promotions for your own venues' };
    }

    const { data, error } = await supabase
        .from('venue_promotions')
        .insert({
            venue_id: formData.venue_id,
            name: formData.name,
            description: formData.description || null,
            promotion_type: formData.promotion_type,
            discount_type: formData.discount_type || null,
            discount_value: formData.discount_value || null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            days_of_week: formData.days_of_week || null,
            start_time: formData.start_time || null,
            end_time: formData.end_time || null,
            is_recurring: formData.is_recurring || false,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating promotion:', error);
        return { success: false, error: 'Failed to create promotion' };
    }

    revalidatePath('/venue-dashboard');
    return { success: true, promotion: data };
}

// Toggle promotion active status
export async function togglePromotionStatus(promotionId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = await createClient();

    // Get current status
    const { data: promo } = await supabase
        .from('venue_promotions')
        .select('is_active')
        .eq('id', promotionId)
        .single();

    if (!promo) {
        return { success: false, error: 'Promotion not found' };
    }

    const { error } = await supabase
        .from('venue_promotions')
        .update({ is_active: !promo.is_active })
        .eq('id', promotionId);

    if (error) {
        console.error('Error toggling promotion:', error);
        return { success: false, error: 'Failed to update promotion' };
    }

    revalidatePath('/venue-dashboard');
    return { success: true };
}

// Delete a promotion
export async function deletePromotion(promotionId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('venue_promotions')
        .delete()
        .eq('id', promotionId);

    if (error) {
        console.error('Error deleting promotion:', error);
        return { success: false, error: 'Failed to delete promotion' };
    }

    revalidatePath('/venue-dashboard');
    return { success: true };
}

// Get recent reservations for a venue
export async function getVenueRecentReservations(venueId: string, limit = 10) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }

    return data || [];
}

// Get reservation counts by day for charts
export async function getReservationsByDay(venueId: string, days = 30) {
    const supabase = await createClient();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
        .from('reservations')
        .select('reservation_date, party_size')
        .eq('venue_id', venueId)
        .gte('reservation_date', startDate.toISOString().split('T')[0])
        .order('reservation_date');

    if (error) {
        console.error('Error fetching reservation data:', error);
        return [];
    }

    // Aggregate by day
    const byDay: Record<string, { count: number; guests: number }> = {};
    for (const r of data || []) {
        const date = r.reservation_date;
        if (!byDay[date]) {
            byDay[date] = { count: 0, guests: 0 };
        }
        byDay[date].count++;
        byDay[date].guests += r.party_size;
    }

    return Object.entries(byDay).map(([date, stats]) => ({
        date,
        reservations: stats.count,
        guests: stats.guests,
    }));
}
