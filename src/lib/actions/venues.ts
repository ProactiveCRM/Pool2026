'use server';

import { createClient } from '@/lib/supabase/server';
import { venueSearchSchema, type VenueSearchInput } from '@/lib/validations/venue';
import type { Venue, PaginatedResult } from '@/lib/types';

export async function getVenues(
    input: VenueSearchInput
): Promise<PaginatedResult<Venue>> {
    const validated = venueSearchSchema.parse(input);
    const { query, state, tableTypes, amenities, page, limit } = validated;

    const supabase = await createClient();

    let queryBuilder = supabase
        .from('venues')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('is_claimed', { ascending: false })
        .order('name', { ascending: true });

    // Full-text search on name and city
    if (query) {
        queryBuilder = queryBuilder.or(
            `name.ilike.%${query}%,city.ilike.%${query}%`
        );
    }

    // Filter by state
    if (state && state !== 'all') {
        queryBuilder = queryBuilder.eq('state', state);
    }

    // Filter by table types (overlaps with array)
    if (tableTypes && tableTypes.length > 0) {
        queryBuilder = queryBuilder.overlaps('table_types', tableTypes);
    }

    // Filter by amenities (overlaps with array)
    if (amenities && amenities.length > 0) {
        queryBuilder = queryBuilder.overlaps('amenities', amenities);
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, count, error } = await queryBuilder;

    if (error) {
        console.error('Error fetching venues:', error);
        throw new Error('Failed to fetch venues');
    }

    const total = count ?? 0;

    return {
        data: (data as Venue[]) ?? [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No rows returned
            return null;
        }
        console.error('Error fetching venue:', error);
        throw new Error('Failed to fetch venue');
    }

    return data as Venue;
}

export async function getVenueById(id: string): Promise<Venue | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching venue:', error);
        throw new Error('Failed to fetch venue');
    }

    return data as Venue;
}

export async function getFeaturedVenues(limit: number = 4): Promise<Venue[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .eq('is_claimed', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching featured venues:', error);
        return [];
    }

    return (data as Venue[]) ?? [];
}
