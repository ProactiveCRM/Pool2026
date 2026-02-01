'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    PlayerProfile,
    Badge,
    FavoriteVenue,
    UpdateProfileFormData,
} from '@/types/profiles';

// Get or create profile for current user
export async function getMyProfile(): Promise<PlayerProfile | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Try to get existing profile
    let { data: profile } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

    // Create if doesn't exist
    if (!profile) {
        const { data: newProfile, error } = await supabase
            .from('player_profiles')
            .insert({
                user_id: user.id,
                display_name: user.email?.split('@')[0] || 'Player',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating profile:', error);
            return null;
        }
        profile = newProfile;
    }

    return profile;
}

// Get player profile by user ID
export async function getPlayerProfile(userId: string): Promise<PlayerProfile | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
}

// Update profile
export async function updateProfile(formData: UpdateProfileFormData): Promise<{
    success: boolean;
    profile?: PlayerProfile;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in' };
    }

    const { data, error } = await supabase
        .from('player_profiles')
        .update(formData)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: 'Failed to update profile' };
    }

    revalidatePath('/profile');
    return { success: true, profile: data };
}

// Get all badges
export async function getAllBadges(): Promise<Badge[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('category')
        .order('points');

    if (error) {
        console.error('Error fetching badges:', error);
        return [];
    }

    return data || [];
}

// Get user's favorite venues
export async function getMyFavorites(): Promise<FavoriteVenue[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('favorite_venues')
        .select(`
      *,
      venue:venues(id, name, slug, city, state, image_url)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }

    return data || [];
}

// Toggle favorite venue
export async function toggleFavorite(venueId: string): Promise<{
    success: boolean;
    isFavorite: boolean;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, isFavorite: false, error: 'You must be logged in' };
    }

    // Check if already favorited
    const { data: existing } = await supabase
        .from('favorite_venues')
        .select('id')
        .eq('user_id', user.id)
        .eq('venue_id', venueId)
        .single();

    if (existing) {
        // Remove favorite
        await supabase
            .from('favorite_venues')
            .delete()
            .eq('id', existing.id);

        revalidatePath('/venues');
        revalidatePath('/profile');
        return { success: true, isFavorite: false };
    } else {
        // Add favorite
        const { error } = await supabase
            .from('favorite_venues')
            .insert({
                user_id: user.id,
                venue_id: venueId,
            });

        if (error) {
            console.error('Error adding favorite:', error);
            return { success: false, isFavorite: false, error: 'Failed to add favorite' };
        }

        revalidatePath('/venues');
        revalidatePath('/profile');
        return { success: true, isFavorite: true };
    }
}

// Check if venue is favorited
export async function isVenueFavorited(venueId: string): Promise<boolean> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('favorite_venues')
        .select('id')
        .eq('user_id', user.id)
        .eq('venue_id', venueId)
        .single();

    return !!data;
}

// Search for players looking for games/teams
export async function findPlayers(options: {
    city?: string;
    state?: string;
    lookingForGames?: boolean;
    lookingForTeam?: boolean;
    lookingForLeague?: boolean;
    skillLevel?: string;
}): Promise<PlayerProfile[]> {
    const supabase = await createClient();

    let query = supabase
        .from('player_profiles')
        .select('*')
        .eq('is_public', true);

    if (options.city) query = query.ilike('city', `%${options.city}%`);
    if (options.state) query = query.eq('state', options.state);
    if (options.lookingForGames) query = query.eq('looking_for_games', true);
    if (options.lookingForTeam) query = query.eq('looking_for_team', true);
    if (options.lookingForLeague) query = query.eq('looking_for_league', true);
    if (options.skillLevel) query = query.eq('skill_level', options.skillLevel);

    const { data, error } = await query.limit(50);

    if (error) {
        console.error('Error finding players:', error);
        return [];
    }

    return data || [];
}

// Award a badge to user
export async function awardBadge(badgeId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in' };
    }

    // Get current badges
    const { data: profile } = await supabase
        .from('player_profiles')
        .select('badges')
        .eq('user_id', user.id)
        .single();

    if (!profile) {
        return { success: false, error: 'Profile not found' };
    }

    const currentBadges = profile.badges || [];
    if (currentBadges.includes(badgeId)) {
        return { success: true }; // Already has badge
    }

    const { error } = await supabase
        .from('player_profiles')
        .update({ badges: [...currentBadges, badgeId] })
        .eq('user_id', user.id);

    if (error) {
        console.error('Error awarding badge:', error);
        return { success: false, error: 'Failed to award badge' };
    }

    revalidatePath('/profile');
    return { success: true };
}
