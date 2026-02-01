-- Migration: 012_matches.sql
-- League matches between teams
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- League association
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    -- Teams
    home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    -- Scheduling
    scheduled_at TIMESTAMPTZ,
    venue_id UUID REFERENCES venues(id) ON DELETE
    SET NULL,
        week_number INT,
        round VARCHAR(30),
        -- 'regular', 'playoff', 'semifinal', 'final'
        -- Status
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (
            status IN (
                'scheduled',
                'in_progress',
                'completed',
                'postponed',
                'cancelled',
                'forfeit'
            )
        ),
        -- Results
        home_score INT,
        away_score INT,
        winner_team_id UUID REFERENCES teams(id),
        is_tie BOOLEAN DEFAULT false,
        -- Points awarded
        home_points INT,
        away_points INT,
        -- Reservation link (if booked through PoolFinder)
        reservation_id UUID REFERENCES reservations(id) ON DELETE
    SET NULL,
        -- Notes
        notes TEXT,
        -- Timestamps
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        -- Ensure teams are different
        CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);
-- Indexes
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_matches_home_team ON matches(home_team_id);
CREATE INDEX idx_matches_away_team ON matches(away_team_id);
CREATE INDEX idx_matches_scheduled ON matches(scheduled_at);
CREATE INDEX idx_matches_week ON matches(league_id, week_number);
CREATE INDEX idx_matches_status ON matches(status);
-- Trigger to update updated_at
CREATE TRIGGER update_matches_updated_at BEFORE
UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
-- Matches are viewable if league is public
CREATE POLICY "Matches are viewable in public leagues" ON matches FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM leagues l
            WHERE l.id = matches.league_id
                AND (
                    l.is_public = true
                    OR l.manager_id = auth.uid()
                )
        )
    );
-- League managers can create matches
CREATE POLICY "Managers can create matches" ON matches FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM leagues l
            WHERE l.id = matches.league_id
                AND l.manager_id = auth.uid()
        )
    );
-- League managers and team captains can update matches
CREATE POLICY "Managers and captains can update matches" ON matches FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM leagues l
            WHERE l.id = matches.league_id
                AND l.manager_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM teams t
            WHERE (
                    t.id = matches.home_team_id
                    OR t.id = matches.away_team_id
                )
                AND t.captain_id = auth.uid()
        )
    );
-- Only league managers can delete matches
CREATE POLICY "Managers can delete matches" ON matches FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM leagues l
        WHERE l.id = matches.league_id
            AND l.manager_id = auth.uid()
    )
);
-- Admins can manage all
CREATE POLICY "Admins can manage all matches" ON matches FOR ALL USING (is_admin());
COMMENT ON TABLE matches IS 'Scheduled and completed matches between teams';