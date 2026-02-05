'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Info,
    History,
    Target,
    Award
} from 'lucide-react';

/**
 * APA-Style "Equalizer" Handicap System for Pool
 * 
 * Based on the American Poolplayers Association (APA) system:
 * - 8-Ball: Skill levels 2-7 based on innings per win
 * - 9-Ball: Skill levels 1-9 based on points per inning
 * - Uses best 10 of last 20 matches
 * - Tracks innings, safeties, and game outcomes
 * 
 * Key Metric for 8-Ball: (innings - safeties) / games won
 * Lower average = higher skill level
 */

interface MatchResult {
    id: string;
    date: string;
    gameType: '8ball' | '9ball';
    gamesWon: number;
    gamesLost: number;
    totalInnings: number;
    safeties: number;
    opponentSkillLevel: number;
    // For 9-ball: total points scored
    pointsScored?: number;
}

// APA 8-Ball Skill Level Chart (Innings Per Game to Win)
const APA_8BALL_CHART = [
    { level: 2, minIPW: 5.0, maxIPW: 999, description: 'Beginner', raceToWin: 2 },
    { level: 3, minIPW: 4.0, maxIPW: 4.99, description: 'Novice', raceToWin: 3 },
    { level: 4, minIPW: 3.0, maxIPW: 3.99, description: 'Intermediate', raceToWin: 4 },
    { level: 5, minIPW: 2.2, maxIPW: 2.99, description: 'Advanced', raceToWin: 5 },
    { level: 6, minIPW: 1.7, maxIPW: 2.19, description: 'Expert', raceToWin: 6 },
    { level: 7, minIPW: 0, maxIPW: 1.69, description: 'Master', raceToWin: 7 },
];

// APA 9-Ball Skill Level Chart (Points Per Inning)
const APA_9BALL_CHART = [
    { level: 1, minPPI: 0, maxPPI: 0.49, description: 'Beginner', raceToPoints: 14 },
    { level: 2, minPPI: 0.5, maxPPI: 0.79, description: 'Novice', raceToPoints: 19 },
    { level: 3, minPPI: 0.8, maxPPI: 1.09, description: 'Low Intermediate', raceToPoints: 25 },
    { level: 4, minPPI: 1.1, maxPPI: 1.39, description: 'Intermediate', raceToPoints: 31 },
    { level: 5, minPPI: 1.4, maxPPI: 1.69, description: 'High Intermediate', raceToPoints: 38 },
    { level: 6, minPPI: 1.7, maxPPI: 1.99, description: 'Low Advanced', raceToPoints: 46 },
    { level: 7, minPPI: 2.0, maxPPI: 2.29, description: 'Advanced', raceToPoints: 55 },
    { level: 8, minPPI: 2.3, maxPPI: 2.59, description: 'Expert', raceToPoints: 65 },
    { level: 9, minPPI: 2.6, maxPPI: 999, description: 'Professional', raceToPoints: 75 },
];

// APA Race Chart for 8-Ball (Skill Level vs Skill Level = Games to Win)
const APA_8BALL_RACE_CHART: Record<string, [number, number]> = {
    '2-2': [2, 2], '2-3': [2, 3], '2-4': [2, 4], '2-5': [2, 5], '2-6': [2, 6], '2-7': [2, 7],
    '3-3': [3, 3], '3-4': [3, 4], '3-5': [3, 5], '3-6': [3, 6], '3-7': [3, 7],
    '4-4': [4, 4], '4-5': [4, 5], '4-6': [4, 6], '4-7': [5, 7],
    '5-5': [5, 5], '5-6': [5, 6], '5-7': [5, 7],
    '6-6': [5, 5], '6-7': [5, 6],
    '7-7': [5, 5],
};

// Calculate 8-Ball skill level from match data
function calculate8BallSkillLevel(matches: MatchResult[]): { level: number; ipw: number } {
    const eightBallMatches = matches.filter(m => m.gameType === '8ball' && m.gamesWon > 0);
    if (eightBallMatches.length < 3) return { level: 4, ipw: 3.5 }; // Default to SL4

    // Sort by IPW and take best 10 of last 20
    const recent20 = eightBallMatches.slice(-20);
    const withIPW = recent20.map(m => ({
        ...m,
        ipw: (m.totalInnings - m.safeties) / m.gamesWon
    }));

    // Sort by best (lowest) IPW and take best 10
    const sorted = [...withIPW].sort((a, b) => a.ipw - b.ipw);
    const best10 = sorted.slice(0, Math.min(10, sorted.length));

    // Average IPW of best matches
    const avgIPW = best10.reduce((sum, m) => sum + m.ipw, 0) / best10.length;

    // Find skill level
    const skillInfo = APA_8BALL_CHART.find(s => avgIPW >= s.minIPW && avgIPW <= s.maxIPW)
        || APA_8BALL_CHART[0];

    return { level: skillInfo.level, ipw: Math.round(avgIPW * 100) / 100 };
}

// Calculate 9-Ball skill level from match data
function calculate9BallSkillLevel(matches: MatchResult[]): { level: number; ppi: number } {
    const nineBallMatches = matches.filter(m => m.gameType === '9ball' && m.totalInnings > 0);
    if (nineBallMatches.length < 3) return { level: 5, ppi: 1.5 }; // Default to SL5

    // Sort by PPI and take best 10 of last 20
    const recent20 = nineBallMatches.slice(-20);
    const withPPI = recent20.map(m => ({
        ...m,
        ppi: (m.pointsScored || 0) / m.totalInnings
    }));

    // Sort by best (highest) PPI and take best 10
    const sorted = [...withPPI].sort((a, b) => b.ppi - a.ppi);
    const best10 = sorted.slice(0, Math.min(10, sorted.length));

    // Average PPI of best matches
    const avgPPI = best10.reduce((sum, m) => sum + m.ppi, 0) / best10.length;

    // Find skill level
    const skillInfo = APA_9BALL_CHART.find(s => avgPPI >= s.minPPI && avgPPI <= s.maxPPI)
        || APA_9BALL_CHART[4];

    return { level: skillInfo.level, ppi: Math.round(avgPPI * 100) / 100 };
}

// Get race based on two skill levels
function getRace(sl1: number, sl2: number, gameType: '8ball' | '9ball'): { player1: number; player2: number } {
    if (gameType === '8ball') {
        const key = `${Math.min(sl1, sl2)}-${Math.max(sl1, sl2)}`;
        const race = APA_8BALL_RACE_CHART[key] || [4, 4];
        return sl1 <= sl2 ? { player1: race[0], player2: race[1] } : { player1: race[1], player2: race[0] };
    } else {
        // 9-ball uses points race
        const p1Info = APA_9BALL_CHART.find(s => s.level === sl1)!;
        const p2Info = APA_9BALL_CHART.find(s => s.level === sl2)!;
        return { player1: p1Info?.raceToPoints || 38, player2: p2Info?.raceToPoints || 38 };
    }
}

// Demo match history
const demoMatches: MatchResult[] = [
    { id: '1', date: 'Jan 5', gameType: '8ball', gamesWon: 3, gamesLost: 2, totalInnings: 12, safeties: 2, opponentSkillLevel: 5 },
    { id: '2', date: 'Jan 8', gameType: '8ball', gamesWon: 4, gamesLost: 1, totalInnings: 14, safeties: 3, opponentSkillLevel: 4 },
    { id: '3', date: 'Jan 12', gameType: '8ball', gamesWon: 2, gamesLost: 4, totalInnings: 18, safeties: 4, opponentSkillLevel: 6 },
    { id: '4', date: 'Jan 15', gameType: '8ball', gamesWon: 5, gamesLost: 2, totalInnings: 20, safeties: 5, opponentSkillLevel: 4 },
    { id: '5', date: 'Jan 19', gameType: '8ball', gamesWon: 3, gamesLost: 3, totalInnings: 16, safeties: 3, opponentSkillLevel: 5 },
    { id: '6', date: 'Jan 22', gameType: '8ball', gamesWon: 4, gamesLost: 2, totalInnings: 15, safeties: 2, opponentSkillLevel: 5 },
    { id: '7', date: 'Jan 26', gameType: '8ball', gamesWon: 2, gamesLost: 5, totalInnings: 22, safeties: 6, opponentSkillLevel: 7 },
    { id: '8', date: 'Jan 29', gameType: '8ball', gamesWon: 5, gamesLost: 1, totalInnings: 16, safeties: 4, opponentSkillLevel: 3 },
    { id: '9', date: 'Feb 1', gameType: '8ball', gamesWon: 4, gamesLost: 3, totalInnings: 18, safeties: 3, opponentSkillLevel: 5 },
    { id: '10', date: 'Feb 4', gameType: '8ball', gamesWon: 3, gamesLost: 2, totalInnings: 13, safeties: 2, opponentSkillLevel: 4 },
    { id: '11', date: 'Jan 7', gameType: '9ball', gamesWon: 2, gamesLost: 1, totalInnings: 25, safeties: 3, opponentSkillLevel: 5, pointsScored: 42 },
    { id: '12', date: 'Jan 14', gameType: '9ball', gamesWon: 3, gamesLost: 2, totalInnings: 35, safeties: 5, opponentSkillLevel: 6, pointsScored: 58 },
    { id: '13', date: 'Jan 21', gameType: '9ball', gamesWon: 2, gamesLost: 3, totalInnings: 40, safeties: 4, opponentSkillLevel: 7, pointsScored: 52 },
    { id: '14', date: 'Jan 28', gameType: '9ball', gamesWon: 4, gamesLost: 1, totalInnings: 30, safeties: 6, opponentSkillLevel: 4, pointsScored: 65 },
    { id: '15', date: 'Feb 3', gameType: '9ball', gamesWon: 3, gamesLost: 2, totalInnings: 32, safeties: 4, opponentSkillLevel: 5, pointsScored: 55 },
];

export function HandicapCalculator() {
    const [gameType, setGameType] = useState<'8ball' | '9ball'>('8ball');
    const [opponentSL, setOpponentSL] = useState(5);

    const eightBallSL = useMemo(() => calculate8BallSkillLevel(demoMatches), []);
    const nineBallSL = useMemo(() => calculate9BallSkillLevel(demoMatches), []);

    const currentSL = gameType === '8ball' ? eightBallSL : nineBallSL;
    const slInfo = gameType === '8ball'
        ? APA_8BALL_CHART.find(s => s.level === currentSL.level)
        : APA_9BALL_CHART.find(s => s.level === currentSL.level);

    const race = useMemo(() =>
        getRace(currentSL.level, opponentSL, gameType),
        [currentSL.level, opponentSL, gameType]
    );

    const relevantMatches = demoMatches.filter(m => m.gameType === gameType);
    const totalWins = relevantMatches.reduce((sum, m) => sum + m.gamesWon, 0);
    const totalLosses = relevantMatches.reduce((sum, m) => sum + m.gamesLost, 0);

    return (
        <div className="space-y-6">
            {/* Game Type Selector */}
            <Tabs value={gameType} onValueChange={(v) => setGameType(v as '8ball' | '9ball')}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="8ball" className="gap-2">
                        🎱 8-Ball
                    </TabsTrigger>
                    <TabsTrigger value="9ball" className="gap-2">
                        🟡 9-Ball
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Your Skill Level Card */}
            <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Your Skill Level</p>
                            <div className="flex items-center gap-3">
                                <span className="text-6xl font-bold">SL{currentSL.level}</span>
                                <div>
                                    <Badge variant="secondary" className="text-sm">
                                        {slInfo?.description}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {gameType === '8ball'
                                            ? `${eightBallSL.ipw} innings per win`
                                            : `${nineBallSL.ppi} points per inning`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <Award className="h-12 w-12 text-primary/50" />
                        </div>
                    </div>
                </div>
                <CardContent className="pt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-green-500">{totalWins}</p>
                            <p className="text-xs text-muted-foreground">Games Won</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-500">{totalLosses}</p>
                            <p className="text-xs text-muted-foreground">Games Lost</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {((totalWins / (totalWins + totalLosses)) * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">Win Rate</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Race Calculator */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Race Calculator
                    </CardTitle>
                    <CardDescription>
                        Select your opponent&apos;s skill level to calculate the race
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Opponent Skill Level</p>
                        <div className="flex gap-2 flex-wrap">
                            {(gameType === '8ball' ? [2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5, 6, 7, 8, 9]).map(level => (
                                <button
                                    key={level}
                                    onClick={() => setOpponentSL(level)}
                                    className={`w-10 h-10 rounded-lg font-bold transition-all ${opponentSL === level
                                        ? 'bg-primary text-primary-foreground scale-105'
                                        : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted">
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">You (SL{currentSL.level})</p>
                                <p className="text-4xl font-bold text-primary">
                                    {gameType === '8ball' ? `Race to ${race.player1}` : `${race.player1} pts`}
                                </p>
                            </div>
                            <div className="text-2xl text-muted-foreground">vs</div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Opponent (SL{opponentSL})</p>
                                <p className="text-4xl font-bold">
                                    {gameType === '8ball' ? `Race to ${race.player2}` : `${race.player2} pts`}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* How APA Handicapping Works */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        APA Equalizer® System
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    {gameType === '8ball' ? (
                        <>
                            <p className="text-muted-foreground">
                                The APA uses <strong>Innings Per Win (IPW)</strong> to determine 8-Ball skill levels.
                            </p>
                            <div className="grid gap-2">
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span>Formula:</span>
                                    <span className="font-mono">(Innings - Safeties) / Games Won</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span>Matches Used:</span>
                                    <span>Best 10 of last 20</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {APA_8BALL_CHART.map(s => (
                                    <div key={s.level} className={`p-2 rounded text-center ${s.level === currentSL.level ? 'bg-primary/20 border border-primary' : 'bg-muted/50'
                                        }`}>
                                        <p className="font-bold">SL{s.level}</p>
                                        <p className="text-xs text-muted-foreground">{s.description}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-muted-foreground">
                                The APA uses <strong>Points Per Inning (PPI)</strong> to determine 9-Ball skill levels.
                            </p>
                            <div className="grid gap-2">
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span>Formula:</span>
                                    <span className="font-mono">Points Scored / Total Innings</span>
                                </div>
                                <div className="flex justify-between p-2 bg-muted rounded">
                                    <span>Points:</span>
                                    <span>1 pt/ball, 2 pts for 9-ball</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {APA_9BALL_CHART.map(s => (
                                    <div key={s.level} className={`p-2 rounded text-center ${s.level === currentSL.level ? 'bg-primary/20 border border-primary' : 'bg-muted/50'
                                        }`}>
                                        <p className="font-bold">SL{s.level}</p>
                                        <p className="text-xs text-muted-foreground">{s.description}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Recent {gameType === '8ball' ? '8-Ball' : '9-Ball'} Matches
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {relevantMatches.slice(-8).reverse().map((match) => {
                            const ipw = match.gamesWon > 0
                                ? ((match.totalInnings - match.safeties) / match.gamesWon).toFixed(2)
                                : '-';
                            const won = match.gamesWon > match.gamesLost;

                            return (
                                <div
                                    key={match.id}
                                    className={`flex items-center justify-between p-3 rounded-lg ${won ? 'bg-green-500/10' : 'bg-red-500/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-12">{match.date}</span>
                                        <Badge variant={won ? 'default' : 'secondary'}>
                                            {match.gamesWon} - {match.gamesLost}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            vs SL{match.opponentSkillLevel}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-mono text-sm">
                                            {gameType === '8ball'
                                                ? `${ipw} IPW`
                                                : `${((match.pointsScored || 0) / match.totalInnings).toFixed(2)} PPI`
                                            }
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
