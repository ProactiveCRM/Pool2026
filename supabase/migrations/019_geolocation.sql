-- Geolocation Fields Migration
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