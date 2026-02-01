// Types for the leagues and teams system

export type GameType = '8-ball' | '9-ball' | '10-ball' | 'one-pocket' | 'straight-pool' | 'snooker';
export type LeagueFormat = 'singles' | 'doubles' | 'scotch-doubles' | 'team';
export type SkillLevel = 'open' | 'amateur' | 'intermediate' | 'advanced' | 'pro';
export type LeagueStatus = 'draft' | 'registration' | 'active' | 'playoffs' | 'completed' | 'cancelled';
export type TeamRole = 'captain' | 'co-captain' | 'player' | 'sub' | 'inactive';
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled' | 'forfeit';
export type MatchRound = 'regular' | 'playoff' | 'semifinal' | 'final';

export interface League {
    id: string;
    manager_id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    game_type: GameType;
    format: LeagueFormat;
    skill_level: SkillLevel | null;
    season_name: string | null;
    season_number: number;
    season_start: string | null;
    season_end: string | null;
    registration_deadline: string | null;
    home_venue_id: string | null;
    max_teams: number;
    min_players_per_team: number;
    max_players_per_team: number;
    matches_per_week: number;
    weeks_in_season: number;
    rules: string | null;
    handicap_system: string | null;
    status: LeagueStatus;
    is_public: boolean;
    team_fee: number | null;
    player_fee: number | null;
    contact_email: string | null;
    contact_phone: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    home_venue?: {
        id: string;
        name: string;
        city: string;
        state: string;
    };
    teams_count?: number;
    manager?: {
        email: string;
    };
}

export interface Team {
    id: string;
    league_id: string;
    captain_id: string;
    name: string;
    logo_url: string | null;
    description: string | null;
    home_venue_id: string | null;
    is_active: boolean;
    division: string | null;
    seed: number | null;
    wins: number;
    losses: number;
    ties: number;
    points: number;
    games_played: number;
    contact_email: string | null;
    contact_phone: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    league?: League;
    captain?: {
        email: string;
    };
    members?: TeamMember[];
    members_count?: number;
    home_venue?: {
        id: string;
        name: string;
    };
}

export interface TeamMember {
    id: string;
    team_id: string;
    player_id: string;
    role: TeamRole;
    display_name: string | null;
    jersey_number: string | null;
    skill_level: number | null;
    handicap: number | null;
    matches_played: number;
    matches_won: number;
    games_played: number;
    games_won: number;
    is_active: boolean;
    joined_at: string;
    updated_at: string;
    // Joined data
    player?: {
        email: string;
    };
}

export interface Match {
    id: string;
    league_id: string;
    home_team_id: string;
    away_team_id: string;
    scheduled_at: string | null;
    venue_id: string | null;
    week_number: number | null;
    round: MatchRound | null;
    status: MatchStatus;
    home_score: number | null;
    away_score: number | null;
    winner_team_id: string | null;
    is_tie: boolean;
    home_points: number | null;
    away_points: number | null;
    reservation_id: string | null;
    notes: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    league?: League;
    home_team?: Team;
    away_team?: Team;
    venue?: {
        id: string;
        name: string;
        city: string;
        state: string;
    };
}

// Form types
export interface CreateLeagueFormData {
    name: string;
    description?: string;
    game_type: GameType;
    format: LeagueFormat;
    skill_level?: SkillLevel;
    season_name?: string;
    season_start?: string;
    season_end?: string;
    home_venue_id?: string;
    max_teams?: number;
    team_fee?: number;
    player_fee?: number;
    rules?: string;
}

export interface CreateTeamFormData {
    league_id: string;
    name: string;
    description?: string;
    home_venue_id?: string;
}

export interface SubmitScoreFormData {
    match_id: string;
    home_score: number;
    away_score: number;
}

// Constants
export const GAME_TYPE_LABELS: Record<GameType, string> = {
    '8-ball': '🎱 8-Ball',
    '9-ball': '9-Ball',
    '10-ball': '10-Ball',
    'one-pocket': 'One Pocket',
    'straight-pool': 'Straight Pool (14.1)',
    'snooker': 'Snooker',
};

export const FORMAT_LABELS: Record<LeagueFormat, string> = {
    singles: 'Singles',
    doubles: 'Doubles',
    'scotch-doubles': 'Scotch Doubles',
    team: 'Team',
};

export const STATUS_LABELS: Record<LeagueStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-500' },
    registration: { label: 'Registration Open', color: 'bg-blue-500/20 text-blue-500' },
    active: { label: 'In Progress', color: 'bg-green-500/20 text-green-500' },
    playoffs: { label: 'Playoffs', color: 'bg-yellow-500/20 text-yellow-500' },
    completed: { label: 'Completed', color: 'bg-purple-500/20 text-purple-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-500' },
};

export const MATCH_STATUS_LABELS: Record<MatchStatus, { label: string; color: string }> = {
    scheduled: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-500' },
    in_progress: { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-500' },
    completed: { label: 'Completed', color: 'bg-green-500/20 text-green-500' },
    postponed: { label: 'Postponed', color: 'bg-orange-500/20 text-orange-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-500' },
    forfeit: { label: 'Forfeit', color: 'bg-red-500/20 text-red-500' },
};

export const ROLE_LABELS: Record<TeamRole, string> = {
    captain: '👑 Captain',
    'co-captain': '⭐ Co-Captain',
    player: 'Player',
    sub: 'Substitute',
    inactive: 'Inactive',
};
