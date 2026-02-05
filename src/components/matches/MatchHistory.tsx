'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Trophy,
    Calendar,
    MapPin,
    Clock,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';

interface Match {
    id: string;
    date: string;
    time: string;
    opponent: {
        name: string;
        username: string;
        avatarUrl?: string;
    };
    venue: string;
    league?: string;
    gameType: '8-ball' | '9-ball' | '10-ball';
    result: 'win' | 'loss';
    score: { player: number; opponent: number };
    ratingChange: number;
    highlights?: string[];
}

interface MatchHistoryProps {
    matches: Match[];
    showFilters?: boolean;
}

export function MatchHistory({ matches }: MatchHistoryProps) {
    const recentWins = matches.filter(m => m.result === 'win').length;
    const recentLosses = matches.filter(m => m.result === 'loss').length;
    const winRate = matches.length > 0 ? (recentWins / matches.length) * 100 : 0;

    return (
        <div className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-green-500">{recentWins}</p>
                        <p className="text-xs text-muted-foreground">Wins</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-red-500">{recentLosses}</p>
                        <p className="text-xs text-muted-foreground">Losses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold">{winRate.toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                    </CardContent>
                </Card>
            </div>

            {/* Match List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Matches
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {matches.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No matches played yet
                        </p>
                    ) : (
                        matches.map(match => (
                            <MatchCard key={match.id} match={match} />
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function MatchCard({ match }: { match: Match }) {
    const isWin = match.result === 'win';

    return (
        <div className={`p-4 rounded-lg border ${isWin ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'
            }`}>
            <div className="flex items-center gap-4">
                {/* Result indicator */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isWin ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                    <Trophy className={`h-6 w-6 ${isWin ? 'text-green-500' : 'text-red-500'}`} />
                </div>

                {/* Match details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">vs</span>
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={match.opponent.avatarUrl} />
                            <AvatarFallback className="text-xs">
                                {match.opponent.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{match.opponent.name}</span>
                        <Badge variant="outline" className="text-xs">
                            {match.gameType}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {match.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.venue}
                        </span>
                        {match.league && (
                            <Badge variant="secondary" className="text-xs">
                                {match.league}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Score and rating */}
                <div className="text-right">
                    <div className="text-xl font-bold">
                        <span className={isWin ? 'text-green-500' : ''}>{match.score.player}</span>
                        <span className="text-muted-foreground mx-1">-</span>
                        <span className={!isWin ? 'text-red-500' : ''}>{match.score.opponent}</span>
                    </div>
                    <div className={`text-sm flex items-center justify-end gap-1 ${match.ratingChange > 0 ? 'text-green-500' :
                            match.ratingChange < 0 ? 'text-red-500' : 'text-muted-foreground'
                        }`}>
                        {match.ratingChange > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                        ) : match.ratingChange < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                        ) : (
                            <Minus className="h-3 w-3" />
                        )}
                        {match.ratingChange > 0 ? '+' : ''}{match.ratingChange}
                    </div>
                </div>
            </div>

            {/* Highlights */}
            {match.highlights && match.highlights.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex flex-wrap gap-2">
                        {match.highlights.map((highlight, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                                ⭐ {highlight}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Demo data
export const demoMatches: Match[] = [
    {
        id: '1',
        date: 'Feb 4, 2026',
        time: '8:00 PM',
        opponent: { name: 'Marcus Chen', username: 'marcusc' },
        venue: 'Championship Billiards',
        league: 'Austin 8-Ball',
        gameType: '8-ball',
        result: 'win',
        score: { player: 5, opponent: 3 },
        ratingChange: 12,
        highlights: ['Break & run', '3-ball combo'],
    },
    {
        id: '2',
        date: 'Feb 2, 2026',
        time: '7:30 PM',
        opponent: { name: 'Sarah Williams', username: 'swilliams' },
        venue: 'The Rack Room',
        league: 'Austin 8-Ball',
        gameType: '8-ball',
        result: 'loss',
        score: { player: 2, opponent: 5 },
        ratingChange: -8,
    },
    {
        id: '3',
        date: 'Jan 30, 2026',
        time: '9:00 PM',
        opponent: { name: 'Jake Thompson', username: 'jakethompson' },
        venue: 'Championship Billiards',
        gameType: '9-ball',
        result: 'win',
        score: { player: 7, opponent: 4 },
        ratingChange: 15,
        highlights: ['4 break & runs'],
    },
    {
        id: '4',
        date: 'Jan 27, 2026',
        time: '7:00 PM',
        opponent: { name: 'Emma Davis', username: 'emmad' },
        venue: 'Corner Pocket Bar',
        league: 'Austin 8-Ball',
        gameType: '8-ball',
        result: 'win',
        score: { player: 5, opponent: 1 },
        ratingChange: 18,
        highlights: ['Clean sweep', '2 safeties'],
    },
    {
        id: '5',
        date: 'Jan 24, 2026',
        time: '8:30 PM',
        opponent: { name: 'Chris Rodriguez', username: 'chrisr' },
        venue: 'Downtown Billiards',
        gameType: '8-ball',
        result: 'win',
        score: { player: 5, opponent: 4 },
        ratingChange: 8,
    },
];
