-- Migration: 015_analytics.sql
-- Analytics views and functions for venue owners
-- Reservation analytics view
CREATE OR REPLACE VIEW venue_reservation_stats AS
SELECT v.id as venue_id,
    v.name as venue_name,
    v.owner_id,
    COUNT(r.id) as total_reservations,
    COUNT(
        CASE
            WHEN r.status = 'confirmed' THEN 1
        END
    ) as confirmed_count,
    COUNT(
        CASE
            WHEN r.status = 'completed' THEN 1
        END
    ) as completed_count,
    COUNT(
        CASE
            WHEN r.status = 'cancelled' THEN 1
        END
    ) as cancelled_count,
    COUNT(
        CASE
            WHEN r.status = 'no_show' THEN 1
        END
    ) as no_show_count,
    AVG(r.party_size) as avg_party_size,
    COUNT(DISTINCT r.user_id) as unique_customers,
    COUNT(
        CASE
            WHEN r.created_at >= NOW() - INTERVAL '7 days' THEN 1
        END
    ) as last_7_days,
    COUNT(
        CASE
            WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1
        END
    ) as last_30_days
FROM venues v
    LEFT JOIN reservations r ON r.venue_id = v.id
GROUP BY v.id,
    v.name,
    v.owner_id;
-- Review analytics view
CREATE OR REPLACE VIEW venue_review_stats AS
SELECT v.id as venue_id,
    v.name as venue_name,
    v.owner_id,
    COUNT(rv.id) as total_reviews,
    AVG(rv.rating)::NUMERIC(2, 1) as avg_rating,
    AVG(rv.rating_tables)::NUMERIC(2, 1) as avg_tables_rating,
    AVG(rv.rating_atmosphere)::NUMERIC(2, 1) as avg_atmosphere_rating,
    AVG(rv.rating_service)::NUMERIC(2, 1) as avg_service_rating,
    AVG(rv.rating_value)::NUMERIC(2, 1) as avg_value_rating,
    COUNT(
        CASE
            WHEN rv.rating = 5 THEN 1
        END
    ) as five_star_count,
    COUNT(
        CASE
            WHEN rv.rating = 1 THEN 1
        END
    ) as one_star_count,
    COUNT(
        CASE
            WHEN rv.is_verified THEN 1
        END
    ) as verified_count,
    COUNT(
        CASE
            WHEN rv.created_at >= NOW() - INTERVAL '30 days' THEN 1
        END
    ) as last_30_days
FROM venues v
    LEFT JOIN reviews rv ON rv.venue_id = v.id
    AND rv.status = 'published'
GROUP BY v.id,
    v.name,
    v.owner_id;
-- Daily reservation counts for charts
CREATE OR REPLACE VIEW daily_reservation_counts AS
SELECT r.venue_id,
    DATE(r.reservation_date) as date,
    COUNT(*) as reservation_count,
    SUM(r.party_size) as total_guests
FROM reservations r
WHERE r.created_at >= NOW() - INTERVAL '90 days'
GROUP BY r.venue_id,
    DATE(r.reservation_date)
ORDER BY date DESC;
-- Popular time slots
CREATE OR REPLACE VIEW popular_time_slots AS
SELECT venue_id,
    reservation_time,
    EXTRACT(
        DOW
        FROM reservation_date
    ) as day_of_week,
    COUNT(*) as booking_count
FROM reservations
WHERE status IN ('confirmed', 'completed')
    AND created_at >= NOW() - INTERVAL '90 days'
GROUP BY venue_id,
    reservation_time,
    EXTRACT(
        DOW
        FROM reservation_date
    )
ORDER BY booking_count DESC;
-- Venue promotions table
CREATE TABLE IF NOT EXISTS venue_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    -- Promotion details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(30) NOT NULL CHECK (
        promotion_type IN (
            'discount',
            'happy_hour',
            'special_event',
            'tournament',
            'league_night'
        )
    ),
    -- Discount details
    discount_type VARCHAR(20) CHECK (
        discount_type IN ('percentage', 'fixed', 'free_hour')
    ),
    discount_value DECIMAL(10, 2),
    -- Schedule
    start_date DATE,
    end_date DATE,
    days_of_week INT [],
    -- 0-6 for Sun-Sat
    start_time TIME,
    end_time TIME,
    is_recurring BOOLEAN DEFAULT false,
    -- Visibility
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    -- Tracking
    views_count INT DEFAULT 0,
    redemptions_count INT DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_venue_promotions_venue ON venue_promotions(venue_id);
CREATE INDEX idx_venue_promotions_active ON venue_promotions(is_active, is_featured);
CREATE INDEX idx_venue_promotions_dates ON venue_promotions(start_date, end_date);
-- Trigger to update updated_at
CREATE TRIGGER update_venue_promotions_updated_at BEFORE
UPDATE ON venue_promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE venue_promotions ENABLE ROW LEVEL SECURITY;
-- Active promotions are public
CREATE POLICY "Active promotions are viewable" ON venue_promotions FOR
SELECT USING (is_active = true);
-- Venue owners can manage their promotions
CREATE POLICY "Owners can manage promotions" ON venue_promotions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM venues v
        WHERE v.id = venue_promotions.venue_id
            AND v.owner_id = auth.uid()
    )
);
-- Function to get venue dashboard stats
CREATE OR REPLACE FUNCTION get_venue_dashboard_stats(p_venue_id UUID) RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
SELECT json_build_object(
        'reservations',
        (
            SELECT json_build_object(
                    'total',
                    COALESCE(COUNT(*), 0),
                    'today',
                    COALESCE(
                        COUNT(*) FILTER (
                            WHERE reservation_date = CURRENT_DATE
                        ),
                        0
                    ),
                    'this_week',
                    COALESCE(
                        COUNT(*) FILTER (
                            WHERE reservation_date >= DATE_TRUNC('week', CURRENT_DATE)
                        ),
                        0
                    ),
                    'this_month',
                    COALESCE(
                        COUNT(*) FILTER (
                            WHERE reservation_date >= DATE_TRUNC('month', CURRENT_DATE)
                        ),
                        0
                    ),
                    'pending',
                    COALESCE(
                        COUNT(*) FILTER (
                            WHERE status = 'pending'
                        ),
                        0
                    ),
                    'confirmed',
                    COALESCE(
                        COUNT(*) FILTER (
                            WHERE status = 'confirmed'
                        ),
                        0
                    )
                )
            FROM reservations
            WHERE venue_id = p_venue_id
        ),
        'reviews',
        (
            SELECT json_build_object(
                    'total',
                    COALESCE(COUNT(*), 0),
                    'average_rating',
                    COALESCE(ROUND(AVG(rating)::NUMERIC, 1), 0),
                    'new_this_month',
                    COALESCE(
                        COUNT(*) FILTER (
                            WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
                        ),
                        0
                    )
                )
            FROM reviews
            WHERE venue_id = p_venue_id
                AND status = 'published'
        ),
        'promotions',
        (
            SELECT json_build_object(
                    'active',
                    COALESCE(
                        COUNT(*) FILTER (
                            WHERE is_active = true
                        ),
                        0
                    ),
                    'total_views',
                    COALESCE(SUM(views_count), 0),
                    'total_redemptions',
                    COALESCE(SUM(redemptions_count), 0)
                )
            FROM venue_promotions
            WHERE venue_id = p_venue_id
        )
    ) INTO result;
RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON TABLE venue_promotions IS 'Promotional offers and events for venues';
COMMENT ON FUNCTION get_venue_dashboard_stats IS 'Get aggregated dashboard statistics for a venue';