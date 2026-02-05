'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface Match {
    id: string;
    round: number;
    position: number;
    player1?: { name: string; seed?: number; score?: number };
    player2?: { name: string; seed?: number; score?: number };
    winner?: 1 | 2;
    scheduled?: string;
}

interface TournamentBracketProps {
    matches: Match[];
    tournamentName: string;
    rounds: number;
}

export function TournamentBracket({ matches, tournamentName, rounds }: TournamentBracketProps) {
    const getMatchesByRound = (round: number) => {
        return matches
            .filter(m => m.round === round)
            .sort((a, b) => a.position - b.position);
    };

    const getRoundName = (round: number, totalRounds: number) => {
        if (round === totalRounds) return 'Finals';
        if (round === totalRounds - 1) return 'Semi-Finals';
        if (round === totalRounds - 2) return 'Quarter-Finals';
        return `Round ${round}`;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    {tournamentName}
                </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <div className="flex gap-8 min-w-max pb-4">
                    {Array.from({ length: rounds }, (_, i) => i + 1).map(round => (
                        <div key={round} className="flex flex-col gap-4">
                            <h3 className="text-sm font-semibold text-center text-muted-foreground mb-2">
                                {getRoundName(round, rounds)}
                            </h3>
                            <div
                                className="flex flex-col justify-around h-full"
                                style={{ gap: `${Math.pow(2, round - 1) * 2}rem` }}
                            >
                                {getMatchesByRound(round).map(match => (
                                    <MatchCard key={match.id} match={match} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function MatchCard({ match }: { match: Match }) {
    return (
        <div className="bg-muted rounded-lg overflow-hidden w-48 shadow-sm">
            <PlayerSlot
                player={match.player1}
                isWinner={match.winner === 1}
                position="top"
            />
            <div className="border-t border-border" />
            <PlayerSlot
                player={match.player2}
                isWinner={match.winner === 2}
                position="bottom"
            />
            {match.scheduled && (
                <div className="text-xs text-center py-1 bg-muted-foreground/10 text-muted-foreground">
                    {match.scheduled}
                </div>
            )}
        </div>
    );
}

function PlayerSlot({
    player,
    isWinner,
    position
}: {
    player?: { name: string; seed?: number; score?: number };
    isWinner: boolean;
    position: 'top' | 'bottom';
}) {
    if (!player) {
        return (
            <div className="px-3 py-2 text-sm text-muted-foreground italic">
                TBD
            </div>
        );
    }

    return (
        <div className={`px-3 py-2 flex items-center justify-between gap-2 ${isWinner ? 'bg-primary/10' : ''
            }`}>
            <div className="flex items-center gap-2 min-w-0">
                {player.seed && (
                    <Badge variant="outline" className="text-xs px-1.5 flex-shrink-0">
                        {player.seed}
                    </Badge>
                )}
                <span className={`text-sm truncate ${isWinner ? 'font-bold text-primary' : ''}`}>
                    {player.name}
                </span>
            </div>
            {player.score !== undefined && (
                <span className={`text-sm font-mono ${isWinner ? 'font-bold' : 'text-muted-foreground'}`}>
                    {player.score}
                </span>
            )}
            {isWinner && (
                <Trophy className="h-3 w-3 text-yellow-500 flex-shrink-0" />
            )}
        </div>
    );
}

// Demo data for an 8-player bracket
export const demoTournamentMatches: Match[] = [
    // Round 1 (Quarter-finals)
    { id: 'q1', round: 1, position: 1, player1: { name: 'Marcus Chen', seed: 1, score: 5 }, player2: { name: 'Taylor Brown', seed: 8, score: 2 }, winner: 1 },
    { id: 'q2', round: 1, position: 2, player1: { name: 'Emma Davis', seed: 4, score: 5 }, player2: { name: 'Chris Rodriguez', seed: 5, score: 4 }, winner: 1 },
    { id: 'q3', round: 1, position: 3, player1: { name: 'Sarah Williams', seed: 2, score: 5 }, player2: { name: 'Jordan Lee', seed: 7, score: 1 }, winner: 1 },
    { id: 'q4', round: 1, position: 4, player1: { name: 'Jake Thompson', seed: 3, score: 3 }, player2: { name: 'Alex Kim', seed: 6, score: 5 }, winner: 2 },

    // Round 2 (Semi-finals)
    { id: 's1', round: 2, position: 1, player1: { name: 'Marcus Chen', seed: 1, score: 5 }, player2: { name: 'Emma Davis', seed: 4, score: 3 }, winner: 1 },
    { id: 's2', round: 2, position: 2, player1: { name: 'Sarah Williams', seed: 2, score: 5 }, player2: { name: 'Alex Kim', seed: 6, score: 4 }, winner: 1 },

    // Round 3 (Finals)
    { id: 'f1', round: 3, position: 1, player1: { name: 'Marcus Chen', seed: 1 }, player2: { name: 'Sarah Williams', seed: 2 }, scheduled: 'Sat 7:00 PM' },
];
