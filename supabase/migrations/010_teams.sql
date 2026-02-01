-- Migration: 010_teams.sql
-- Teams within leagues
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- League association
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    -- Captain/owner
    captain_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL NOT NULL,
        -- Basic info
        name VARCHAR(100) NOT NULL,
        logo_url TEXT,
        description TEXT,
        -- Home venue (can differ from league venue)
        home_venue_id UUID REFERENCES venues(id) ON DELETE
    SET NULL,
        -- Status
        is_active BOOLEAN DEFAULT true,
        division VARCHAR(50),
        -- For leagues with divisions
        seed INT,
        -- Playoff seeding
        -- Stats (denormalized for quick access)
        wins INT DEFAULT 0,
        losses INT DEFAULT 0,
        ties INT DEFAULT 0,
        points INT DEFAULT 0,
        games_played INT DEFAULT 0,
        -- Contact
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        -- Unique team name per league
        UNIQUE(league_id, name)
);
-- Indexes
CREATE INDEX idx_teams_league ON teams(league_id);
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_teams_venue ON teams(home_venue_id);
-- Trigger to update updated_at
CREATE TRIGGER update_teams_updated_at BEFORE
UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
-- Teams in public leagues are viewable
CREATE POLICY "Teams are viewable in public leagues" ON teams FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM leagues l
            WHERE l.id = teams.league_id
                AND (
                    l.is_public = true
                    OR l.manager_id = auth.uid()
                )
        )
        OR captain_id = auth.uid()
    );
-- Users can create teams in leagues accepting registration
CREATE POLICY "Users can create teams" ON teams FOR
INSERT WITH CHECK (
        auth.uid() = captain_id
        AND EXISTS (
            SELECT 1
            FROM leagues l
            WHERE l.id = teams.league_id
                AND l.status IN ('draft', 'registration')
        )
    );
-- Captains and league managers can update teams
CREATE POLICY "Captains and managers can update teams" ON teams FOR
UPDATE USING (
        captain_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM leagues l
            WHERE l.id = teams.league_id
                AND l.manager_id = auth.uid()
        )
    );
-- Captains can delete teams only during registration
CREATE POLICY "Captains can delete teams during registration" ON teams FOR DELETE USING (
    captain_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM leagues l
        WHERE l.id = teams.league_id
            AND l.status IN ('draft', 'registration')
    )
);
-- Admins can manage all teams
CREATE POLICY "Admins can manage all teams" ON teams FOR ALL USING (is_admin());
COMMENT ON TABLE teams IS 'Teams participating in leagues';