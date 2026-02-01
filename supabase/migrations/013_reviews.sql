-- Migration: 013_reviews.sql
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
COMMENT ON TABLE review_votes IS 'Helpful votes on reviews';