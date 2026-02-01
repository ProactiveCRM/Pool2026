import { z } from 'zod';

// Schema for submitting a claim
export const claimCreateSchema = z.object({
    venue_id: z.string().uuid('Invalid venue ID'),
    user_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    user_email: z.string().email('Invalid email address'),
    user_phone: z.string().optional(),
    business_role: z.enum(['owner', 'manager', 'employee'], {
        required_error: 'Please select your role',
    }),
    proof_type: z.enum(['ownership_doc', 'utility_bill', 'business_card', 'other'], {
        required_error: 'Please select proof type',
    }),
    proof_url: z.string().url('Proof document is required'),
});

export type ClaimCreateInput = z.infer<typeof claimCreateSchema>;

// Schema for admin reviewing a claim
export const claimReviewSchema = z.object({
    claim_id: z.string().uuid('Invalid claim ID'),
    status: z.enum(['approved', 'rejected']),
    admin_notes: z.string().max(1000).optional(),
});

export type ClaimReviewInput = z.infer<typeof claimReviewSchema>;

// Constants for claim forms
export const BUSINESS_ROLES = [
    { value: 'owner', label: 'Owner' },
    { value: 'manager', label: 'Manager' },
    { value: 'employee', label: 'Employee' },
] as const;

export const PROOF_TYPES = [
    { value: 'ownership_doc', label: 'Ownership Document' },
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'business_card', label: 'Business Card' },
    { value: 'other', label: 'Other' },
] as const;

export const CLAIM_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
] as const;
