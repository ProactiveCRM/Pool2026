'use server';

import { createClient } from '@/lib/supabase/server';
import { leadCreateSchema, type LeadCreateInput } from '@/lib/validations/lead';
import { revalidatePath } from 'next/cache';

interface ActionResult {
    success: boolean;
    error?: string;
    data?: { id: string };
}

export async function createLead(input: LeadCreateInput): Promise<ActionResult> {
    try {
        // Validate input
        const validated = leadCreateSchema.parse(input);

        const supabase = await createClient();

        // Insert the lead
        const { data, error } = await supabase
            .from('leads')
            .insert({
                venue_id: validated.venue_id,
                name: validated.name,
                email: validated.email,
                phone: validated.phone || null,
                message: validated.message || null,
                lead_type: validated.lead_type,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating lead:', error);
            return { success: false, error: 'Failed to submit inquiry. Please try again.' };
        }

        // TODO: Trigger GHL integration asynchronously
        // This would be done via a database trigger or edge function
        // to keep the user-facing action fast

        // Revalidate the venue page to show updated state if needed
        revalidatePath('/admin/leads');

        return { success: true, data: { id: data.id } };
    } catch (error) {
        console.error('Error in createLead:', error);
        if (error instanceof Error && error.name === 'ZodError') {
            return { success: false, error: 'Invalid form data. Please check your inputs.' };
        }
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
