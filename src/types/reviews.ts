// Types for reviews and ratings system

export type ReviewStatus = 'pending' | 'published' | 'flagged' | 'hidden';

export interface Review {
    id: string;
    venue_id: string;
    user_id: string;
    rating: number;
    rating_tables: number | null;
    rating_atmosphere: number | null;
    rating_service: number | null;
    rating_value: number | null;
    title: string | null;
    content: string | null;
    is_verified: boolean;
    reservation_id: string | null;
    visit_date: string | null;
    photos: string[] | null;
    helpful_count: number;
    status: ReviewStatus;
    owner_response: string | null;
    owner_response_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    venue?: {
        id: string;
        name: string;
        slug: string;
        city: string;
        state: string;
    };
    user?: {
        email: string;
        display_name?: string;
    };
    user_voted?: boolean;
}

export interface ReviewVote {
    id: string;
    review_id: string;
    user_id: string;
    is_helpful: boolean;
    created_at: string;
}

export interface CreateReviewFormData {
    venue_id: string;
    rating: number;
    rating_tables?: number;
    rating_atmosphere?: number;
    rating_service?: number;
    rating_value?: number;
    title?: string;
    content?: string;
    visit_date?: string;
    photos?: string[];
    reservation_id?: string;
}

export interface VenueRatingStats {
    average_rating: number;
    total_reviews: number;
    rating_breakdown: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    average_tables: number | null;
    average_atmosphere: number | null;
    average_service: number | null;
    average_value: number | null;
}

// Star display helpers
export const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export function getRatingLabel(rating: number): string {
    return RATING_LABELS[Math.round(rating)] || '';
}

export function formatRating(rating: number): string {
    return rating.toFixed(1);
}
