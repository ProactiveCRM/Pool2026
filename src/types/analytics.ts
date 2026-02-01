// Types for analytics and venue dashboard

export type PromotionType = 'discount' | 'happy_hour' | 'special_event' | 'tournament' | 'league_night';
export type DiscountType = 'percentage' | 'fixed' | 'free_hour';

export interface VenuePromotion {
    id: string;
    venue_id: string;
    name: string;
    description: string | null;
    promotion_type: PromotionType;
    discount_type: DiscountType | null;
    discount_value: number | null;
    start_date: string | null;
    end_date: string | null;
    days_of_week: number[] | null;
    start_time: string | null;
    end_time: string | null;
    is_recurring: boolean;
    is_active: boolean;
    is_featured: boolean;
    views_count: number;
    redemptions_count: number;
    created_at: string;
    updated_at: string;
}

export interface VenueReservationStats {
    venue_id: string;
    venue_name: string;
    total_reservations: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
    no_show_count: number;
    avg_party_size: number;
    unique_customers: number;
    last_7_days: number;
    last_30_days: number;
}

export interface VenueReviewStats {
    venue_id: string;
    venue_name: string;
    total_reviews: number;
    avg_rating: number;
    avg_tables_rating: number | null;
    avg_atmosphere_rating: number | null;
    avg_service_rating: number | null;
    avg_value_rating: number | null;
    five_star_count: number;
    one_star_count: number;
    verified_count: number;
    last_30_days: number;
}

export interface DashboardStats {
    reservations: {
        total: number;
        today: number;
        this_week: number;
        this_month: number;
        pending: number;
        confirmed: number;
    };
    reviews: {
        total: number;
        average_rating: number;
        new_this_month: number;
    };
    promotions: {
        active: number;
        total_views: number;
        total_redemptions: number;
    };
}

export interface CreatePromotionFormData {
    venue_id: string;
    name: string;
    description?: string;
    promotion_type: PromotionType;
    discount_type?: DiscountType;
    discount_value?: number;
    start_date?: string;
    end_date?: string;
    days_of_week?: number[];
    start_time?: string;
    end_time?: string;
    is_recurring?: boolean;
}

// Display helpers
export const PROMOTION_TYPE_LABELS: Record<PromotionType, { label: string; icon: string }> = {
    discount: { label: 'Discount', icon: '💰' },
    happy_hour: { label: 'Happy Hour', icon: '🍺' },
    special_event: { label: 'Special Event', icon: '🎉' },
    tournament: { label: 'Tournament', icon: '🏆' },
    league_night: { label: 'League Night', icon: '🎱' },
};

export const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
    percentage: '% Off',
    fixed: '$ Off',
    free_hour: 'Free Hour',
};

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
