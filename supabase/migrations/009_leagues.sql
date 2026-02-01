-- Migration: 009_leagues.sql
-- League management for pool leagues and tournaments
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Manager/owner
    manager_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL NOT NULL,
        -- Basic info
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        logo_url TEXT,
        -- Game format
        game_type VARCHAR(30) NOT NULL DEFAULT '8-ball',
        -- '8-ball', '9-ball', '10-ball', 'one-pocket', 'straight-pool'
        format VARCHAR(30) DEFAULT 'team',
        -- 'singles', 'doubles', 'scotch-doubles', 'team'
        skill_level VARCHAR(30),
        -- 'open', 'amateur', 'intermediate', 'advanced', 'pro'
        -- Season info
        season_name VARCHAR(50),
        -- "Spring 2024", "Winter League"
        season_number INT DEFAULT 1,
        season_start DATE,
        season_end DATE,
        registration_deadline DATE,
        -- Venue association
        home_venue_id UUID REFERENCES venues(id) ON DELETE
    SET NULL,
        -- Configuration
        max_teams INT DEFAULT 12,
        min_players_per_team INT DEFAULT 4,
        max_players_per_team INT DEFAULT 8,
        matches_per_week INT DEFAULT 1,
        weeks_in_season INT DEFAULT 12,
        -- Rules
        rules TEXT,
        handicap_system VARCHAR(50),
        -- 'none', 'APA', 'BCA', 'custom'
        -- Status
        status VARCHAR(20) DEFAULT 'draft' CHECK (
            status IN (
                'draft',
                'registration',
                'active',
                'playoffs',
                'completed',
                'cancelled'
            )
        ),
        is_public BOOLEAN DEFAULT true,
        -- Fees
        team_fee DECIMAL(10, 2),
        player_fee DECIMAL(10, 2),
        -- Contact
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_leagues_manager ON leagues(manager_id);
CREATE INDEX idx_leagues_status ON leagues(status);
CREATE INDEX idx_leagues_venue ON leagues(home_venue_id);
CREATE INDEX idx_leagues_slug ON leagues(slug);
-- Trigger to update updated_at
CREATE TRIGGER update_leagues_updated_at BEFORE
UPDATE ON leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
-- Public leagues are viewable by everyone
CREATE POLICY "Public leagues are viewable" ON leagues FOR
SELECT USING (
        is_public = true
        OR manager_id = auth.uid()
    );
-- Managers can create leagues
CREATE POLICY "Users can create leagues" ON leagues FOR
INSERT WITH CHECK (auth.uid() = manager_id);
-- Managers can update their leagues
CREATE POLICY "Managers can update leagues" ON leagues FOR
UPDATE USING (manager_id = auth.uid());
-- Managers can delete their leagues
CREATE POLICY "Managers can delete leagues" ON leagues FOR DELETE USING (manager_id = auth.uid());
-- Admins can manage all leagues
CREATE POLICY "Admins can manage all leagues" ON leagues FOR ALL USING (is_admin());
COMMENT ON TABLE leagues IS 'Pool leagues and tournaments';