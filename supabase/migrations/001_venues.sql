-- Migration: 001_venues
-- Creates the venues table with indexes for search and filtering
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
    -- Quality/Enrichment (for Abacus.AI integration)
    quality_score INTEGER,
    enrichment_data JSONB,
    enriched_at TIMESTAMPTZ,
    -- External IDs (idempotency for integrations)
    ghl_contact_id TEXT,
    abacus_entity_id TEXT,
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes for filtering and search
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_state ON venues(state);
CREATE INDEX IF NOT EXISTS idx_venues_is_active ON venues(is_active);
CREATE INDEX IF NOT EXISTS idx_venues_is_claimed ON venues(is_claimed);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);
-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_venues_search ON venues USING GIN(
    to_tsvector(
        'english',
        coalesce(name, '') || ' ' || coalesce(city, '') || ' ' || coalesce(state, '')
    )
);
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS venues_updated_at ON venues;
CREATE TRIGGER venues_updated_at BEFORE
UPDATE ON venues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_venue_slug() RETURNS TRIGGER AS $$
DECLARE base_slug TEXT;
new_slug TEXT;
counter INTEGER := 0;
BEGIN -- Generate base slug from name
base_slug := lower(
    regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g')
);
base_slug := trim(
    both '-'
    from base_slug
);
new_slug := base_slug;
-- Check for uniqueness and append counter if needed
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