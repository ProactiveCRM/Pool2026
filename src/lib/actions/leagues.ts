'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
    League,
    Team,
    Match,
    CreateLeagueFormData,
    CreateTeamFormData,
    SubmitScoreFormData,
} from '@/types/leagues';

// Generate URL-friendly slug
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Math.random().toString(36).substring(2, 8);
}

// ============ LEAGUES ============

export async function getPublicLeagues(): Promise<League[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('leagues')
        .select(`
      *,
      home_venue:venues(id, name, city, state)
    `)
        .eq('is_public', true)
        .in('status', ['registration', 'active', 'playoffs'])
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching leagues:', error);
        return [];
    }

    return data || [];
}

export async function getLeagueBySlug(slug: string): Promise<League | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('leagues')
        .select(`
      *,
      home_venue:venues(id, name, city, state)
    `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error fetching league:', error);
        return null;
    }

    return data;
}

export async function getMyLeagues(): Promise<League[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('leagues')
        .select(`
      *,
      home_venue:venues(id, name, city, state)
    `)
        .eq('manager_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching my leagues:', error);
        return [];
    }

    return data || [];
}

export async function createLeague(formData: CreateLeagueFormData): Promise<{
    success: boolean;
    league?: League;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in to create a league' };
    }

    const slug = generateSlug(formData.name);

    const { data, error } = await supabase
        .from('leagues')
        .insert({
            manager_id: user.id,
            name: formData.name,
            slug,
            description: formData.description || null,
            game_type: formData.game_type,
            format: formData.format,
            skill_level: formData.skill_level || null,
            season_name: formData.season_name || null,
            season_start: formData.season_start || null,
            season_end: formData.season_end || null,
            home_venue_id: formData.home_venue_id || null,
            max_teams: formData.max_teams || 12,
            team_fee: formData.team_fee || null,
            player_fee: formData.player_fee || null,
            rules: formData.rules || null,
            status: 'draft',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating league:', error);
        return { success: false, error: 'Failed to create league' };
    }

    revalidatePath('/leagues');
    revalidatePath('/leagues/manage');
    return { success: true, league: data };
}

export async function updateLeagueStatus(
    leagueId: string,
    status: League['status']
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('leagues')
        .update({ status })
        .eq('id', leagueId);

    if (error) {
        console.error('Error updating league status:', error);
        return { success: false, error: 'Failed to update status' };
    }

    revalidatePath('/leagues');
    return { success: true };
}

// ============ TEAMS ============

export async function getLeagueTeams(leagueId: string): Promise<Team[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('teams')
        .select(`
      *,
      home_venue:venues(id, name)
    `)
        .eq('league_id', leagueId)
        .eq('is_active', true)
        .order('points', { ascending: false });

    if (error) {
        console.error('Error fetching teams:', error);
        return [];
    }

    return data || [];
}

export async function getMyTeams(): Promise<Team[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Get teams where user is captain or member
    const { data, error } = await supabase
        .from('teams')
        .select(`
      *,
      league:leagues(id, name, slug, status, game_type),
      home_venue:venues(id, name)
    `)
        .or(`captain_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching my teams:', error);
        return [];
    }

    return data || [];
}

export async function createTeam(formData: CreateTeamFormData): Promise<{
    success: boolean;
    team?: Team;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in to create a team' };
    }

    // Create team
    const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
            league_id: formData.league_id,
            captain_id: user.id,
            name: formData.name,
            description: formData.description || null,
            home_venue_id: formData.home_venue_id || null,
        })
        .select()
        .single();

    if (teamError) {
        console.error('Error creating team:', teamError);
        return { success: false, error: 'Failed to create team' };
    }

    // Add captain as team member
    await supabase
        .from('team_members')
        .insert({
            team_id: team.id,
            player_id: user.id,
            role: 'captain',
        });

    revalidatePath(`/leagues`);
    return { success: true, team };
}

export async function joinTeam(teamId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'You must be logged in to join a team' };
    }

    const { error } = await supabase
        .from('team_members')
        .insert({
            team_id: teamId,
            player_id: user.id,
            role: 'player',
        });

    if (error) {
        if (error.code === '23505') {
            return { success: false, error: 'You are already on this team' };
        }
        console.error('Error joining team:', error);
        return { success: false, error: 'Failed to join team' };
    }

    revalidatePath('/leagues');
    revalidatePath('/my-teams');
    return { success: true };
}

// ============ MATCHES ============

export async function getLeagueMatches(leagueId: string, weekNumber?: number): Promise<Match[]> {
    const supabase = await createClient();

    let query = supabase
        .from('matches')
        .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name, wins, losses),
      away_team:teams!matches_away_team_id_fkey(id, name, wins, losses),
      venue:venues(id, name, city, state)
    `)
        .eq('league_id', leagueId)
        .order('scheduled_at', { ascending: true });

    if (weekNumber !== undefined) {
        query = query.eq('week_number', weekNumber);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching matches:', error);
        return [];
    }

    return data || [];
}

export async function getTeamMatches(teamId: string): Promise<Match[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(id, name),
      away_team:teams!matches_away_team_id_fkey(id, name),
      venue:venues(id, name, city, state)
    `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('scheduled_at', { ascending: true });

    if (error) {
        console.error('Error fetching team matches:', error);
        return [];
    }

    return data || [];
}

export async function submitMatchScore(formData: SubmitScoreFormData): Promise<{
    success: boolean;
    error?: string;
}> {
    const supabase = await createClient();

    // Determine winner
    let winnerId: string | null = null;
    let isTie = false;

    // Get match to find team IDs
    const { data: match } = await supabase
        .from('matches')
        .select('home_team_id, away_team_id')
        .eq('id', formData.match_id)
        .single();

    if (!match) {
        return { success: false, error: 'Match not found' };
    }

    if (formData.home_score > formData.away_score) {
        winnerId = match.home_team_id;
    } else if (formData.away_score > formData.home_score) {
        winnerId = match.away_team_id;
    } else {
        isTie = true;
    }

    const { error } = await supabase
        .from('matches')
        .update({
            home_score: formData.home_score,
            away_score: formData.away_score,
            winner_team_id: winnerId,
            is_tie: isTie,
            status: 'completed',
            completed_at: new Date().toISOString(),
        })
        .eq('id', formData.match_id);

    if (error) {
        console.error('Error submitting score:', error);
        return { success: false, error: 'Failed to submit score' };
    }

    // Update team stats
    if (winnerId) {
        // Winner gets a win
        await supabase.rpc('increment_team_wins', { team_id: winnerId });
        // Loser gets a loss
        const loserId = winnerId === match.home_team_id ? match.away_team_id : match.home_team_id;
        await supabase.rpc('increment_team_losses', { team_id: loserId });
    } else {
        // Both teams get a tie
        await supabase.rpc('increment_team_ties', { team_id: match.home_team_id });
        await supabase.rpc('increment_team_ties', { team_id: match.away_team_id });
    }

    revalidatePath('/leagues');
    return { success: true };
}

// ============ STANDINGS ============

export async function getLeagueStandings(leagueId: string): Promise<Team[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId)
        .eq('is_active', true)
        .order('points', { ascending: false })
        .order('wins', { ascending: false });

    if (error) {
        console.error('Error fetching standings:', error);
        return [];
    }

    return data || [];
}
