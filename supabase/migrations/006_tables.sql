-- Migration: 006_tables.sql
-- Individual pool tables at venues
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL,
    -- "Table 1", "Diamond 9-ft #3"
    table_type VARCHAR(30),
    -- '7-foot', '8-foot', '9-foot', 'snooker', '10-foot'
    brand VARCHAR(50),
    -- 'Diamond', 'Brunswick', 'Olhausen', 'Valley'
    cloth_color VARCHAR(30) DEFAULT 'green',
    -- 'green', 'blue', 'red', 'burgundy'
    hourly_rate DECIMAL(10, 2),
    -- Base rate per hour (nullable if free or varies)
    peak_hourly_rate DECIMAL(10, 2),
    -- Weekend/evening rate
    is_available BOOLEAN DEFAULT true,
    -- Can be booked
    is_active BOOLEAN DEFAULT true,
    -- Is the table in service
    position_order INT DEFAULT 0,
    -- Display order in venue
    notes TEXT,
    -- "Near the bar", "Tournament table"
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for fast venue lookups
CREATE INDEX idx_tables_venue_id ON tables(venue_id);
CREATE INDEX idx_tables_available ON tables(venue_id, is_available, is_active);
-- Trigger to update updated_at
CREATE TRIGGER update_tables_updated_at BEFORE
UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
-- Everyone can view active tables at active venues
CREATE POLICY "Tables are viewable by everyone" ON tables FOR
SELECT USING (is_active = true);
-- Venue owners can manage their tables
CREATE POLICY "Venue owners can manage tables" ON tables FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM venues v
        WHERE v.id = tables.venue_id
            AND v.claimed_by = auth.uid()
    )
);
-- Admins can manage all tables
CREATE POLICY "Admins can manage all tables" ON tables FOR ALL USING (is_admin());
COMMENT ON TABLE tables IS 'Individual pool tables at each venue for reservations';