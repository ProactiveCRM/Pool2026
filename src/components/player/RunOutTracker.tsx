'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Flame,
    Trophy,
    Star,
    RotateCcw,
    TrendingUp,
    Zap
} from 'lucide-react';

interface RunOutData {
    date: string;
    gameType: '8ball' | '9ball';
    balls: number;
    fromBreak: boolean;
}

interface RunOutTrackerProps {
    onSave?: (runOut: RunOutData) => void;
}

// Demo run out history
const runOutHistory: RunOutData[] = [
    { date: '2h ago', gameType: '8ball', balls: 8, fromBreak: true },
    { date: 'Yesterday', gameType: '9ball', balls: 5, fromBreak: false },
    { date: '2 days ago', gameType: '8ball', balls: 8, fromBreak: false },
    { date: '3 days ago', gameType: '9ball', balls: 9, fromBreak: true },
    { date: 'Last week', gameType: '8ball', balls: 6, fromBreak: false },
];

export function RunOutTracker({ onSave }: RunOutTrackerProps) {
    const [gameType, setGameType] = useState<'8ball' | '9ball'>('8ball');
    const [balls, setBalls] = useState(0);
    const [fromBreak, setFromBreak] = useState(false);

    const maxBalls = gameType === '8ball' ? 8 : 9;
    const currentStreak = 2; // Demo: current run out streak
    const bestStreak = 3;
    const totalRunOuts = runOutHistory.length;
    const breakAndRuns = runOutHistory.filter(r => r.fromBreak).length;

    const handleSave = () => {
        if (balls > 0) {
            onSave?.({
                date: 'Just now',
                gameType,
                balls,
                fromBreak
            });
            setBalls(0);
            setFromBreak(false);
        }
    };

    const handleReset = () => {
        setBalls(0);
        setFromBreak(false);
    };

    return (
        <div className="space-y-6">
            {/* Current Streak */}
            <Card className="bg-gradient-to-r from-orange-500/20 to-orange-500/5">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                            <Flame className="h-8 w-8 mx-auto text-orange-500 animate-pulse" />
                            <p className="text-4xl font-bold mt-2">{currentStreak}</p>
                            <p className="text-sm text-muted-foreground">Current Streak</p>
                        </div>
                        <div className="h-16 w-px bg-border" />
                        <div className="text-center">
                            <Star className="h-8 w-8 mx-auto text-yellow-500" />
                            <p className="text-4xl font-bold mt-2">{bestStreak}</p>
                            <p className="text-sm text-muted-foreground">Best Streak</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-4 text-center">
                        <Trophy className="h-6 w-6 mx-auto mb-1 text-primary" />
                        <p className="text-2xl font-bold">{totalRunOuts}</p>
                        <p className="text-xs text-muted-foreground">Total Run Outs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4 text-center">
                        <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                        <p className="text-2xl font-bold">{breakAndRuns}</p>
                        <p className="text-xs text-muted-foreground">Break & Runs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Record Run Out */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Record Run Out</CardTitle>
                    <CardDescription>Log your table runs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Game Type */}
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant={gameType === '8ball' ? 'default' : 'outline'}
                            onClick={() => { setGameType('8ball'); setBalls(0); }}
                            className="h-12"
                        >
                            🎱 8-Ball
                        </Button>
                        <Button
                            variant={gameType === '9ball' ? 'default' : 'outline'}
                            onClick={() => { setGameType('9ball'); setBalls(0); }}
                            className="h-12"
                        >
                            🟡 9-Ball
                        </Button>
                    </div>

                    {/* Ball Count */}
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Balls Run ({gameType === '8ball' ? '8-ball = full run' : '9-ball = full run'})</p>
                        <div className="flex gap-2 flex-wrap">
                            {Array.from({ length: maxBalls }, (_, i) => i + 1).map(num => (
                                <button
                                    key={num}
                                    onClick={() => setBalls(num)}
                                    className={`w-10 h-10 rounded-lg font-bold transition-all ${balls >= num
                                            ? num === maxBalls
                                                ? 'bg-green-500 text-white scale-105'
                                                : 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        {balls === maxBalls && (
                            <p className="text-sm text-green-500 mt-2 font-medium">
                                🎉 Full run out!
                            </p>
                        )}
                    </div>

                    {/* Break and Run Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">From the Break?</span>
                        </div>
                        <Button
                            variant={fromBreak ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFromBreak(!fromBreak)}
                        >
                            {fromBreak ? 'Yes' : 'No'}
                        </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleReset} className="flex-1">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                        <Button onClick={handleSave} className="flex-1" disabled={balls === 0}>
                            <Trophy className="h-4 w-4 mr-2" />
                            Save Run
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Run Out History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Recent Run Outs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {runOutHistory.map((run, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">
                                        {run.gameType === '8ball' ? '🎱' : '🟡'}
                                    </span>
                                    <div>
                                        <p className="font-medium">
                                            {run.balls} ball{run.balls > 1 ? 's' : ''} run
                                            {run.balls === (run.gameType === '8ball' ? 8 : 9) && (
                                                <span className="text-green-500 ml-1">✓</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{run.date}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {run.fromBreak && (
                                        <Badge className="bg-yellow-500">
                                            <Zap className="h-3 w-3 mr-1" />
                                            B&R
                                        </Badge>
                                    )}
                                    {run.balls === (run.gameType === '8ball' ? 8 : 9) && (
                                        <Badge variant="secondary">Full</Badge>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
