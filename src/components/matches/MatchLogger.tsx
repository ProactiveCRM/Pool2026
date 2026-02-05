'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Minus,
    Save,
    RotateCcw,
    Trophy,
    Target,
    Clock,
    User
} from 'lucide-react';

interface MatchData {
    gameType: '8ball' | '9ball' | '10ball';
    opponentName: string;
    opponentSkillLevel: number;
    yourGamesWon: number;
    opponentGamesWon: number;
    totalInnings: number;
    safeties: number;
    breakAndRuns: number;
    // 9-ball specific
    pointsScored?: number;
    venue?: string;
    notes?: string;
}

interface MatchLoggerProps {
    yourSkillLevel?: number;
    onSave?: (match: MatchData) => void;
}

export function MatchLogger({ yourSkillLevel = 5, onSave }: MatchLoggerProps) {
    const [gameType, setGameType] = useState<'8ball' | '9ball' | '10ball'>('8ball');
    const [match, setMatch] = useState<MatchData>({
        gameType: '8ball',
        opponentName: '',
        opponentSkillLevel: 5,
        yourGamesWon: 0,
        opponentGamesWon: 0,
        totalInnings: 0,
        safeties: 0,
        breakAndRuns: 0,
        pointsScored: 0,
    });

    const updateMatch = (field: keyof MatchData, value: number | string) => {
        setMatch(prev => ({ ...prev, [field]: value }));
    };

    const increment = (field: keyof MatchData) => {
        const current = match[field] as number;
        updateMatch(field, current + 1);
    };

    const decrement = (field: keyof MatchData) => {
        const current = match[field] as number;
        if (current > 0) updateMatch(field, current - 1);
    };

    const handleSave = () => {
        onSave?.({ ...match, gameType });
    };

    const handleReset = () => {
        setMatch({
            gameType,
            opponentName: '',
            opponentSkillLevel: 5,
            yourGamesWon: 0,
            opponentGamesWon: 0,
            totalInnings: 0,
            safeties: 0,
            breakAndRuns: 0,
            pointsScored: 0,
        });
    };

    const ipw = match.yourGamesWon > 0
        ? ((match.totalInnings - match.safeties) / match.yourGamesWon).toFixed(2)
        : '-';

    const ppi = match.totalInnings > 0
        ? ((match.pointsScored || 0) / match.totalInnings).toFixed(2)
        : '-';

    return (
        <div className="space-y-6">
            {/* Game Type Selector */}
            <Tabs value={gameType} onValueChange={(v) => setGameType(v as typeof gameType)}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="8ball">🎱 8-Ball</TabsTrigger>
                    <TabsTrigger value="9ball">🟡 9-Ball</TabsTrigger>
                    <TabsTrigger value="10ball">🔵 10-Ball</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Opponent Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-4 w-4" />
                        Opponent
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input
                            placeholder="Opponent name"
                            value={match.opponentName}
                            onChange={(e) => updateMatch('opponentName', e.target.value)}
                        />
                    </div>
                    <div>
                        <Label className="mb-2 block">Skill Level</Label>
                        <div className="flex gap-2 flex-wrap">
                            {(gameType === '9ball' ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [2, 3, 4, 5, 6, 7]).map(level => (
                                <button
                                    key={level}
                                    onClick={() => updateMatch('opponentSkillLevel', level)}
                                    className={`w-9 h-9 rounded-lg font-bold transition-all ${match.opponentSkillLevel === level
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Score */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Trophy className="h-4 w-4" />
                        Score
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">You (SL{yourSkillLevel})</p>
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => decrement('yourGamesWon')}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-4xl font-bold w-12 text-center">
                                    {match.yourGamesWon}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => increment('yourGamesWon')}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {match.opponentName || 'Opponent'} (SL{match.opponentSkillLevel})
                            </p>
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => decrement('opponentGamesWon')}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-4xl font-bold w-12 text-center">
                                    {match.opponentGamesWon}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => increment('opponentGamesWon')}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Match Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-4 w-4" />
                        Match Stats
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Innings */}
                        <div className="space-y-2">
                            <Label>Total Innings</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => decrement('totalInnings')}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-2xl font-bold w-12 text-center">
                                    {match.totalInnings}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => increment('totalInnings')}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Safeties */}
                        <div className="space-y-2">
                            <Label>Defensive Shots</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => decrement('safeties')}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-2xl font-bold w-12 text-center">
                                    {match.safeties}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => increment('safeties')}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Break and Runs */}
                        <div className="space-y-2">
                            <Label>Break & Runs</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => decrement('breakAndRuns')}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-2xl font-bold w-12 text-center">
                                    {match.breakAndRuns}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => increment('breakAndRuns')}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* 9-Ball Points */}
                        {gameType === '9ball' && (
                            <div className="space-y-2">
                                <Label>Points Scored</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => decrement('pointsScored')}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-2xl font-bold w-12 text-center">
                                        {match.pointsScored}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => increment('pointsScored')}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="bg-muted/50">
                <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {gameType === '9ball' ? 'Points Per Inning' : 'Innings Per Win'}
                            </p>
                            <p className="text-2xl font-bold">
                                {gameType === '9ball' ? ppi : ipw}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Result</p>
                            <Badge
                                variant={match.yourGamesWon > match.opponentGamesWon ? 'default' : 'secondary'}
                                className="text-lg px-3 py-1"
                            >
                                {match.yourGamesWon > match.opponentGamesWon ? 'WIN' :
                                    match.yourGamesWon < match.opponentGamesWon ? 'LOSS' : 'TIE'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                </Button>
                <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Match
                </Button>
            </div>
        </div>
    );
}
