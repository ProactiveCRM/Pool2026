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
COMMENT ON TABLE tables IS 'Individual pool tables at each venue for reservations';-- Migration: 007_venue_hours.sql
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
COMMENT ON TABLE venue_hours IS 'Operating hours for each day of the week';-- Migration: 008_reservations.sql
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
COMMENT ON TABLE reservations IS 'Table reservations/bookings at venues';-- Migration: 009_leagues.sql
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
COMMENT ON TABLE leagues IS 'Pool leagues and tournaments';-- Migration: 010_teams.sql
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
COMMENT ON TABLE teams IS 'Teams participating in leagues';-- Migration: 011_team_members.sql
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
COMMENT ON TABLE team_members IS 'Players on league teams';-- Migration: 012_matches.sql
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
COMMENT ON TABLE matches IS 'Scheduled and completed matches between teams';-- Migration: 013_reviews.sql
-- Reviews and ratings for venues
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Venue being reviewed
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    -- Author
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    -- Rating (1-5 stars)
    rating INT NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    -- Detailed ratings (optional)
    rating_tables INT CHECK (
        rating_tables >= 1
        AND rating_tables <= 5
    ),
    rating_atmosphere INT CHECK (
        rating_atmosphere >= 1
        AND rating_atmosphere <= 5
    ),
    rating_service INT CHECK (
        rating_service >= 1
        AND rating_service <= 5
    ),
    rating_value INT CHECK (
        rating_value >= 1
        AND rating_value <= 5
    ),
    -- Review content
    title VARCHAR(200),
    content TEXT,
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    -- Verified via reservation
    reservation_id UUID REFERENCES reservations(id) ON DELETE
    SET NULL,
        visit_date DATE,
        -- Photos (stored as array of URLs)
        photos TEXT [],
        -- Engagement
        helpful_count INT DEFAULT 0,
        -- Moderation
        status VARCHAR(20) DEFAULT 'published' CHECK (
            status IN ('pending', 'published', 'flagged', 'hidden')
        ),
        -- Venue response
        owner_response TEXT,
        owner_response_at TIMESTAMPTZ,
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        -- One review per user per venue
        UNIQUE(venue_id, user_id)
);
-- Helpful votes table
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);
-- Indexes
CREATE INDEX idx_reviews_venue ON reviews(venue_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
-- Trigger to update updated_at
CREATE TRIGGER update_reviews_updated_at BEFORE
UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Function to update venue rating stats
CREATE OR REPLACE FUNCTION update_venue_rating_stats() RETURNS TRIGGER AS $$ BEGIN -- This would update denormalized rating fields on venues table
    -- For now we'll calculate on-the-fly in queries
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- RLS Policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
-- Published reviews are viewable by everyone
CREATE POLICY "Published reviews are viewable" ON reviews FOR
SELECT USING (
        status = 'published'
        OR user_id = auth.uid()
    );
-- Users can create reviews
CREATE POLICY "Users can create reviews" ON reviews FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON reviews FOR
UPDATE USING (user_id = auth.uid());
-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (user_id = auth.uid());
-- Venue owners can respond to reviews
CREATE POLICY "Venue owners can respond" ON reviews FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM venues v
            WHERE v.id = reviews.venue_id
                AND v.owner_id = auth.uid()
        )
    );
-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (is_admin());
-- Review votes policies
CREATE POLICY "Anyone can view votes" ON review_votes FOR
SELECT USING (true);
CREATE POLICY "Users can vote" ON review_votes FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote" ON review_votes FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can remove their vote" ON review_votes FOR DELETE USING (user_id = auth.uid());
COMMENT ON TABLE reviews IS 'User reviews and ratings for venues';
COMMENT ON TABLE review_votes IS 'Helpful votes on reviews';-- Migration: 014_player_profiles.sql
-- Extended player profiles for the pool community
CREATE TABLE IF NOT EXISTS player_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- User link
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    -- Display info
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    -- Location
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'USA',
    -- Playing info
    primary_game VARCHAR(30),
    -- '8-ball', '9-ball', etc.
    skill_level VARCHAR(30),
    -- 'beginner', 'intermediate', 'advanced', 'pro'
    apa_skill_level INT CHECK (
        apa_skill_level >= 1
        AND apa_skill_level <= 9
    ),
    years_playing INT,
    preferred_table_size VARCHAR(20),
    -- '7-foot', '8-foot', '9-foot'
    -- Social links
    instagram VARCHAR(100),
    twitter VARCHAR(100),
    youtube VARCHAR(255),
    -- Stats (aggregated)
    total_matches INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_reservations INT DEFAULT 0,
    total_reviews INT DEFAULT 0,
    venues_visited INT DEFAULT 0,
    -- Badges (stored as array of badge ids)
    badges TEXT [],
    -- Availability
    looking_for_games BOOLEAN DEFAULT false,
    looking_for_team BOOLEAN DEFAULT false,
    looking_for_league BOOLEAN DEFAULT false,
    -- Privacy
    is_public BOOLEAN DEFAULT true,
    show_stats BOOLEAN DEFAULT true,
    show_activity BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Favorite venues junction table
CREATE TABLE IF NOT EXISTS favorite_venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, venue_id)
);
-- Player achievements/badges lookup
CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon TEXT,
    category VARCHAR(50),
    -- 'beginner', 'social', 'league', 'venue', 'special'
    requirement TEXT,
    -- Description of how to earn
    points INT DEFAULT 0
);
-- Seed initial badges
INSERT INTO badges (
        id,
        name,
        description,
        icon,
        category,
        requirement,
        points
    )
VALUES (
        'first_reservation',
        'First Table',
        'Made your first reservation',
        '🎱',
        'beginner',
        'Complete 1 reservation',
        10
    ),
    (
        'regular_player',
        'Regular',
        'Made 10 reservations',
        '⭐',
        'beginner',
        'Complete 10 reservations',
        50
    ),
    (
        'venue_explorer',
        'Explorer',
        'Visited 5 different venues',
        '🗺️',
        'venue',
        'Visit 5 unique venues',
        25
    ),
    (
        'first_review',
        'Critic',
        'Wrote your first review',
        '✍️',
        'social',
        'Write 1 review',
        10
    ),
    (
        'helpful_reviewer',
        'Helpful',
        '10 people found your reviews helpful',
        '👍',
        'social',
        'Get 10 helpful votes',
        30
    ),
    (
        'league_player',
        'Team Player',
        'Joined your first league',
        '🏆',
        'league',
        'Join a league',
        25
    ),
    (
        'league_winner',
        'Champion',
        'Won a league season',
        '🥇',
        'league',
        'Win a league',
        100
    ),
    (
        'captain',
        'Captain',
        'Became a team captain',
        '👑',
        'league',
        'Create or lead a team',
        40
    ),
    (
        'century_player',
        'Century',
        'Played 100 matches',
        '💯',
        'league',
        'Complete 100 league matches',
        75
    ) ON CONFLICT (id) DO NOTHING;
-- Indexes
CREATE INDEX idx_player_profiles_user ON player_profiles(user_id);
CREATE INDEX idx_player_profiles_city_state ON player_profiles(city, state);
CREATE INDEX idx_player_profiles_looking ON player_profiles(looking_for_games, looking_for_team);
CREATE INDEX idx_favorite_venues_user ON favorite_venues(user_id);
CREATE INDEX idx_favorite_venues_venue ON favorite_venues(venue_id);
-- Trigger to update updated_at
CREATE TRIGGER update_player_profiles_updated_at BEFORE
UPDATE ON player_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
-- Public profiles are viewable
CREATE POLICY "Public profiles are viewable" ON player_profiles FOR
SELECT USING (
        is_public = true
        OR user_id = auth.uid()
    );
-- Users can create their profile
CREATE POLICY "Users can create profile" ON player_profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their profile
CREATE POLICY "Users can update own profile" ON player_profiles FOR
UPDATE USING (user_id = auth.uid());
-- Favorites are user-specific
CREATE POLICY "Users can view own favorites" ON favorite_venues FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can add favorites" ON favorite_venues FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON favorite_venues FOR DELETE USING (user_id = auth.uid());
-- Badges are public
CREATE POLICY "Badges are public" ON badges FOR
SELECT USING (true);
COMMENT ON TABLE player_profiles IS 'Extended player profiles with stats and preferences';
COMMENT ON TABLE favorite_venues IS 'User favorite venues';
COMMENT ON TABLE badges IS 'Achievement badges players can earn';-- Migration: 015_analytics.sql
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
COMMENT ON FUNCTION get_venue_dashboard_stats IS 'Get aggregated dashboard statistics for a venue';-- Migration: 016_notifications.sql
-- Email notifications and user preferences
-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    -- Email notifications
    email_reservation_confirmed BOOLEAN DEFAULT true,
    email_reservation_reminder BOOLEAN DEFAULT true,
    email_reservation_cancelled BOOLEAN DEFAULT true,
    email_league_updates BOOLEAN DEFAULT true,
    email_match_reminders BOOLEAN DEFAULT true,
    email_review_responses BOOLEAN DEFAULT true,
    email_promotions BOOLEAN DEFAULT true,
    email_newsletter BOOLEAN DEFAULT false,
    -- Push notifications (future)
    push_enabled BOOLEAN DEFAULT false,
    push_reservation_updates BOOLEAN DEFAULT true,
    push_match_reminders BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Notification log
CREATE TABLE IF NOT EXISTS notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    -- Notification details
    type VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'push', 'sms')),
    subject VARCHAR(255),
    content TEXT,
    -- Related entities
    reservation_id UUID REFERENCES reservations(id) ON DELETE
    SET NULL,
        league_id UUID REFERENCES leagues(id) ON DELETE
    SET NULL,
        match_id UUID REFERENCES matches(id) ON DELETE
    SET NULL,
        review_id UUID REFERENCES reviews(id) ON DELETE
    SET NULL,
        -- Status
        status VARCHAR(20) DEFAULT 'pending' CHECK (
            status IN ('pending', 'sent', 'failed', 'opened')
        ),
        sent_at TIMESTAMPTZ,
        opened_at TIMESTAMPTZ,
        error_message TEXT,
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_log_user ON notification_log(user_id);
CREATE INDEX idx_notification_log_status ON notification_log(status);
CREATE INDEX idx_notification_log_type ON notification_log(type);
-- Trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at BEFORE
UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
-- Users can manage their own preferences
CREATE POLICY "Users manage own preferences" ON notification_preferences FOR ALL USING (user_id = auth.uid());
-- Users can view their own notifications
CREATE POLICY "Users view own notifications" ON notification_log FOR
SELECT USING (user_id = auth.uid());
-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO notification_preferences (user_id)
VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to create preferences on user creation
-- Note: This would be attached to auth.users in production
COMMENT ON TABLE notification_preferences IS 'User notification preferences for emails and push';
COMMENT ON TABLE notification_log IS 'Log of all notifications sent to users';-- Migration: 017_venue_claims.sql
-- Venue claim requests and ownership transfers
-- Venue claim requests
CREATE TABLE IF NOT EXISTS venue_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    -- Claimant info
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    -- owner, manager, staff
    -- Verification
    verification_method VARCHAR(30) NOT NULL CHECK (
        verification_method IN ('phone_call', 'email', 'document', 'in_person')
    ),
    verification_document_url TEXT,
    verification_code VARCHAR(10),
    verification_code_expires_at TIMESTAMPTZ,
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'reviewing',
            'approved',
            'rejected',
            'cancelled'
        )
    ),
    rejection_reason TEXT,
    -- Admin notes
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- One pending claim per venue per user
    UNIQUE(venue_id, user_id, status)
);
-- Indexes
CREATE INDEX idx_venue_claims_venue ON venue_claims(venue_id);
CREATE INDEX idx_venue_claims_user ON venue_claims(user_id);
CREATE INDEX idx_venue_claims_status ON venue_claims(status);
-- Trigger for updated_at
CREATE TRIGGER update_venue_claims_updated_at BEFORE
UPDATE ON venue_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- RLS Policies
ALTER TABLE venue_claims ENABLE ROW LEVEL SECURITY;
-- Users can view their own claims
CREATE POLICY "Users view own claims" ON venue_claims FOR
SELECT USING (user_id = auth.uid());
-- Users can create claims
CREATE POLICY "Users create claims" ON venue_claims FOR
INSERT WITH CHECK (user_id = auth.uid());
-- Users can cancel their own pending claims
CREATE POLICY "Users cancel own claims" ON venue_claims FOR
UPDATE USING (
        user_id = auth.uid()
        AND status = 'pending'
    ) WITH CHECK (status = 'cancelled');
-- Function to approve a claim and transfer ownership
CREATE OR REPLACE FUNCTION approve_venue_claim(claim_id UUID, admin_id UUID) RETURNS BOOLEAN AS $$
DECLARE claim_record RECORD;
BEGIN -- Get the claim
SELECT * INTO claim_record
FROM venue_claims
WHERE id = claim_id;
IF NOT FOUND THEN RETURN false;
END IF;
-- Update the venue owner
UPDATE venues
SET owner_id = claim_record.user_id,
    is_claimed = true,
    updated_at = NOW()
WHERE id = claim_record.venue_id;
-- Update the claim status
UPDATE venue_claims
SET status = 'approved',
    reviewed_by = admin_id,
    reviewed_at = NOW()
WHERE id = claim_id;
RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
COMMENT ON TABLE venue_claims IS 'Requests from users to claim venue ownership';
COMMENT ON FUNCTION approve_venue_claim IS 'Approve a venue claim and transfer ownership';-- Admin Users Migration
-- Run this after the previous migrations
-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id)
);
-- Leads table for venue inquiries
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES public.venues(id) ON DELETE
    SET NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        message TEXT,
        lead_type TEXT NOT NULL DEFAULT 'inquiry' CHECK (
            lead_type IN ('inquiry', 'booking', 'claim', 'partnership')
        ),
        status TEXT NOT NULL DEFAULT 'new' CHECK (
            status IN (
                'new',
                'contacted',
                'qualified',
                'converted',
                'closed'
            )
        ),
        assigned_to UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Add is_admin field to profiles if not exists
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'is_admin'
) THEN
ALTER TABLE public.profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
END IF;
END $$;
-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_venue_id ON public.leads(venue_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
-- RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
-- Admin users policies
CREATE POLICY "Admin users can view admin_users" ON public.admin_users FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.admin_users au
            WHERE au.user_id = auth.uid()
        )
    );
-- Leads policies
CREATE POLICY "Admins can manage leads" ON public.leads FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.admin_users au
        WHERE au.user_id = auth.uid()
    )
);
-- Grant permissions
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.leads TO authenticated;
-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE admin_users.user_id = $1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;-- Geolocation Fields Migration
-- Add latitude/longitude to venues for location-based search
-- Add geolocation columns if they don't exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'venues'
        AND column_name = 'latitude'
) THEN
ALTER TABLE public.venues
ADD COLUMN latitude DOUBLE PRECISION;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'venues'
        AND column_name = 'longitude'
) THEN
ALTER TABLE public.venues
ADD COLUMN longitude DOUBLE PRECISION;
END IF;
END $$;
-- Create index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_venues_location ON public.venues(latitude, longitude);
-- Create a function to find venues within a radius
-- Uses the Haversine formula
CREATE OR REPLACE FUNCTION get_venues_within_radius(
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        radius_miles DOUBLE PRECISION DEFAULT 25,
        max_results INTEGER DEFAULT 20
    ) RETURNS TABLE (
        id UUID,
        name TEXT,
        slug TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        description TEXT,
        num_tables INTEGER,
        table_types TEXT [],
        amenities TEXT [],
        hours JSONB,
        image_url TEXT,
        is_claimed BOOLEAN,
        is_active BOOLEAN,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        created_at TIMESTAMP WITH TIME ZONE,
        distance_miles DOUBLE PRECISION
    ) LANGUAGE sql STABLE AS $$
SELECT v.id,
    v.name,
    v.slug,
    v.address,
    v.city,
    v.state,
    v.zip,
    v.phone,
    v.email,
    v.website,
    v.description,
    v.num_tables,
    v.table_types,
    v.amenities,
    v.hours,
    v.image_url,
    v.is_claimed,
    v.is_active,
    v.latitude,
    v.longitude,
    v.created_at,
    (
        3959 * acos(
            cos(radians(lat)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(v.latitude))
        )
    ) AS distance_miles
FROM public.venues v
WHERE v.is_active = TRUE
    AND v.latitude IS NOT NULL
    AND v.longitude IS NOT NULL
    AND (
        3959 * acos(
            cos(radians(lat)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(lng)) + sin(radians(lat)) * sin(radians(v.latitude))
        )
    ) <= radius_miles
ORDER BY distance_miles ASC
LIMIT max_results;
$$;
-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_venues_within_radius TO authenticated,
    anon;