'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Calculator,
    Scale,
    Target,
    Info,
    ArrowRight
} from 'lucide-react';

interface HandicapCalculatorProps {
    onCalculate?: (result: HandicapResult) => void;
}

interface HandicapResult {
    player1Handicap: number;
    player2Handicap: number;
    raceLength: number;
    player1Race: number;
    player2Race: number;
    advantage: string;
}

const skillLevels = [
    { level: 1, description: 'Beginner', gamesNeeded: 14 },
    { level: 2, description: 'Novice', gamesNeeded: 19 },
    { level: 3, description: 'Low Intermediate', gamesNeeded: 25 },
    { level: 4, description: 'Intermediate', gamesNeeded: 31 },
    { level: 5, description: 'High Intermediate', gamesNeeded: 38 },
    { level: 6, description: 'Low Advanced', gamesNeeded: 46 },
    { level: 7, description: 'Advanced', gamesNeeded: 55 },
    { level: 8, description: 'Expert', gamesNeeded: 65 },
    { level: 9, description: 'Professional', gamesNeeded: 75 },
];

export function HandicapCalculator({ onCalculate }: HandicapCalculatorProps) {
    const [player1Skill, setPlayer1Skill] = useState<number>(5);
    const [player2Skill, setPlayer2Skill] = useState<number>(5);
    const [result, setResult] = useState<HandicapResult | null>(null);

    const calculateHandicap = () => {
        const p1Info = skillLevels.find(s => s.level === player1Skill)!;
        const p2Info = skillLevels.find(s => s.level === player2Skill)!;

        // Standard BCA handicap calculation
        const baseRace = 5;
        const diff = player1Skill - player2Skill;

        let player1Race = baseRace;
        let player2Race = baseRace;

        if (diff > 0) {
            // Player 1 is stronger
            player1Race = baseRace + Math.floor(diff / 2);
            player2Race = baseRace - Math.ceil(diff / 2);
        } else if (diff < 0) {
            // Player 2 is stronger
            player1Race = baseRace - Math.ceil(Math.abs(diff) / 2);
            player2Race = baseRace + Math.floor(Math.abs(diff) / 2);
        }

        // Minimum race is 2
        player1Race = Math.max(2, player1Race);
        player2Race = Math.max(2, player2Race);

        const newResult: HandicapResult = {
            player1Handicap: player1Skill,
            player2Handicap: player2Skill,
            raceLength: baseRace,
            player1Race,
            player2Race,
            advantage: diff === 0 ? 'Even match' :
                diff > 0 ? 'Player 2 receives handicap' : 'Player 1 receives handicap',
        };

        setResult(newResult);
        onCalculate?.(newResult);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Handicap Calculator
                    </CardTitle>
                    <CardDescription>
                        Calculate race lengths based on skill levels
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Skill Level Inputs */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label>Player 1 Skill Level</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                                    <Button
                                        key={level}
                                        variant={player1Skill === level ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPlayer1Skill(level)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {level}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {skillLevels.find(s => s.level === player1Skill)?.description}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label>Player 2 Skill Level</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                                    <Button
                                        key={level}
                                        variant={player2Skill === level ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setPlayer2Skill(level)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {level}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {skillLevels.find(s => s.level === player2Skill)?.description}
                            </p>
                        </div>
                    </div>

                    <Button onClick={calculateHandicap} className="w-full">
                        <Scale className="h-4 w-4 mr-2" />
                        Calculate Handicap
                    </Button>

                    {/* Result */}
                    {result && (
                        <div className="p-4 rounded-lg bg-muted space-y-4">
                            <div className="flex items-center justify-center gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Player 1</p>
                                    <p className="text-3xl font-bold text-primary">
                                        Race to {result.player1Race}
                                    </p>
                                    <Badge variant="outline">SL {result.player1Handicap}</Badge>
                                </div>
                                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Player 2</p>
                                    <p className="text-3xl font-bold text-primary">
                                        Race to {result.player2Race}
                                    </p>
                                    <Badge variant="outline">SL {result.player2Handicap}</Badge>
                                </div>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                {result.advantage}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Skill Level Reference */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Skill Level Guide
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        {skillLevels.map(skill => (
                            <div key={skill.level} className="flex items-center gap-2">
                                <Badge variant="outline" className="w-6 justify-center">
                                    {skill.level}
                                </Badge>
                                <span className="text-muted-foreground">{skill.description}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
