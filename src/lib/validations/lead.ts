import { z } from 'zod';

// Schema for submitting a lead/inquiry
export const leadCreateSchema = z.object({
    venue_id: z.string().uuid('Invalid venue ID'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    message: z.string().max(2000, 'Message is too long').optional(),
    lead_type: z.enum(['inquiry', 'booking_interest', 'event_inquiry', 'other']),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;

// Constants for lead forms
export const LEAD_TYPES = [
    { value: 'inquiry', label: 'General Inquiry' },
    { value: 'booking_interest', label: 'Booking Interest' },
    { value: 'event_inquiry', label: 'Event Inquiry' },
    { value: 'other', label: 'Other' },
] as const;
