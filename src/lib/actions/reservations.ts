'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ReservationFormData, Reservation, TimeSlot, PoolTable, VenueHours } from '@/types/reservations';

// Get venue's tables
export async function getVenueTables(venueId: string): Promise<PoolTable[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tables')
        .select('*')
        .eq('venue_id', venueId)
        .eq('is_active', true)
        .order('position_order');

    if (error) {
        console.error('Error fetching tables:', error);
        return [];
    }

    return data || [];
}

// Get venue's operating hours
export async function getVenueHours(venueId: string): Promise<VenueHours[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('venue_hours')
        .select('*')
        .eq('venue_id', venueId)
        .order('day_of_week');

    if (error) {
        console.error('Error fetching venue hours:', error);
        return [];
    }

    return data || [];
}

// Check availability for a specific date
export async function checkAvailability(
    venueId: string,
    date: string // YYYY-MM-DD
): Promise<TimeSlot[]> {
    const supabase = await createClient();

    // Get venue hours for the day of week
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    const { data: hoursData } = await supabase
        .from('venue_hours')
        .select('*')
        .eq('venue_id', venueId)
        .eq('day_of_week', dayOfWeek)
        .single();

    if (!hoursData || hoursData.is_closed) {
        return []; // Venue closed this day
    }

    // Get total tables
    const { count: totalTables } = await supabase
        .from('tables')
        .select('*', { count: 'exact', head: true })
        .eq('venue_id', venueId)
        .eq('is_active', true)
        .eq('is_available', true);

    // Get existing reservations for this date
    const startOfDay = `${date}T00:00:00`;
    const endOfDay = `${date}T23:59:59`;

    const { data: reservations } = await supabase
        .from('reservations')
        .select('start_time, end_time, table_id')
        .eq('venue_id', venueId)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .not('status', 'in', '("cancelled","no_show")');

    // Generate time slots (every 30 minutes)
    const slots: TimeSlot[] = [];
    const openTime = hoursData.open_time.split(':');
    const closeTime = hoursData.close_time.split(':');

    let currentHour = parseInt(openTime[0]);
    let currentMinute = parseInt(openTime[1] || '0');
    const closeHour = parseInt(closeTime[0]);
    const closeMinute = parseInt(closeTime[1] || '0');

    while (
        currentHour < closeHour ||
        (currentHour === closeHour && currentMinute < closeMinute)
    ) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const slotStart = new Date(`${date}T${timeStr}:00`);
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour slot

        // Count how many tables are booked during this slot
        const bookedTables = (reservations || []).filter(res => {
            const resStart = new Date(res.start_time);
            const resEnd = new Date(res.end_time);
            return slotStart < resEnd && slotEnd > resStart;
        }).length;

        const availableTables = (totalTables || 0) - bookedTables;

        slots.push({
            time: timeStr,
            available: availableTables > 0,
            tables_available: Math.max(0, availableTables),
        });

        // Increment by 30 minutes
        currentMinute += 30;
        if (currentMinute >= 60) {
            currentMinute = 0;
            currentHour += 1;
        }
    }

    return slots;
}

// Create a reservation
export async function createReservation(formData: ReservationFormData): Promise<{
    success: boolean;
    reservation?: Reservation;
    error?: string;
}> {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in to make a reservation' };
    }

    // Calculate times
    const startTime = new Date(`${formData.date}T${formData.start_time}:00`);
    const endTime = new Date(startTime.getTime() + formData.duration * 60 * 1000);

    // Find an available table if not specified
    let tableId: string | null = null;

    if (!formData.any_table_ok || formData.preferred_table_type) {
        // Try to find a matching table
        const { data: tables } = await supabase
            .from('tables')
            .select('id')
            .eq('venue_id', formData.venue_id)
            .eq('is_active', true)
            .eq('is_available', true)
            .eq(formData.preferred_table_type ? 'table_type' : 'is_active', formData.preferred_table_type || true)
            .limit(1);

        if (tables && tables.length > 0) {
            tableId = tables[0].id;
        }
    }

    // Create reservation
    const { data, error } = await supabase
        .from('reservations')
        .insert({
            venue_id: formData.venue_id,
            user_id: user.id,
            table_id: tableId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            party_size: formData.party_size,
            preferred_table_type: formData.preferred_table_type || null,
            any_table_ok: formData.any_table_ok,
            special_requests: formData.special_requests || null,
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating reservation:', error);
        return { success: false, error: 'Failed to create reservation. Please try again.' };
    }

    revalidatePath('/my-reservations');
    return { success: true, reservation: data };
}

// Get user's reservations
export async function getUserReservations(): Promise<Reservation[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('reservations')
        .select(`
      *,
      venue:venues(id, name, slug, address, city, state),
      table:tables(id, name, table_type)
    `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

    if (error) {
        console.error('Error fetching reservations:', error);
        return [];
    }

    return data || [];
}

// Cancel a reservation
export async function cancelReservation(reservationId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('reservations')
        .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
        })
        .eq('id', reservationId)
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed']);

    if (error) {
        console.error('Error cancelling reservation:', error);
        return { success: false, error: 'Failed to cancel reservation' };
    }

    revalidatePath('/my-reservations');
    return { success: true };
}

// Get venue's reservations (for venue owners)
export async function getVenueReservations(
    venueId: string,
    date?: string
): Promise<Reservation[]> {
    const supabase = await createClient();

    let query = supabase
        .from('reservations')
        .select(`
      *,
      table:tables(id, name, table_type)
    `)
        .eq('venue_id', venueId)
        .order('start_time', { ascending: true });

    if (date) {
        const startOfDay = `${date}T00:00:00`;
        const endOfDay = `${date}T23:59:59`;
        query = query
            .gte('start_time', startOfDay)
            .lte('start_time', endOfDay);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching venue reservations:', error);
        return [];
    }

    return data || [];
}
