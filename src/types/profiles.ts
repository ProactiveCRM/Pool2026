// Types for player profiles

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type TableSize = '7-foot' | '8-foot' | '9-foot';
export type BadgeCategory = 'beginner' | 'social' | 'league' | 'venue' | 'special';

export interface PlayerProfile {
    id: string;
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    city: string | null;
    state: string | null;
    country: string;
    primary_game: string | null;
    skill_level: SkillLevel | null;
    apa_skill_level: number | null;
    years_playing: number | null;
    preferred_table_size: TableSize | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
    total_matches: number;
    total_wins: number;
    total_reservations: number;
    total_reviews: number;
    venues_visited: number;
    badges: string[] | null;
    looking_for_games: boolean;
    looking_for_team: boolean;
    looking_for_league: boolean;
    is_public: boolean;
    show_stats: boolean;
    show_activity: boolean;
    created_at: string;
    updated_at: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    category: BadgeCategory;
    requirement: string | null;
    points: number;
}

export interface FavoriteVenue {
    id: string;
    user_id: string;
    venue_id: string;
    created_at: string;
    venue?: {
        id: string;
        name: string;
        slug: string;
        city: string;
        state: string;
        image_url?: string;
    };
}

export interface UpdateProfileFormData {
    display_name?: string;
    bio?: string;
    city?: string;
    state?: string;
    primary_game?: string;
    skill_level?: SkillLevel;
    apa_skill_level?: number;
    years_playing?: number;
    preferred_table_size?: TableSize;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    looking_for_games?: boolean;
    looking_for_team?: boolean;
    looking_for_league?: boolean;
    is_public?: boolean;
    show_stats?: boolean;
    show_activity?: boolean;
}

// Display helpers
export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
    beginner: '🌱 Beginner',
    intermediate: '🎯 Intermediate',
    advanced: '🔥 Advanced',
    pro: '🏆 Professional',
};

export const TABLE_SIZE_LABELS: Record<TableSize, string> = {
    '7-foot': '7-Foot (Bar Size)',
    '8-foot': '8-Foot (Standard)',
    '9-foot': '9-Foot (Tournament)',
};

export function getWinRate(wins: number, matches: number): string {
    if (matches === 0) return '0%';
    return `${Math.round((wins / matches) * 100)}%`;
}
