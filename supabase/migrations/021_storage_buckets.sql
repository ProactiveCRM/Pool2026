-- Migration: 021_storage_buckets.sql
-- Create Supabase Storage buckets for image uploads
-- Create the images bucket for general uploads
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
        -- 5MB
        ARRAY ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
-- Create venues bucket for venue photos
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
        -- 10MB
        ARRAY ['image/jpeg', 'image/png', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
-- Create avatars bucket for user profile photos
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
        -- 2MB
        ARRAY ['image/jpeg', 'image/png', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
-- Create reviews bucket for review photos
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
        -- 5MB
        ARRAY ['image/jpeg', 'image/png', 'image/webp']
    ) ON CONFLICT (id) DO NOTHING;
-- RLS Policies for images bucket
-- Anyone can view public images
CREATE POLICY "Public images are viewable by everyone" ON storage.objects FOR
SELECT USING (bucket_id = 'images');
-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR
INSERT WITH CHECK (
        bucket_id = 'images'
        AND auth.role() = 'authenticated'
    );
-- Users can update their own uploads
CREATE POLICY "Users can update own images" ON storage.objects FOR
UPDATE USING (
        bucket_id = 'images'
        AND auth.uid()::text = (storage.foldername(name)) [1]
    );
-- Users can delete their own uploads
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (
    bucket_id = 'images'
    AND auth.uid()::text = (storage.foldername(name)) [1]
);
-- RLS Policies for venues bucket
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
-- RLS Policies for avatars bucket
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
-- RLS Policies for reviews bucket
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
COMMENT ON TABLE storage.buckets IS 'Storage buckets for PoolFinder image uploads';