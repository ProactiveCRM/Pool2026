-- Migration: 011_team_members.sql
-- Players on teams
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Team association
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    -- Player
    player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    -- Role
    role VARCHAR(20) DEFAULT 'player' CHECK (
        role IN (
            'captain',
            'co-captain',
            'player',
            'sub',
            'inactive'
        )
    ),
    -- Player info
    display_name VARCHAR(100),
    -- Override for display
    jersey_number VARCHAR(10),
    -- Skill/handicap
    skill_level INT,
    -- 1-9 for APA-style
    handicap DECIMAL(4, 2),
    -- Stats (denormalized)
    matches_played INT DEFAULT 0,
    matches_won INT DEFAULT 0,
    games_played INT DEFAULT 0,
    games_won INT DEFAULT 0,
    -- Status
    is_active BOOLEAN DEFAULT true,
    -- Timestamps
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- One membership per team per player
    UNIQUE(team_id, player_id)
);
-- Indexes
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_player ON team_members(player_id);
CREATE INDEX idx_team_members_role ON team_members(role);
-- Trigger to update updated_at
CREATE TRIGGER update_team_members_updated_at BEFORE
UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- Team members are viewable if team is viewable
CREATE POLICY "Team members are viewable" ON team_members FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM teams t
                JOIN leagues l ON l.id = t.league_id
            WHERE t.id = team_members.team_id
                AND (
                    l.is_public = true
                    OR l.manager_id = auth.uid()
                    OR t.captain_id = auth.uid()
                )
        )
        OR player_id = auth.uid()
    );
-- Captains and co-captains can add members
CREATE POLICY "Captains can add members" ON team_members FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM team_members tm
            WHERE tm.team_id = team_members.team_id
                AND tm.player_id = auth.uid()
                AND tm.role IN ('captain', 'co-captain')
        )
        OR EXISTS (
            SELECT 1
            FROM teams t
            WHERE t.id = team_members.team_id
                AND t.captain_id = auth.uid()
        )
    );
-- Captains, co-captains, and league managers can update
CREATE POLICY "Captains and managers can update members" ON team_members FOR
UPDATE USING (
        player_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM teams t
            WHERE t.id = team_members.team_id
                AND t.captain_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM teams t
                JOIN leagues l ON l.id = t.league_id
            WHERE t.id = team_members.team_id
                AND l.manager_id = auth.uid()
        )
    );
-- Captains can remove members
CREATE POLICY "Captains can remove members" ON team_members FOR DELETE USING (
    player_id = auth.uid() -- Players can leave
    OR EXISTS (
        SELECT 1
        FROM teams t
        WHERE t.id = team_members.team_id
            AND t.captain_id = auth.uid()
    )
);
-- Admins can manage all
CREATE POLICY "Admins can manage all team members" ON team_members FOR ALL USING (is_admin());
COMMENT ON TABLE team_members IS 'Players on league teams';