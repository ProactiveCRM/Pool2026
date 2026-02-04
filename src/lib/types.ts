// Database types for venues, claims, leads, and admin_users

export interface Venue {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    state: string;
    zip: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    description: string | null;
    num_tables: number;
    table_types: string[];
    amenities: string[];
    hours: Record<string, string> | null;
    image_url: string | null;
    is_claimed: boolean;
    claimed_by: string | null;
    claimed_at: string | null;
    quality_score: number | null;
    enrichment_data: Record<string, unknown> | null;
    enriched_at: string | null;
    ghl_contact_id: string | null;
    abacus_entity_id: string | null;
    is_active: boolean;
    latitude: number | null;
    longitude: number | null;
    rating: number | null; // Average rating from reviews
    created_at: string;
    updated_at: string;
}

export interface Claim {
    id: string;
    venue_id: string;
    user_id: string;
    user_email: string;
    user_name: string;
    user_phone: string | null;
    business_role: 'owner' | 'manager' | 'employee';
    proof_type: 'ownership_doc' | 'utility_bill' | 'business_card' | 'other';
    proof_url: string;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    reviewed_at: string | null;
    reviewed_by: string | null;
    ghl_opportunity_id: string | null;
    created_at: string;
}

export interface Lead {
    id: string;
    venue_id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string | null;
    lead_type: 'inquiry' | 'booking_interest' | 'event_inquiry' | 'other';
    is_read: boolean;
    ghl_contact_id: string | null;
    ghl_opportunity_id: string | null;
    created_at: string;
}

export interface AdminUser {
    id: string;
    user_id: string;
    role: 'admin' | 'super_admin';
    created_at: string;
}

// Query types
export interface VenueSearchParams {
    query?: string;
    state?: string;
    city?: string;
    tableTypes?: string[];
    amenities?: string[];
    page?: number;
    limit?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Form types
export interface ClaimFormData {
    venue_id: string;
    user_name: string;
    user_email: string;
    user_phone?: string;
    business_role: 'owner' | 'manager' | 'employee';
    proof_type: 'ownership_doc' | 'utility_bill' | 'business_card' | 'other';
    proof_url: string;
}

export interface LeadFormData {
    venue_id: string;
    name: string;
    email: string;
    phone?: string;
    message?: string;
    lead_type?: 'inquiry' | 'booking_interest' | 'event_inquiry' | 'other';
}

// Venue with joined data for display
export interface VenueWithClaim extends Venue {
    claim?: Claim | null;
}

// KPI types
export interface DashboardKPIs {
    totalVenues: number;
    claimedVenues: number;
    claimsPending: number;
    claimsApprovedThisWeek: number;
    claimsApprovedAllTime: number;
    leadsThisWeek: number;
    leadsAllTime: number;
}
