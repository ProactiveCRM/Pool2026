-- Migration: 017_venue_claims.sql
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
COMMENT ON FUNCTION approve_venue_claim IS 'Approve a venue claim and transfer ownership';