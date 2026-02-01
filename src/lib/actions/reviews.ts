'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Review, CreateReviewFormData, VenueRatingStats } from '@/types/reviews';

// Get reviews for a venue
export async function getVenueReviews(venueId: string): Promise<Review[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('venue_id', venueId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    return data || [];
}

// Get rating stats for a venue
export async function getVenueRatingStats(venueId: string): Promise<VenueRatingStats> {
    const supabase = await createClient();

    const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating, rating_tables, rating_atmosphere, rating_service, rating_value')
        .eq('venue_id', venueId)
        .eq('status', 'published');

    if (error || !reviews || reviews.length === 0) {
        return {
            average_rating: 0,
            total_reviews: 0,
            rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            average_tables: null,
            average_atmosphere: null,
            average_service: null,
            average_value: null,
        };
    }

    // Calculate stats
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;
    let tablesSum = 0, tablesCount = 0;
    let atmosphereSum = 0, atmosphereCount = 0;
    let serviceSum = 0, serviceCount = 0;
    let valueSum = 0, valueCount = 0;

    for (const review of reviews) {
        totalRating += review.rating;
        breakdown[review.rating as keyof typeof breakdown]++;

        if (review.rating_tables) { tablesSum += review.rating_tables; tablesCount++; }
        if (review.rating_atmosphere) { atmosphereSum += review.rating_atmosphere; atmosphereCount++; }
        if (review.rating_service) { serviceSum += review.rating_service; serviceCount++; }
        if (review.rating_value) { valueSum += review.rating_value; valueCount++; }
    }

    return {
        average_rating: totalRating / reviews.length,
        total_reviews: reviews.length,
        rating_breakdown: breakdown,
        average_tables: tablesCount > 0 ? tablesSum / tablesCount : null,
        average_atmosphere: atmosphereCount > 0 ? atmosphereSum / atmosphereCount : null,
        average_service: serviceCount > 0 ? serviceSum / serviceCount : null,
        average_value: valueCount > 0 ? valueSum / valueCount : null,
    };
}

// Get user's reviews
export async function getMyReviews(): Promise<Review[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('reviews')
        .select(`
      *,
      venue:venues(id, name, slug, city, state)
    `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching my reviews:', error);
        return [];
    }

    return data || [];
}

// Create a review
export async function createReview(formData: CreateReviewFormData): Promise<{
    success: boolean;
    review?: Review;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in to write a review' };
    }

    // Check if user already reviewed this venue
    const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('venue_id', formData.venue_id)
        .eq('user_id', user.id)
        .single();

    if (existing) {
        return { success: false, error: 'You have already reviewed this venue' };
    }

    // Check if review is verified via reservation
    let isVerified = false;
    if (formData.reservation_id) {
        const { data: reservation } = await supabase
            .from('reservations')
            .select('id')
            .eq('id', formData.reservation_id)
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .single();

        isVerified = !!reservation;
    }

    const { data, error } = await supabase
        .from('reviews')
        .insert({
            venue_id: formData.venue_id,
            user_id: user.id,
            rating: formData.rating,
            rating_tables: formData.rating_tables || null,
            rating_atmosphere: formData.rating_atmosphere || null,
            rating_service: formData.rating_service || null,
            rating_value: formData.rating_value || null,
            title: formData.title || null,
            content: formData.content || null,
            visit_date: formData.visit_date || null,
            photos: formData.photos || null,
            reservation_id: formData.reservation_id || null,
            is_verified: isVerified,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating review:', error);
        return { success: false, error: 'Failed to submit review' };
    }

    revalidatePath(`/venues`);
    return { success: true, review: data };
}

// Vote on a review
export async function voteOnReview(reviewId: string, isHelpful: boolean): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in to vote' };
    }

    // Upsert the vote
    const { error } = await supabase
        .from('review_votes')
        .upsert({
            review_id: reviewId,
            user_id: user.id,
            is_helpful: isHelpful,
        });

    if (error) {
        console.error('Error voting:', error);
        return { success: false, error: 'Failed to record vote' };
    }

    // Update helpful count
    const { count } = await supabase
        .from('review_votes')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', reviewId)
        .eq('is_helpful', true);

    await supabase
        .from('reviews')
        .update({ helpful_count: count || 0 })
        .eq('id', reviewId);

    revalidatePath('/venues');
    return { success: true };
}

// Venue owner response
export async function respondToReview(reviewId: string, response: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in' };
    }

    // Verify user owns the venue
    const { data: review } = await supabase
        .from('reviews')
        .select('venue_id')
        .eq('id', reviewId)
        .single();

    if (!review) {
        return { success: false, error: 'Review not found' };
    }

    const { data: venue } = await supabase
        .from('venues')
        .select('owner_id')
        .eq('id', review.venue_id)
        .single();

    if (!venue || venue.owner_id !== user.id) {
        return { success: false, error: 'You can only respond to reviews for venues you own' };
    }

    const { error } = await supabase
        .from('reviews')
        .update({
            owner_response: response,
            owner_response_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

    if (error) {
        console.error('Error responding to review:', error);
        return { success: false, error: 'Failed to submit response' };
    }

    revalidatePath('/venues');
    return { success: true };
}
