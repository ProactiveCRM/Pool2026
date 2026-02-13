-- =============================================
-- RACKCITY COMPLETE DATABASE MIGRATION
-- Run this in Supabase SQL Editor (one time)
-- =============================================
-- =============================================
-- 001: VENUES TABLE (foundation)
-- =============================================
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    description TEXT,
    num_tables INTEGER DEFAULT 0,
    table_types TEXT [] DEFAULT '{}',
    amenities TEXT [] DEFAULT '{}',
    hours JSONB DEFAULT '{}',
    image_url TEXT,
    -- Claim status
    is_claimed BOOLEAN DEFAULT FALSE,
    claimed_by UUID REFERENCES auth.users(id),
    claimed_at TIMESTAMPTZ,
    -- Owner (for reviews responses)
    owner_id UUID REFERENCES auth.users(id),
    -- Quality/Enrichment
    quality_score INTEGER,
    enrichment_data JSONB,
    enriched_at TIMESTAMPTZ,
    -- External IDs
    ghl_contact_id TEXT,
    abacus_entity_id TEXT,
    -- Geolocation
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    -- Rating (denormalized from reviews)
    rating DOUBLE PRECISION,
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes for venues
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_state ON venues(state);
CREATE INDEX IF NOT EXISTS idx_venues_is_active ON venues(is_active);
CREATE INDEX IF NOT EXISTS idx_venues_is_claimed ON venues(is_claimed);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);
CREATE INDEX IF NOT EXISTS idx_venues_location ON venues(latitude, longitude);
-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_venues_search ON venues USING GIN(
    to_tsvector(
        'english',
        coalesce(name, '') || ' ' || coalesce(city, '') || ' ' || coalesce(state, '')
    )
);
-- Auto-update updated_at function (used by all tables)
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Alias so migrations referencing either name work
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS venues_updated_at ON venues;
CREATE TRIGGER venues_updated_at BEFORE
UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Slug generator
CREATE OR REPLACE FUNCTION generate_venue_slug() RETURNS TRIGGER AS $$
DECLARE base_slug TEXT;
new_slug TEXT;
counter INTEGER := 0;
BEGIN base_slug := lower(
    regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g')
);
base_slug := trim(
    both '-'
    from base_slug
);
new_slug := base_slug;
WHILE EXISTS (
    SELECT 1
    FROM venues
    WHERE slug = new_slug
        AND id != COALESCE(
            NEW.id,
            '00000000-0000-0000-0000-000000000000'::uuid
        )
) LOOP counter := counter + 1;
new_slug := base_slug || '-' || counter;
END LOOP;
NEW.slug := new_slug;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS venues_generate_slug ON venues;
CREATE TRIGGER venues_generate_slug BEFORE
INSERT ON venues FOR EACH ROW
    WHEN (
        NEW.slug IS NULL
        OR NEW.slug = ''
    ) EXECUTE FUNCTION generate_venue_slug();
-- =============================================
-- 002: CLAIMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    business_role TEXT NOT NULL CHECK (
        business_role IN ('owner', 'manager', 'employee')
    ),
    proof_type TEXT NOT NULL CHECK (
        proof_type IN (
            'ownership_doc',
            'utility_bill',
            'business_card',
            'other'
        )
    ),
    proof_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    ghl_opportunity_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_venue ON claims(venue_id);
CREATE INDEX IF NOT EXISTS idx_claims_user ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_created ON claims(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_claims_pending_unique ON claims(venue_id, user_id)
WHERE status = 'pending';
-- Auto-approve claim handler
CREATE OR REPLACE FUNCTION handle_claim_approval() RETURNS TRIGGER AS $$ BEGIN IF NEW.status = 'approved'
    AND OLD.status = 'pending' THEN
UPDATE venues
SET is_claimed = TRUE,
    claimed_by = NEW.user_id,
    claimed_at = NOW()
WHERE id = NEW.venue_id;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS claims_approval_trigger ON claims;
CREATE TRIGGER claims_approval_trigger
AFTER
UPDATE ON claims FOR EACH ROW
    WHEN (
        NEW.status = 'approved'
        AND OLD.status = 'pending'
    ) EXECUTE FUNCTION handle_claim_approval();
-- =============================================
-- 003: LEADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    lead_type TEXT NOT NULL DEFAULT 'inquiry' CHECK (
        lead_type IN (
            'inquiry',
            'booking_interest',
            'event_inquiry',
            'other'
        )
    ),
    is_read BOOLEAN DEFAULT FALSE,
    ghl_contact_id TEXT,
    ghl_opportunity_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leads_venue ON leads(venue_id);
CREATE INDEX IF NOT EXISTS idx_leads_is_read ON leads(is_read);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
-- =============================================
-- 004: ADMIN USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_users_user ON admin_users(user_id);
-- =============================================
-- 005: RLS POLICIES (foundation tables)
-- =============================================
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- Helper: is_admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Helper: is_super_admin
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id = auth.uid()
            AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- VENUES POLICIES
DROP POLICY IF EXISTS "Venues are viewable by everyone" ON venues;
CREATE POLICY "Venues are viewable by everyone" ON venues FOR
SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can view all venues" ON venues;
CREATE POLICY "Admins can view all venues" ON venues FOR
SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins can insert venues" ON venues;
CREATE POLICY "Admins can insert venues" ON venues FOR
INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Admins can update venues" ON venues;
CREATE POLICY "Admins can update venues" ON venues FOR
UPDATE USING (is_admin());
DROP POLICY IF EXISTS "Owners can update their venues" ON venues;
CREATE POLICY "Owners can update their venues" ON venues FOR
UPDATE USING (claimed_by = auth.uid());
DROP POLICY IF EXISTS "Admins can delete venues" ON venues;
CREATE POLICY "Admins can delete venues" ON venues FOR DELETE USING (is_admin());
-- CLAIMS POLICIES
DROP POLICY IF EXISTS "Users can view own claims" ON claims;
CREATE POLICY "Users can view own claims" ON claims FOR
SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins can view all claims" ON claims;
CREATE POLICY "Admins can view all claims" ON claims FOR
SELECT USING (is_admin());
DROP POLICY IF EXISTS "Users can create claims" ON claims;
CREATE POLICY "Users can create claims" ON claims FOR
INSERT WITH CHECK (
        auth.uid() IS NOT NULL
        AND user_id = auth.uid()
    );
DROP POLICY IF EXISTS "Admins can update claims" ON claims;
CREATE POLICY "Admins can update claims" ON claims FOR
UPDATE USING (is_admin());
-- LEADS POLICIES
DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
CREATE POLICY "Anyone can create leads" ON leads FOR
INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Venue owners can view their leads" ON leads;
CREATE POLICY "Venue owners can view their leads" ON leads FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM venues
            WHERE venues.id = leads.venue_id
                AND venues.claimed_by = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;
CREATE POLICY "Admins can view all leads" ON leads FOR
SELECT USING (is_admin());
DROP POLICY IF EXISTS "Admins can update leads" ON leads;
CREATE POLICY "Admins can update leads" ON leads FOR
UPDATE USING (is_admin());
DROP POLICY IF EXISTS "Venue owners can update their leads" ON leads;
CREATE POLICY "Venue owners can update their leads" ON leads FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM venues
            WHERE venues.id = leads.venue_id
                AND venues.claimed_by = auth.uid()
        )
    );
-- ADMIN_USERS POLICIES
DROP POLICY IF EXISTS "Admins can view admin list" ON admin_users;
CREATE POLICY "Admins can view admin list" ON admin_users FOR
SELECT USING (is_admin());
DROP POLICY IF EXISTS "Super admins can insert admins" ON admin_users;
CREATE POLICY "Super admins can insert admins" ON admin_users FOR
INSERT WITH CHECK (is_super_admin());
DROP POLICY IF EXISTS "Super admins can update admins" ON admin_users;
CREATE POLICY "Super admins can update admins" ON admin_users FOR
UPDATE USING (is_super_admin());
DROP POLICY IF EXISTS "Super admins can delete admins" ON admin_users;
CREATE POLICY "Super admins can delete admins" ON admin_users FOR DELETE USING (is_super_admin());
-- =============================================
-- 006: TABLES (pool tables at venues)
-- =============================================
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(50) NOT NULL,
    table_type VARCHAR(30),
    brand VARCHAR(50),
    cloth_color VARCHAR(30) DEFAULT 'green',
    hourly_rate DECIMAL(10, 2),
    peak_hourly_rate DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    position_order INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tables_venue_id ON tables(venue_id);
CREATE INDEX idx_tables_available ON tables(venue_id, is_available, is_active);
CREATE TRIGGER update_tables_updated_at BEFORE
UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tables are viewable by everyone" ON tables FOR
SELECT USING (is_active = true);
CREATE POLICY "Venue owners can manage tables" ON tables FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM venues v
        WHERE v.id = tables.venue_id
            AND v.claimed_by = auth.uid()
    )
);
CREATE POLICY "Admins can manage all tables" ON tables FOR ALL USING (is_admin());
-- =============================================
-- 007: VENUE HOURS
-- =============================================
CREATE TABLE IF NOT EXISTS venue_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    day_of_week INT NOT NULL CHECK (
        day_of_week >= 0
        AND day_of_week <= 6
    ),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    notes VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(venue_id, day_of_week)
);
CREATE INDEX idx_venue_hours_venue_id ON venue_hours(venue_id);
CREATE TRIGGER update_venue_hours_updated_at BEFORE
UPDATE ON venue_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE venue_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Venue hours are viewable by everyone" ON venue_hours FOR
SELECT USING (true);
CREATE POLICY "Venue owners can manage hours" ON venue_hours FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM venues v
        WHERE v.id = venue_hours.venue_id
            AND v.claimed_by = auth.uid()
    )
);
CREATE POLICY "Admins can manage all venue hours" ON venue_hours FOR ALL USING (is_admin());
-- =============================================
-- 008: RESERVATIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id UUID REFERENCES tables(id) ON DELETE
    SET NULL,
        venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
        user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL NOT NULL,
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
        preferred_table_type VARCHAR(30),
        any_table_ok BOOLEAN DEFAULT true,
        status VARCHAR(20) DEFAULT 'confirmed' CHECK (
            status IN (
                'pending',
                'confirmed',
                'cancelled',
                'completed',
                'no_show'
            )
        ),
        guest_name VARCHAR(100),
        guest_phone VARCHAR(20),
        guest_email VARCHAR(255),
        special_requests TEXT,
        internal_notes TEXT,
        estimated_price DECIMAL(10, 2),
        final_price DECIMAL(10, 2),
        deposit_amount DECIMAL(10, 2),
        is_paid BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_at TIMESTAMPTZ,
        cancelled_at TIMESTAMPTZ,
        checked_in_at TIMESTAMPTZ,
        checked_out_at TIMESTAMPTZ,
        CONSTRAINT valid_time_range CHECK (end_time > start_time),
        CONSTRAINT max_duration CHECK (end_time - start_time <= interval '8 hours')
);
CREATE INDEX idx_reservations_no_overlap ON reservations(table_id, start_time, end_time)
WHERE table_id IS NOT NULL
    AND status NOT IN ('cancelled', 'no_show');
CREATE INDEX idx_reservations_venue_id ON reservations(venue_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_start_time ON reservations(start_time);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_venue_date ON reservations(venue_id, start_time)
WHERE status NOT IN ('cancelled', 'no_show');
CREATE TRIGGER update_reservations_updated_at BEFORE
UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reservations" ON reservations FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON reservations FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can modify own reservations" ON reservations FOR
UPDATE USING (
        auth.uid() = user_id
        AND status IN ('pending', 'confirmed')
    );
CREATE POLICY "Venue owners can manage reservations" ON reservations FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM venues v
        WHERE v.id = reservations.venue_id
            AND v.claimed_by = auth.uid()
    )
);
CREATE POLICY "Admins can manage all reservations" ON reservations FOR ALL USING (is_admin());
-- =============================================
-- 009: LEAGUES
-- =============================================
CREATE TABLE IF NOT EXISTS leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL NOT NULL,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        logo_url TEXT,
        game_type VARCHAR(30) NOT NULL DEFAULT '8-ball',
        format VARCHAR(30) DEFAULT 'team',
        skill_level VARCHAR(30),
        season_name VARCHAR(50),
        season_number INT DEFAULT 1,
        season_start DATE,
        season_end DATE,
        registration_deadline DATE,
        home_venue_id UUID REFERENCES venues(id) ON DELETE
    SET NULL,
        max_teams INT DEFAULT 12,
        min_players_per_team INT DEFAULT 4,
        max_players_per_team INT DEFAULT 8,
        matches_per_week INT DEFAULT 1,
        weeks_in_season INT DEFAULT 12,
        rules TEXT,
        handicap_system VARCHAR(50),
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
        team_fee DECIMAL(10, 2),
        player_fee DECIMAL(10, 2),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_leagues_manager ON leagues(manager_id);
CREATE INDEX idx_leagues_status ON leagues(status);
CREATE INDEX idx_leagues_venue ON leagues(home_venue_id);
CREATE INDEX idx_leagues_slug ON leagues(slug);
CREATE TRIGGER update_leagues_updated_at BEFORE
UPDATE ON leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public leagues are viewable" ON leagues FOR
SELECT USING (
        is_public = true
        OR manager_id = auth.uid()
    );
CREATE POLICY "Users can create leagues" ON leagues FOR
INSERT WITH CHECK (auth.uid() = manager_id);
CREATE POLICY "Managers can update leagues" ON leagues FOR
UPDATE USING (manager_id = auth.uid());
CREATE POLICY "Managers can delete leagues" ON leagues FOR DELETE USING (manager_id = auth.uid());
CREATE POLICY "Admins can manage all leagues" ON leagues FOR ALL USING (is_admin());
-- =============================================
-- 010: TEAMS
-- =============================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    captain_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL NOT NULL,
        name VARCHAR(100) NOT NULL,
        logo_url TEXT,
        description TEXT,
        home_venue_id UUID REFERENCES venues(id) ON DELETE
    SET NULL,
        is_active BOOLEAN DEFAULT true,
        division VARCHAR(50),
        seed INT,
        wins INT DEFAULT 0,
        losses INT DEFAULT 0,
        ties INT DEFAULT 0,
        points INT DEFAULT 0,
        games_played INT DEFAULT 0,
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(league_id, name)
);
CREATE INDEX idx_teams_league ON teams(league_id);
CREATE INDEX idx_teams_captain ON teams(captain_id);
CREATE INDEX idx_teams_venue ON teams(home_venue_id);
CREATE TRIGGER update_teams_updated_at BEFORE
UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Captains can delete teams during registration" ON teams FOR DELETE USING (
    captain_id = auth.uid()
    AND EXISTS (
        SELECT 1
        FROM leagues l
        WHERE l.id = teams.league_id
            AND l.status IN ('draft', 'registration')
    )
);
CREATE POLICY "Admins can manage all teams" ON teams FOR ALL USING (is_admin());
-- =============================================
-- 011: TEAM MEMBERS
-- =============================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) DEFAULT 'player' CHECK (
        role IN (
            'captain',
            'co-captain',
            'player',
            'sub',
            'inactive'
        )
    ),
    display_name VARCHAR(100),
    jersey_number VARCHAR(10),
    skill_level INT,
    handicap DECIMAL(4, 2),
    matches_played INT DEFAULT 0,
    matches_won INT DEFAULT 0,
    games_played INT DEFAULT 0,
    games_won INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, player_id)
);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_player ON team_members(player_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE TRIGGER update_team_members_updated_at BEFORE
UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Captains can remove members" ON team_members FOR DELETE USING (
    player_id = auth.uid()
    OR EXISTS (
        SELECT 1
        FROM teams t
        WHERE t.id = team_members.team_id
            AND t.captain_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage all team members" ON team_members FOR ALL USING (is_admin());
-- =============================================
-- 012: MATCHES
-- =============================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
    home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMPTZ,
    venue_id UUID REFERENCES venues(id) ON DELETE
    SET NULL,
        week_number INT,
        round VARCHAR(30),
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
        home_score INT,
        away_score INT,
        winner_team_id UUID REFERENCES teams(id),
        is_tie BOOLEAN DEFAULT false,
        home_points INT,
        away_points INT,
        reservation_id UUID REFERENCES reservations(id) ON DELETE
    SET NULL,
        notes TEXT,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);
CREATE INDEX idx_matches_league ON matches(league_id);
CREATE INDEX idx_matches_home_team ON matches(home_team_id);
CREATE INDEX idx_matches_away_team ON matches(away_team_id);
CREATE INDEX idx_matches_scheduled ON matches(scheduled_at);
CREATE INDEX idx_matches_week ON matches(league_id, week_number);
CREATE INDEX idx_matches_status ON matches(status);
CREATE TRIGGER update_matches_updated_at BEFORE
UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
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
CREATE POLICY "Managers can create matches" ON matches FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM leagues l
            WHERE l.id = matches.league_id
                AND l.manager_id = auth.uid()
        )
    );
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
CREATE POLICY "Managers can delete matches" ON matches FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM leagues l
        WHERE l.id = matches.league_id
            AND l.manager_id = auth.uid()
    )
);
CREATE POLICY "Admins can manage all matches" ON matches FOR ALL USING (is_admin());
-- =============================================
-- 013: REVIEWS
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
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
    title VARCHAR(200),
    content TEXT,
    is_verified BOOLEAN DEFAULT false,
    reservation_id UUID REFERENCES reservations(id) ON DELETE
    SET NULL,
        visit_date DATE,
        photos TEXT [],
        helpful_count INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'published' CHECK (
            status IN ('pending', 'published', 'flagged', 'hidden')
        ),
        owner_response TEXT,
        owner_response_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(venue_id, user_id)
);
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(review_id, user_id)
);
CREATE INDEX idx_reviews_venue ON reviews(venue_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
CREATE TRIGGER update_reviews_updated_at BEFORE
UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published reviews are viewable" ON reviews FOR
SELECT USING (
        status = 'published'
        OR user_id = auth.uid()
    );
CREATE POLICY "Users can create reviews" ON reviews FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Venue owners can respond" ON reviews FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM venues v
            WHERE v.id = reviews.venue_id
                AND v.owner_id = auth.uid()
        )
    );
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view votes" ON review_votes FOR
SELECT USING (true);
CREATE POLICY "Users can vote" ON review_votes FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change their vote" ON review_votes FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can remove their vote" ON review_votes FOR DELETE USING (user_id = auth.uid());
-- =============================================
-- 014: PLAYER PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS player_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    country VARCHAR(50) DEFAULT 'USA',
    primary_game VARCHAR(30),
    skill_level VARCHAR(30),
    apa_skill_level INT CHECK (
        apa_skill_level >= 1
        AND apa_skill_level <= 9
    ),
    years_playing INT,
    preferred_table_size VARCHAR(20),
    instagram VARCHAR(100),
    twitter VARCHAR(100),
    youtube VARCHAR(255),
    total_matches INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_reservations INT DEFAULT 0,
    total_reviews INT DEFAULT 0,
    venues_visited INT DEFAULT 0,
    badges TEXT [],
    looking_for_games BOOLEAN DEFAULT false,
    looking_for_team BOOLEAN DEFAULT false,
    looking_for_league BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    show_stats BOOLEAN DEFAULT true,
    show_activity BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS favorite_venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, venue_id)
);
CREATE TABLE IF NOT EXISTS badges (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon TEXT,
    category VARCHAR(50),
    requirement TEXT,
    points INT DEFAULT 0
);
CREATE INDEX idx_player_profiles_user ON player_profiles(user_id);
CREATE INDEX idx_player_profiles_city ON player_profiles(city, state);
CREATE INDEX idx_player_profiles_game ON player_profiles(primary_game);
CREATE INDEX idx_player_profiles_looking ON player_profiles(
    looking_for_games,
    looking_for_team,
    looking_for_league
);
CREATE TRIGGER update_player_profiles_updated_at BEFORE
UPDATE ON player_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable" ON player_profiles FOR
SELECT USING (
        is_public = true
        OR user_id = auth.uid()
    );
CREATE POLICY "Users can create profile" ON player_profiles FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON player_profiles FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can view own favorites" ON favorite_venues FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can add favorites" ON favorite_venues FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON favorite_venues FOR DELETE USING (user_id = auth.uid());
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
        'First Timer',
        'Made your first table reservation',
        '🎱',
        'beginner',
        'Make your first reservation',
        10
    ),
    (
        'five_reservations',
        'Regular',
        'Made 5 reservations',
        '📅',
        'beginner',
        'Make 5 reservations',
        25
    ),
    (
        'first_review',
        'Critic',
        'Left your first venue review',
        '⭐',
        'social',
        'Write your first review',
        10
    ),
    (
        'first_league',
        'Team Player',
        'Joined your first league',
        '🏆',
        'league',
        'Join a league',
        25
    ),
    (
        'five_venues',
        'Explorer',
        'Visited 5 different venues',
        '🗺️',
        'venue',
        'Visit 5 venues',
        50
    ),
    (
        'ten_wins',
        'Hot Streak',
        'Won 10 matches',
        '🔥',
        'league',
        'Win 10 matches',
        50
    ),
    (
        'top_reviewer',
        'Top Reviewer',
        'Left 10 or more reviews',
        '📝',
        'social',
        'Write 10 reviews',
        100
    ) ON CONFLICT (id) DO NOTHING;
-- =============================================
-- 015: ANALYTICS (venue_promotions + analytics)
-- =============================================
CREATE TABLE IF NOT EXISTS venue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    page_views INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    reservation_clicks INT DEFAULT 0,
    reservations_made INT DEFAULT 0,
    phone_clicks INT DEFAULT 0,
    direction_clicks INT DEFAULT 0,
    website_clicks INT DEFAULT 0,
    search_impressions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(venue_id, date)
);
CREATE TABLE IF NOT EXISTS venue_promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(30) DEFAULT 'general' CHECK (
        promotion_type IN (
            'general',
            'happy_hour',
            'tournament',
            'league_night',
            'special_event',
            'discount'
        )
    ),
    start_date DATE,
    end_date DATE,
    days_of_week INT [],
    start_time TIME,
    end_time TIME,
    discount_percent INT,
    discount_amount DECIMAL(10, 2),
    promo_code VARCHAR(50),
    terms TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    views INT DEFAULT 0,
    clicks INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_venue_analytics_venue ON venue_analytics(venue_id);
CREATE INDEX idx_venue_analytics_date ON venue_analytics(date);
CREATE INDEX idx_venue_promotions_venue ON venue_promotions(venue_id);
CREATE INDEX idx_venue_promotions_active ON venue_promotions(is_active, start_date, end_date);
CREATE TRIGGER update_venue_promotions_updated_at BEFORE
UPDATE ON venue_promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE venue_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Venue owners can view analytics" ON venue_analytics FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM venues v
            WHERE v.id = venue_analytics.venue_id
                AND v.claimed_by = auth.uid()
        )
    );
CREATE POLICY "Admins can view all analytics" ON venue_analytics FOR
SELECT USING (is_admin());
CREATE POLICY "System can insert analytics" ON venue_analytics FOR
INSERT WITH CHECK (true);
CREATE POLICY "Active promotions are viewable" ON venue_promotions FOR
SELECT USING (is_active = true);
CREATE POLICY "Venue owners can manage promotions" ON venue_promotions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM venues v
        WHERE v.id = venue_promotions.venue_id
            AND v.claimed_by = auth.uid()
    )
);
CREATE POLICY "Admins can manage all promotions" ON venue_promotions FOR ALL USING (is_admin());
-- =============================================
-- 016: NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    reservation_reminders BOOLEAN DEFAULT true,
    league_updates BOOLEAN DEFAULT true,
    match_results BOOLEAN DEFAULT true,
    venue_promotions BOOLEAN DEFAULT true,
    friend_activity BOOLEAN DEFAULT true,
    marketing BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read)
WHERE is_read = false;
CREATE TRIGGER update_notification_preferences_updated_at BEFORE
UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR
INSERT WITH CHECK (true);
CREATE POLICY "Users can view own prefs" ON notification_preferences FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own prefs" ON notification_preferences FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can create own prefs" ON notification_preferences FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- =============================================
-- 017: VENUE CLAIMS (v2 - detailed)
-- =============================================
CREATE TABLE IF NOT EXISTS venue_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'rejected', 'revoked')
    ),
    business_name VARCHAR(200),
    business_role VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    proof_documents TEXT [],
    admin_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_venue_claims_venue ON venue_claims(venue_id);
CREATE INDEX idx_venue_claims_user ON venue_claims(user_id);
CREATE INDEX idx_venue_claims_status ON venue_claims(status);
CREATE TRIGGER update_venue_claims_updated_at BEFORE
UPDATE ON venue_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE venue_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own claims" ON venue_claims FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create claims" ON venue_claims FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all claims" ON venue_claims FOR
SELECT USING (is_admin());
CREATE POLICY "Admins can update claims" ON venue_claims FOR
UPDATE USING (is_admin());
-- =============================================
-- 019: GEOLOCATION FUNCTION
-- =============================================
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
GRANT EXECUTE ON FUNCTION get_venues_within_radius TO authenticated,
    anon;
-- =============================================
-- 021: STORAGE BUCKETS
-- =============================================
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'images',
        'images',
        true,
        5242880,
        ARRAY ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'venues',
        'venues',
        true,
        10485760,
        ARRAY ['image/jpeg', 'image/png', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'avatars',
        'avatars',
        true,
        2097152,
        ARRAY ['image/jpeg', 'image/png', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
    )
VALUES (
        'reviews',
        'reviews',
        true,
        5242880,
        ARRAY ['image/jpeg', 'image/png', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
-- Storage RLS
CREATE POLICY "Public images are viewable by everyone" ON storage.objects FOR
SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'images'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Users can update own images" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'images'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
CREATE POLICY "Public venue images are viewable" ON storage.objects FOR
SELECT USING (bucket_id = 'venues');
CREATE POLICY "Venue owners can upload venue images" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'venues'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Venue owners can update venue images" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'venues'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Venue owners can delete venue images" ON storage.objects FOR DELETE USING (
    bucket_id = 'venues'
    AND auth.role() = 'authenticated'
);
CREATE POLICY "Public avatars are viewable" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their avatar" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'avatars'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Users can update their avatar" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can delete their avatar" ON storage.objects FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
CREATE POLICY "Public review images are viewable" ON storage.objects FOR
SELECT USING (bucket_id = 'reviews');
CREATE POLICY "Authenticated users can upload review images" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'reviews'
        AND auth.role() = 'authenticated'
    );
CREATE POLICY "Users can update own review images" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'reviews'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
CREATE POLICY "Users can delete own review images" ON storage.objects FOR DELETE USING (
    bucket_id = 'reviews'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- =============================================
-- DONE! All tables created successfully.
-- =============================================