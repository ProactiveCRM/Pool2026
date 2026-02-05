'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Target,
    CheckCircle,
    XCircle,
    RotateCcw,
    ChevronRight,
    Star
} from 'lucide-react';

interface Drill {
    id: string;
    name: string;
    description: string;
    difficulty: 1 | 2 | 3;
    targetZone: string;
    tips: string[];
}

const drills: Drill[] = [
    {
        id: 'stop',
        name: 'Stop Shot',
        description: 'Cue ball stops at point of contact with object ball',
        difficulty: 1,
        targetZone: 'center',
        tips: ['Hit center cue ball', 'Medium speed', 'Level cue stick']
    },
    {
        id: 'follow',
        name: 'Follow Shot',
        description: 'Cue ball follows object ball forward after contact',
        difficulty: 1,
        targetZone: 'top',
        tips: ['Hit above center', 'Follow through', 'Smooth stroke']
    },
    {
        id: 'draw',
        name: 'Draw Shot',
        description: 'Cue ball comes back toward you after contact',
        difficulty: 2,
        targetZone: 'bottom',
        tips: ['Hit below center', 'Accelerate through', 'Low bridge hand']
    },
    {
        id: 'stun',
        name: 'Stun Shot',
        description: 'Cue ball slides sideways (90°) from object ball line',
        difficulty: 2,
        targetZone: 'center',
        tips: ['Firm center hit', 'Short distance shots', 'No spin']
    },
    {
        id: 'stun-follow',
        name: 'Stun Follow',
        description: 'Cue ball moves forward at angle (less than 90°)',
        difficulty: 2,
        targetZone: 'slight-top',
        tips: ['Just above center', 'Control speed', 'Natural roll develops']
    },
    {
        id: 'stun-draw',
        name: 'Stun Draw',
        description: 'Cue ball moves backward at angle',
        difficulty: 3,
        targetZone: 'slight-bottom',
        tips: ['Just below center', 'Firm stroke', 'Good follow-through']
    },
    {
        id: 'inside-english',
        name: 'Inside English',
        description: 'Spin on side closer to pocket, tighter angle off rail',
        difficulty: 3,
        targetZone: 'side-in',
        tips: ['Aim slightly fuller', 'Compensate for throw', 'Control speed']
    },
    {
        id: 'outside-english',
        name: 'Outside English',
        description: 'Spin on side away from pocket, wider angle off rail',
        difficulty: 3,
        targetZone: 'side-out',
        tips: ['Aim slightly thinner', 'Opens up angle', 'Good for position']
    },
];

interface CueBallControlProps {
    onComplete?: (results: Record<string, { attempts: number; successes: number }>) => void;
}

export function CueBallControl({ onComplete }: CueBallControlProps) {
    const [currentDrill, setCurrentDrill] = useState(0);
    const [results, setResults] = useState<Record<string, { attempts: number; successes: number }>>(
        Object.fromEntries(drills.map(d => [d.id, { attempts: 0, successes: 0 }]))
    );
    const [showTips, setShowTips] = useState(false);

    const drill = drills[currentDrill];
    const result = results[drill.id];
    const percentage = result.attempts > 0
        ? Math.round((result.successes / result.attempts) * 100)
        : 0;

    const recordAttempt = (success: boolean) => {
        setResults(prev => ({
            ...prev,
            [drill.id]: {
                attempts: prev[drill.id].attempts + 1,
                successes: prev[drill.id].successes + (success ? 1 : 0),
            }
        }));
    };

    const nextDrill = () => {
        if (currentDrill < drills.length - 1) {
            setCurrentDrill(currentDrill + 1);
            setShowTips(false);
        }
    };

    const prevDrill = () => {
        if (currentDrill > 0) {
            setCurrentDrill(currentDrill - 1);
            setShowTips(false);
        }
    };

    const resetAll = () => {
        setResults(Object.fromEntries(drills.map(d => [d.id, { attempts: 0, successes: 0 }])));
        setCurrentDrill(0);
    };

    const totalAttempts = Object.values(results).reduce((sum, r) => sum + r.attempts, 0);
    const totalSuccesses = Object.values(results).reduce((sum, r) => sum + r.successes, 0);
    const overallPercentage = totalAttempts > 0
        ? Math.round((totalSuccesses / totalAttempts) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {drills.map((d, i) => (
                        <button
                            key={d.id}
                            onClick={() => setCurrentDrill(i)}
                            className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${i === currentDrill
                                    ? 'bg-primary text-primary-foreground scale-110'
                                    : results[d.id].attempts > 0
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-muted'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
                <Badge variant="outline">
                    {overallPercentage}% overall
                </Badge>
            </div>

            {/* Current Drill */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">{drill.name}</CardTitle>
                            <CardDescription>{drill.description}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < drill.difficulty
                                            ? 'text-yellow-500 fill-yellow-500'
                                            : 'text-muted'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Cue Ball Diagram */}
                    <div className="flex justify-center">
                        <div className="relative w-32 h-32 rounded-full bg-white border-4 border-gray-300 shadow-lg">
                            {/* Target zones */}
                            <div className={`absolute inset-0 flex items-center justify-center`}>
                                <div className={`w-4 h-4 rounded-full ${drill.targetZone === 'center' ? 'bg-primary' :
                                        drill.targetZone === 'top' ? 'bg-primary -translate-y-6' :
                                            drill.targetZone === 'bottom' ? 'bg-primary translate-y-6' :
                                                drill.targetZone === 'slight-top' ? 'bg-primary -translate-y-3' :
                                                    drill.targetZone === 'slight-bottom' ? 'bg-primary translate-y-3' :
                                                        drill.targetZone === 'side-in' ? 'bg-primary translate-x-6' :
                                                            drill.targetZone === 'side-out' ? 'bg-primary -translate-x-6' :
                                                                'bg-muted'
                                    }`} />
                            </div>
                            {/* Guide lines */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute w-full h-px bg-gray-200" />
                                <div className="absolute w-px h-full bg-gray-200" />
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setShowTips(!showTips)}
                    >
                        {showTips ? 'Hide' : 'Show'} Tips
                    </Button>

                    {showTips && (
                        <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                            {drill.tips.map((tip, i) => (
                                <p key={i} className="text-sm flex items-center gap-2">
                                    <span className="text-primary">•</span>
                                    {tip}
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Progress for this drill */}
                    <div className="p-3 rounded-lg bg-muted">
                        <div className="flex justify-between text-sm mb-2">
                            <span>This Drill</span>
                            <span>{result.successes}/{result.attempts} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                    </div>

                    {/* Record Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            size="lg"
                            className="h-16 bg-green-600 hover:bg-green-700"
                            onClick={() => recordAttempt(true)}
                        >
                            <CheckCircle className="h-6 w-6 mr-2" />
                            Success
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-16 border-red-500 text-red-500 hover:bg-red-500/10"
                            onClick={() => recordAttempt(false)}
                        >
                            <XCircle className="h-6 w-6 mr-2" />
                            Miss
                        </Button>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={prevDrill}
                            disabled={currentDrill === 0}
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={nextDrill}
                            disabled={currentDrill === drills.length - 1}
                        >
                            Next Drill
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* All Drills Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">All Drills</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {drills.map((d, i) => {
                            const r = results[d.id];
                            const pct = r.attempts > 0 ? Math.round((r.successes / r.attempts) * 100) : 0;

                            return (
                                <button
                                    key={d.id}
                                    onClick={() => setCurrentDrill(i)}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${i === currentDrill ? 'bg-primary/10' : 'hover:bg-muted'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Badge variant={i === currentDrill ? 'default' : 'outline'}>
                                            {i + 1}
                                        </Badge>
                                        <span className="text-sm">{d.name}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {r.attempts > 0 ? `${pct}%` : '-'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
                <Button variant="outline" onClick={resetAll} className="flex-1">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All
                </Button>
                <Button
                    onClick={() => onComplete?.(results)}
                    className="flex-1"
                    disabled={totalAttempts === 0}
                >
                    <Target className="h-4 w-4 mr-2" />
                    Complete
                </Button>
            </div>
        </div>
    );
}
