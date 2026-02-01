'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface NotificationPreferences {
    id: string;
    user_id: string;
    email_reservation_confirmed: boolean;
    email_reservation_reminder: boolean;
    email_reservation_cancelled: boolean;
    email_league_updates: boolean;
    email_match_reminders: boolean;
    email_review_responses: boolean;
    email_promotions: boolean;
    email_newsletter: boolean;
    push_enabled: boolean;
    push_reservation_updates: boolean;
    push_match_reminders: boolean;
}

// Get user's notification preferences
export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        // Create default preferences if none exist
        if (error.code === 'PGRST116') {
            const { data: newPrefs } = await supabase
                .from('notification_preferences')
                .insert({ user_id: user.id })
                .select()
                .single();
            return newPrefs;
        }
        console.error('Error fetching preferences:', error);
        return null;
    }

    return data;
}

// Update notification preferences
export async function updateNotificationPreferences(
    updates: Partial<Omit<NotificationPreferences, 'id' | 'user_id'>>
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error updating preferences:', error);
        return { success: false, error: 'Failed to update preferences' };
    }

    revalidatePath('/profile');
    return { success: true };
}

// Log a notification (for internal use)
export async function logNotification(params: {
    user_id: string;
    type: string;
    channel: 'email' | 'push' | 'sms';
    subject?: string;
    content?: string;
    reservation_id?: string;
    league_id?: string;
    match_id?: string;
    review_id?: string;
}): Promise<{ success: boolean; id?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notification_log')
        .insert(params)
        .select('id')
        .single();

    if (error) {
        console.error('Error logging notification:', error);
        return { success: false };
    }

    return { success: true, id: data.id };
}

// Mark notification as sent
export async function markNotificationSent(notificationId: string): Promise<void> {
    const supabase = await createClient();

    await supabase
        .from('notification_log')
        .update({
            status: 'sent',
            sent_at: new Date().toISOString()
        })
        .eq('id', notificationId);
}

// Get user's recent notifications
export async function getMyNotifications(limit = 20) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('notification_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data || [];
}
