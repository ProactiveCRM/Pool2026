-- Migration: 014_player_profiles.sql
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
COMMENT ON TABLE badges IS 'Achievement badges players can earn';