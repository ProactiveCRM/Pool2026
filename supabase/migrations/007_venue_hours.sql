-- Migration: 007_venue_hours.sql
-- Venue operating hours
CREATE TABLE IF NOT EXISTS venue_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (
        day_of_week >= 0
        AND day_of_week <= 6
    ),
    -- 0=Sunday, 6=Saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    -- Closed this day
    notes VARCHAR(100),
    -- "Happy Hour 4-6pm"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(venue_id, day_of_week)
);
-- Index for fast venue lookups
CREATE INDEX idx_venue_hours_venue_id ON venue_hours(venue_id);
-- Trigger to update updated_at
CREATE TRIGGER update_venue_hours_updated_at BEFORE
UPDATE ON venue_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE venue_hours ENABLE ROW LEVEL SECURITY;
-- Everyone can view venue hours
CREATE POLICY "Venue hours are viewable by everyone" ON venue_hours FOR
SELECT USING (true);
-- Venue owners can manage their hours
CREATE POLICY "Venue owners can manage hours" ON venue_hours FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM venues v
        WHERE v.id = venue_hours.venue_id
            AND v.claimed_by = auth.uid()
    )
);
-- Admins can manage all venue hours
CREATE POLICY "Admins can manage all venue hours" ON venue_hours FOR ALL USING (is_admin());
COMMENT ON TABLE venue_hours IS 'Operating hours for each day of the week';