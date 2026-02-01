'use server';

import { createClient } from '@/lib/supabase/server';
import { claimCreateSchema, type ClaimCreateInput } from '@/lib/validations/claim';
import { revalidatePath } from 'next/cache';

interface ActionResult {
    success: boolean;
    error?: string;
    data?: { id: string };
}

export async function createClaim(input: ClaimCreateInput): Promise<ActionResult> {
    try {
        const validated = claimCreateSchema.parse(input);

        const supabase = await createClient();

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'You must be signed in to claim a venue.' };
        }

        // Check if venue exists
        const { data: venue, error: venueError } = await supabase
            .from('venues')
            .select('id, name, is_claimed')
            .eq('id', validated.venue_id)
            .single();

        if (venueError || !venue) {
            return { success: false, error: 'Venue not found.' };
        }

        if (venue.is_claimed) {
            return { success: false, error: 'This venue has already been claimed.' };
        }

        // Check if user already has a pending claim for this venue
        const { data: existingClaim } = await supabase
            .from('claims')
            .select('id')
            .eq('venue_id', validated.venue_id)
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .single();

        if (existingClaim) {
            return { success: false, error: 'You already have a pending claim for this venue.' };
        }

        // Create the claim
        const { data, error } = await supabase
            .from('claims')
            .insert({
                venue_id: validated.venue_id,
                user_id: user.id,
                user_name: validated.user_name,
                user_email: validated.user_email,
                user_phone: validated.user_phone || null,
                business_role: validated.business_role,
                proof_type: validated.proof_type,
                proof_url: validated.proof_url,
                status: 'pending',
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating claim:', error);
            return { success: false, error: 'Failed to submit claim. Please try again.' };
        }

        // TODO: Trigger GHL integration asynchronously

        revalidatePath('/dashboard');
        revalidatePath('/admin/claims');

        return { success: true, data: { id: data.id } };
    } catch (error) {
        console.error('Error in createClaim:', error);
        if (error instanceof Error && error.name === 'ZodError') {
            return { success: false, error: 'Invalid form data. Please check your inputs.' };
        }
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

export async function getUserClaims() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('claims')
        .select(`
      *,
      venue:venues(id, name, slug, city, state)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user claims:', error);
        return [];
    }

    return data ?? [];
}
