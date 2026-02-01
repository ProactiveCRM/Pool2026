-- Migration: 002_claims
-- Creates the claims table for venue ownership claims
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    -- Claimant info
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT,
    business_role TEXT NOT NULL CHECK (
        business_role IN ('owner', 'manager', 'employee')
    ),
    -- Proof of ownership
    proof_type TEXT NOT NULL CHECK (
        proof_type IN (
            'ownership_doc',
            'utility_bill',
            'business_card',
            'other'
        )
    ),
    proof_url TEXT NOT NULL,
    -- Review status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    -- External IDs (for GHL integration)
    ghl_opportunity_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Indexes
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_venue ON claims(venue_id);
CREATE INDEX IF NOT EXISTS idx_claims_user ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_created ON claims(created_at DESC);
-- Partial unique index: only one pending claim per venue per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_claims_pending_unique ON claims(venue_id, user_id)
WHERE status = 'pending';
-- Function to update venue when claim is approved
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