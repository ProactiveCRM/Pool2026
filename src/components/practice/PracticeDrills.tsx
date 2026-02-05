'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Target,
    Play,
    Pause,
    RotateCcw,
    Check,
    Clock,
    Flame,
    Trophy,
    ChevronRight
} from 'lucide-react';

interface Drill {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // in minutes
    category: 'position' | 'safety' | 'break' | 'bank' | 'kick';
    completedCount: number;
    bestScore?: number;
    targetScore: number;
}

interface PracticeDrillsProps {
    drills: Drill[];
    onStartDrill?: (drill: Drill) => void;
    weeklyGoal?: number;
    weeklyCompleted?: number;
}

const difficultyColors = {
    beginner: 'bg-green-500/20 text-green-500',
    intermediate: 'bg-yellow-500/20 text-yellow-500',
    advanced: 'bg-red-500/20 text-red-500',
};

const categoryIcons = {
    position: '🎯',
    safety: '🛡️',
    break: '💥',
    bank: '↗️',
    kick: '🔄',
};

export function PracticeDrills({
    drills,
    onStartDrill,
    weeklyGoal = 10,
    weeklyCompleted = 6
}: PracticeDrillsProps) {
    const [activeDrill, setActiveDrill] = useState<Drill | null>(null);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [score, setScore] = useState(0);

    const weeklyProgress = (weeklyCompleted / weeklyGoal) * 100;

    const startDrill = (drill: Drill) => {
        setActiveDrill(drill);
        setTimer(drill.duration * 60);
        setScore(0);
        setIsRunning(false);
        onStartDrill?.(drill);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Weekly Goal */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Flame className="h-5 w-5 text-orange-500" />
                            <span className="font-semibold">Weekly Practice Goal</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {weeklyCompleted} / {weeklyGoal} drills
                        </span>
                    </div>
                    <Progress value={weeklyProgress} className="h-3" />
                    {weeklyCompleted >= weeklyGoal && (
                        <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            Goal reached! Great work this week!
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Active Drill */}
            {activeDrill && (
                <Card className="border-primary">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                {activeDrill.name}
                            </CardTitle>
                            <Badge className={difficultyColors[activeDrill.difficulty]}>
                                {activeDrill.difficulty}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">{activeDrill.description}</p>

                        {/* Timer */}
                        <div className="text-center py-6">
                            <div className="text-5xl font-mono font-bold mb-4">
                                {formatTime(timer)}
                            </div>
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsRunning(!isRunning)}
                                >
                                    {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setTimer(activeDrill.duration * 60)}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Score Counter */}
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setScore(Math.max(0, score - 1))}
                            >
                                -
                            </Button>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{score}</div>
                                <div className="text-sm text-muted-foreground">
                                    Target: {activeDrill.targetScore}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setScore(score + 1)}
                            >
                                +
                            </Button>
                        </div>

                        <Button
                            className="w-full"
                            onClick={() => setActiveDrill(null)}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Complete Drill
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Drill Categories */}
            <div className="grid md:grid-cols-2 gap-4">
                {drills.map(drill => (
                    <Card
                        key={drill.id}
                        className={`cursor-pointer transition-all hover:border-primary ${activeDrill?.id === drill.id ? 'border-primary' : ''
                            }`}
                        onClick={() => startDrill(drill)}
                    >
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{categoryIcons[drill.category]}</span>
                                    <div>
                                        <h3 className="font-semibold">{drill.name}</h3>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${difficultyColors[drill.difficulty]}`}
                                        >
                                            {drill.difficulty}
                                        </Badge>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                {drill.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {drill.duration} min
                                </span>
                                <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Target: {drill.targetScore}
                                </span>
                                {drill.bestScore !== undefined && (
                                    <span className="flex items-center gap-1">
                                        <Trophy className="h-3 w-3 text-yellow-500" />
                                        Best: {drill.bestScore}
                                    </span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// Demo drills
export const demoDrills: Drill[] = [
    {
        id: '1',
        name: 'Stop Shot Practice',
        description: 'Practice stopping the cue ball dead on contact. Set up straight-in shots at various distances.',
        difficulty: 'beginner',
        duration: 10,
        category: 'position',
        completedCount: 12,
        bestScore: 8,
        targetScore: 10,
    },
    {
        id: '2',
        name: 'Rail Cut Shots',
        description: 'Practice cutting balls along the rail at different angles. Focus on consistent speed control.',
        difficulty: 'intermediate',
        duration: 15,
        category: 'position',
        completedCount: 8,
        bestScore: 6,
        targetScore: 10,
    },
    {
        id: '3',
        name: 'Safety Battle',
        description: 'Practice leaving the cue ball safe behind blockers. Score a point for each good safety.',
        difficulty: 'intermediate',
        duration: 20,
        category: 'safety',
        completedCount: 5,
        bestScore: 7,
        targetScore: 10,
    },
    {
        id: '4',
        name: 'Break Speed Control',
        description: 'Practice controlled breaks. Score based on solid pocketing and cue ball position.',
        difficulty: 'advanced',
        duration: 15,
        category: 'break',
        completedCount: 10,
        bestScore: 4,
        targetScore: 5,
    },
    {
        id: '5',
        name: 'Bank Shot Gallery',
        description: 'Practice bank shots from various positions. Cross-corner and cross-side banks.',
        difficulty: 'advanced',
        duration: 20,
        category: 'bank',
        completedCount: 3,
        targetScore: 8,
    },
    {
        id: '6',
        name: 'Kick Shot Fundamentals',
        description: 'Practice one-rail kicks using the diamond system. Build consistency with mirrors.',
        difficulty: 'intermediate',
        duration: 15,
        category: 'kick',
        completedCount: 6,
        bestScore: 5,
        targetScore: 8,
    },
];
