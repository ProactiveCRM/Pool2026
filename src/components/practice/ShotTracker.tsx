'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Target,
    TrendingUp,
    Trophy,
    RotateCcw,
    Crosshair,
    Zap
} from 'lucide-react';

interface ShotStats {
    attempts: number;
    made: number;
    type: string;
}

interface ShotTrackerProps {
    onSessionEnd?: (stats: Record<string, ShotStats>) => void;
}

const shotTypes = [
    { id: 'straight', label: 'Straight-In', icon: '🎯', color: 'bg-green-500' },
    { id: 'cut', label: 'Cut Shots', icon: '📐', color: 'bg-blue-500' },
    { id: 'bank', label: 'Bank Shots', icon: '🔄', color: 'bg-purple-500' },
    { id: 'kick', label: 'Kick Shots', icon: '⚡', color: 'bg-yellow-500' },
    { id: 'combo', label: 'Combos', icon: '🔗', color: 'bg-orange-500' },
    { id: 'safety', label: 'Safeties', icon: '🛡️', color: 'bg-gray-500' },
];

export function ShotTracker({ onSessionEnd }: ShotTrackerProps) {
    const [stats, setStats] = useState<Record<string, ShotStats>>(
        Object.fromEntries(shotTypes.map(t => [t.id, { attempts: 0, made: 0, type: t.label }]))
    );
    const [activeShot, setActiveShot] = useState<string | null>(null);

    const recordShot = (shotType: string, made: boolean) => {
        setStats(prev => ({
            ...prev,
            [shotType]: {
                ...prev[shotType],
                attempts: prev[shotType].attempts + 1,
                made: prev[shotType].made + (made ? 1 : 0),
            }
        }));
        setActiveShot(null);
    };

    const resetStats = () => {
        setStats(Object.fromEntries(shotTypes.map(t => [t.id, { attempts: 0, made: 0, type: t.label }])));
    };

    const totalAttempts = Object.values(stats).reduce((sum, s) => sum + s.attempts, 0);
    const totalMade = Object.values(stats).reduce((sum, s) => sum + s.made, 0);
    const overallPercentage = totalAttempts > 0 ? Math.round((totalMade / totalAttempts) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Overall Stats */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <Crosshair className="h-6 w-6 mx-auto mb-1 text-primary" />
                            <p className="text-2xl font-bold">{totalAttempts}</p>
                            <p className="text-xs text-muted-foreground">Shots</p>
                        </div>
                        <div>
                            <Target className="h-6 w-6 mx-auto mb-1 text-green-500" />
                            <p className="text-2xl font-bold">{totalMade}</p>
                            <p className="text-xs text-muted-foreground">Made</p>
                        </div>
                        <div>
                            <TrendingUp className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                            <p className="text-2xl font-bold">{overallPercentage}%</p>
                            <p className="text-xs text-muted-foreground">Accuracy</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Shot Type Selector */}
            {!activeShot ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Select Shot Type</CardTitle>
                        <CardDescription>Tap the shot type before attempting</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {shotTypes.map(shot => {
                                const stat = stats[shot.id];
                                const pct = stat.attempts > 0
                                    ? Math.round((stat.made / stat.attempts) * 100)
                                    : 0;

                                return (
                                    <button
                                        key={shot.id}
                                        onClick={() => setActiveShot(shot.id)}
                                        className="p-4 rounded-lg border-2 border-muted hover:border-primary transition-all text-left"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">{shot.icon}</span>
                                            <span className="font-medium">{shot.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Progress value={pct} className="flex-1 h-2" />
                                            <span className="text-xs text-muted-foreground w-12">
                                                {stat.made}/{stat.attempts}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-2 border-primary">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="text-2xl">
                                {shotTypes.find(s => s.id === activeShot)?.icon}
                            </span>
                            {shotTypes.find(s => s.id === activeShot)?.label}
                        </CardTitle>
                        <CardDescription>Did you make the shot?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                size="lg"
                                className="h-20 text-lg bg-green-600 hover:bg-green-700"
                                onClick={() => recordShot(activeShot, true)}
                            >
                                <Trophy className="h-6 w-6 mr-2" />
                                Made It!
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-20 text-lg border-red-500 text-red-500 hover:bg-red-500/10"
                                onClick={() => recordShot(activeShot, false)}
                            >
                                <Zap className="h-6 w-6 mr-2" />
                                Missed
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            className="w-full mt-3"
                            onClick={() => setActiveShot(null)}
                        >
                            Cancel
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Shot Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Shot Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {shotTypes.map(shot => {
                            const stat = stats[shot.id];
                            const pct = stat.attempts > 0
                                ? Math.round((stat.made / stat.attempts) * 100)
                                : 0;

                            return (
                                <div key={shot.id} className="flex items-center gap-3">
                                    <span className="text-lg w-8">{shot.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{shot.label}</span>
                                            <span className="text-muted-foreground">
                                                {stat.made}/{stat.attempts} ({pct}%)
                                            </span>
                                        </div>
                                        <Progress value={pct} className="h-2" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
                <Button variant="outline" onClick={resetStats} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Session
                </Button>
                <Button
                    onClick={() => onSessionEnd?.(stats)}
                    className="flex-1"
                    disabled={totalAttempts === 0}
                >
                    <Trophy className="h-4 w-4 mr-2" />
                    End Session
                </Button>
            </div>
        </div>
    );
}
