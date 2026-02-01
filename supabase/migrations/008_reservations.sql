-- Migration: 008_reservations.sql
-- Table reservations/bookings
-- Enable btree_gist extension for exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Core relationships
    table_id UUID REFERENCES tables(id) ON DELETE
    SET NULL,
        venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL NOT NULL,
        -- Booking details
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        duration_minutes INT GENERATED ALWAYS AS (
            EXTRACT(
                EPOCH
                FROM (end_time - start_time)
            ) / 60
        ) STORED,
        party_size INT DEFAULT 2 CHECK (
            party_size >= 1
            AND party_size <= 20
        ),
        -- Table preferences (if no specific table assigned)
        preferred_table_type VARCHAR(30),
        -- '9-foot', '8-foot', etc.
        any_table_ok BOOLEAN DEFAULT true,
        -- Accept any available table
        -- Status tracking
        status VARCHAR(20) DEFAULT 'confirmed' CHECK (
            status IN (
                'pending',
                'confirmed',
                'cancelled',
                'completed',
                'no_show'
            )
        ),
        -- Contact & notes
        guest_name VARCHAR(100),
        -- For walk-ins or phone bookings
        guest_phone VARCHAR(20),
        guest_email VARCHAR(255),
        special_requests TEXT,
        internal_notes TEXT,
        -- Staff notes
        -- Pricing
        estimated_price DECIMAL(10, 2),
        final_price DECIMAL(10, 2),
        deposit_amount DECIMAL(10, 2),
        is_paid BOOLEAN DEFAULT false,
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ,
        checked_in_at TIMESTAMPTZ,
        checked_out_at TIMESTAMPTZ,
        -- Prevent double-booking the same table
        CONSTRAINT valid_time_range CHECK (end_time > start_time),
        CONSTRAINT max_duration CHECK (end_time - start_time <= interval '8 hours')
);
-- Exclusion constraint to prevent overlapping reservations on the same table
-- Only applies when table_id is set and status is not cancelled
CREATE INDEX idx_reservations_no_overlap ON reservations(table_id, start_time, end_time)
WHERE table_id IS NOT NULL
    AND status NOT IN ('cancelled', 'no_show');
-- Additional indexes for common queries
CREATE INDEX idx_reservations_venue_id ON reservations(venue_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_start_time ON reservations(start_time);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_venue_date ON reservations(venue_id, start_time)
WHERE status NOT IN ('cancelled', 'no_show');
-- Trigger to update updated_at
CREATE TRIGGER update_reservations_updated_at BEFORE
UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
-- Users can view their own reservations
CREATE POLICY "Users can view own reservations" ON reservations FOR
SELECT USING (auth.uid() = user_id);
-- Users can create reservations
CREATE POLICY "Users can create reservations" ON reservations FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own pending/confirmed reservations
CREATE POLICY "Users can modify own reservations" ON reservations FOR
UPDATE USING (
        auth.uid() = user_id
        AND status IN ('pending', 'confirmed')
    );
-- Venue owners can view and manage reservations at their venues
CREATE POLICY "Venue owners can manage reservations" ON reservations FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM venues v
        WHERE v.id = reservations.venue_id
            AND v.claimed_by = auth.uid()
    )
);
-- Admins can manage all reservations
CREATE POLICY "Admins can manage all reservations" ON reservations FOR ALL USING (is_admin());
COMMENT ON TABLE reservations IS 'Table reservations/bookings at venues';