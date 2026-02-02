-- GHL Integration Fields Migration
-- Add GHL-related columns to support contact sync and payments
-- Add GHL contact ID to profiles (if not exists)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
        AND column_name = 'ghl_contact_id'
) THEN
ALTER TABLE public.profiles
ADD COLUMN ghl_contact_id TEXT;
END IF;
END $$;
-- Add subscription fields to venues
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'venues'
        AND column_name = 'subscription_tier'
) THEN
ALTER TABLE public.venues
ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (
        subscription_tier IN ('free', 'pro', 'enterprise')
    );
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'venues'
        AND column_name = 'subscription_started_at'
) THEN
ALTER TABLE public.venues
ADD COLUMN subscription_started_at TIMESTAMP WITH TIME ZONE;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'venues'
        AND column_name = 'ghl_invoice_id'
) THEN
ALTER TABLE public.venues
ADD COLUMN ghl_invoice_id TEXT;
END IF;
END $$;
-- Add GHL opportunity ID to claims (for pipeline tracking)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'claims'
        AND column_name = 'ghl_opportunity_id'
) THEN
ALTER TABLE public.claims
ADD COLUMN ghl_opportunity_id TEXT;
END IF;
END $$;
-- Add payment fields to team_members (for league fees)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'payment_status'
) THEN
ALTER TABLE public.team_members
ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (
        payment_status IN ('pending', 'paid', 'waived', 'refunded')
    );
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'payment_amount'
) THEN
ALTER TABLE public.team_members
ADD COLUMN payment_amount DECIMAL(10, 2);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'paid_at'
) THEN
ALTER TABLE public.team_members
ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'team_members'
        AND column_name = 'ghl_invoice_id'
) THEN
ALTER TABLE public.team_members
ADD COLUMN ghl_invoice_id TEXT;
END IF;
END $$;
-- Create indexes for GHL lookups
CREATE INDEX IF NOT EXISTS idx_profiles_ghl_contact ON public.profiles(ghl_contact_id)
WHERE ghl_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_venues_ghl_contact ON public.venues(ghl_contact_id)
WHERE ghl_contact_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_claims_ghl_opportunity ON public.claims(ghl_opportunity_id)
WHERE ghl_opportunity_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_venues_subscription ON public.venues(subscription_tier);
-- Function to check if venue has pro subscription
CREATE OR REPLACE FUNCTION public.is_venue_pro(venue_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM public.venues
        WHERE id = venue_id
            AND subscription_tier = 'pro'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.is_venue_pro TO authenticated,
    anon;