'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Target,
    Zap,
    Info,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface BreakPattern {
    id: string;
    name: string;
    cuePosition: { x: number; y: number };
    aimPoint: string;
    power: 'soft' | 'medium' | 'hard' | 'full';
    tips: string[];
    successRate: string;
    pros: string[];
    cons: string[];
}

const eightBallBreaks: BreakPattern[] = [
    {
        id: 'second-ball',
        name: 'Second Ball Break',
        cuePosition: { x: 25, y: 50 },
        aimPoint: 'Second ball in the rack (front corner)',
        power: 'hard',
        successRate: '65%',
        tips: [
            'Place cue ball near side rail',
            'Aim at second ball, hitting front ball first',
            '8-ball often goes toward corner pocket',
            'Use outside english for cue ball control'
        ],
        pros: ['Good for making 8-ball', 'Controlled cue ball', 'Consistent spread'],
        cons: ['Takes practice', 'Requires accuracy']
    },
    {
        id: 'head-ball',
        name: 'Head Ball Break',
        cuePosition: { x: 50, y: 50 },
        aimPoint: 'Center of head ball',
        power: 'full',
        successRate: '55%',
        tips: [
            'Place cue ball dead center',
            'Hit head ball absolutely full',
            'Maximum power, level cue',
            'Follow through completely'
        ],
        pros: ['Simple aim', 'Maximum spread', 'Good for beginners'],
        cons: ['Less cue ball control', 'Can scratch']
    },
    {
        id: 'cut-break',
        name: 'Cut Break',
        cuePosition: { x: 75, y: 50 },
        aimPoint: 'Outside of head ball (thin hit)',
        power: 'hard',
        successRate: '60%',
        tips: [
            'Position near opposite side rail',
            'Cut the head ball toward corner pocket',
            'Helps control where cue ball goes',
            'Corner balls often make'
        ],
        pros: ['Better cue control', 'Corner ball potential', 'Safer'],
        cons: ['Less powerful spread', 'Requires precision']
    }
];

const nineBallBreaks: BreakPattern[] = [
    {
        id: 'side-rail',
        name: 'Side Rail Break',
        cuePosition: { x: 20, y: 50 },
        aimPoint: '1-ball with slight cut',
        power: 'full',
        successRate: '70%',
        tips: [
            'Cue ball near side rail',
            'Slight cut on the 1-ball',
            'Wing ball (9) often goes to corner',
            'Cue ball stays center table'
        ],
        pros: ['High wing ball success', 'Center table position', 'Pro standard'],
        cons: ['Requires power', 'Side pocket scratch risk']
    },
    {
        id: 'center-soft',
        name: 'Soft Break',
        cuePosition: { x: 50, y: 50 },
        aimPoint: 'Full on 1-ball',
        power: 'soft',
        successRate: '50%',
        tips: [
            'Just enough to spread balls',
            'Cue ball stays near rack area',
            'Good table control',
            'Balls cluster = easier first shot'
        ],
        pros: ['Easy first shot', 'Table control', 'Consistent'],
        cons: ['May not make balls', 'Banned in some leagues']
    },
    {
        id: 'snap-break',
        name: 'Snap Break',
        cuePosition: { x: 30, y: 50 },
        aimPoint: '1-ball with english',
        power: 'full',
        successRate: '75%',
        tips: [
            'Wrist snap at contact',
            'Inside english on cue ball',
            'Maximum power transfer',
            'Used by professionals'
        ],
        pros: ['Best for making 9-ball', 'Pro technique', 'Maximum chaos'],
        cons: ['Hard to master', 'Less control']
    }
];

interface BreakPatternGuideProps {
    defaultGameType?: '8ball' | '9ball';
}

export function BreakPatternGuide({ defaultGameType = '8ball' }: BreakPatternGuideProps) {
    const [gameType, setGameType] = useState<'8ball' | '9ball'>(defaultGameType);
    const [currentIndex, setCurrentIndex] = useState(0);

    const breaks = gameType === '8ball' ? eightBallBreaks : nineBallBreaks;
    const pattern = breaks[currentIndex];

    const nextPattern = () => {
        setCurrentIndex((currentIndex + 1) % breaks.length);
    };

    const prevPattern = () => {
        setCurrentIndex((currentIndex - 1 + breaks.length) % breaks.length);
    };

    const getPowerColor = (power: string) => {
        switch (power) {
            case 'soft': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'hard': return 'bg-orange-500';
            case 'full': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Game Type Selector */}
            <Tabs value={gameType} onValueChange={(v) => { setGameType(v as '8ball' | '9ball'); setCurrentIndex(0); }}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="8ball">🎱 8-Ball</TabsTrigger>
                    <TabsTrigger value="9ball">🟡 9-Ball</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Pattern Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={prevPattern}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-2">
                    {breaks.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`w-3 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-primary scale-125' : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>
                <Button variant="outline" size="icon" onClick={nextPattern}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Pattern Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">{pattern.name}</CardTitle>
                            <CardDescription>{pattern.aimPoint}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="text-green-500">
                                {pattern.successRate} success
                            </Badge>
                            <Badge className={getPowerColor(pattern.power)}>
                                {pattern.power.toUpperCase()}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Visual Diagram */}
                    <div className="relative aspect-[2/1] bg-green-800 rounded-lg overflow-hidden border-4 border-amber-900">
                        {/* Pockets */}
                        {[[0, 0], [50, 0], [100, 0], [0, 100], [50, 100], [100, 100]].map(([x, y], i) => (
                            <div
                                key={i}
                                className="absolute w-4 h-4 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${x}%`, top: `${y}%` }}
                            />
                        ))}

                        {/* Rack */}
                        <div className="absolute right-[20%] top-1/2 -translate-y-1/2">
                            <div className="flex flex-col items-center gap-0.5">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                                <div className="flex gap-0.5">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                                </div>
                                <div className="flex gap-0.5">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                                    <div className="w-3 h-3 bg-black rounded-full border border-white" />
                                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Cue Ball */}
                        <div
                            className="absolute w-4 h-4 bg-white rounded-full border-2 border-gray-300 shadow-lg animate-pulse"
                            style={{
                                left: `${pattern.cuePosition.x}%`,
                                top: `${pattern.cuePosition.y}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />

                        {/* Aim Line */}
                        <div
                            className="absolute h-0.5 bg-white/50"
                            style={{
                                left: `${pattern.cuePosition.x}%`,
                                top: '50%',
                                width: `${80 - pattern.cuePosition.x}%`,
                                transform: 'translateY(-50%)'
                            }}
                        />
                    </div>

                    {/* Tips */}
                    <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm font-medium flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4" />
                            Tips
                        </p>
                        <ul className="space-y-1">
                            {pattern.tips.map((tip, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                    <span className="text-primary">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-green-500/10">
                            <p className="text-sm font-medium text-green-500 mb-2">✓ Pros</p>
                            <ul className="space-y-1">
                                {pattern.pros.map((pro, i) => (
                                    <li key={i} className="text-xs text-muted-foreground">{pro}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/10">
                            <p className="text-sm font-medium text-red-500 mb-2">✗ Cons</p>
                            <ul className="space-y-1">
                                {pattern.cons.map((con, i) => (
                                    <li key={i} className="text-xs text-muted-foreground">{con}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Reference */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">All {gameType === '8ball' ? '8-Ball' : '9-Ball'} Breaks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {breaks.map((b, i) => (
                            <button
                                key={b.id}
                                onClick={() => setCurrentIndex(i)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${i === currentIndex ? 'bg-primary/10 border border-primary' : 'bg-muted hover:bg-muted/80'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Badge className={getPowerColor(b.power)} variant="secondary">
                                        <Zap className="h-3 w-3" />
                                    </Badge>
                                    <span className="font-medium">{b.name}</span>
                                </div>
                                <span className="text-sm text-green-500">{b.successRate}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
