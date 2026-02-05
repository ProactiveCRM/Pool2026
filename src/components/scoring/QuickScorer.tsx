'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Play,
    Pause,
    RotateCcw,
    Trophy,
    User,
    Clock,
    CheckCircle
} from 'lucide-react';

interface Player {
    name: string;
    score: number;
    raceTarget: number;
    timeouts: number;
}

interface QuickScorerProps {
    player1Name?: string;
    player2Name?: string;
    player1Race?: number;
    player2Race?: number;
    onMatchComplete?: (winner: 1 | 2, finalScore: { p1: number; p2: number }) => void;
}

export function QuickScorer({
    player1Name = 'Player 1',
    player2Name = 'Player 2',
    player1Race = 5,
    player2Race = 5,
    onMatchComplete
}: QuickScorerProps) {
    const [player1, setPlayer1] = useState<Player>({
        name: player1Name,
        score: 0,
        raceTarget: player1Race,
        timeouts: 2,
    });

    const [player2, setPlayer2] = useState<Player>({
        name: player2Name,
        score: 0,
        raceTarget: player2Race,
        timeouts: 2,
    });

    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [winner, setWinner] = useState<1 | 2 | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        if (player1.score >= player1.raceTarget) {
            setWinner(1);
            setIsRunning(false);
            onMatchComplete?.(1, { p1: player1.score, p2: player2.score });
        } else if (player2.score >= player2.raceTarget) {
            setWinner(2);
            setIsRunning(false);
            onMatchComplete?.(2, { p1: player1.score, p2: player2.score });
        }
    }, [player1.score, player2.score, player1.raceTarget, player2.raceTarget, onMatchComplete]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const addScore = (player: 1 | 2) => {
        if (winner) return;
        if (!isRunning) setIsRunning(true);

        if (player === 1) {
            setPlayer1(prev => ({ ...prev, score: prev.score + 1 }));
        } else {
            setPlayer2(prev => ({ ...prev, score: prev.score + 1 }));
        }
    };

    const subtractScore = (player: 1 | 2) => {
        if (winner) return;

        if (player === 1) {
            setPlayer1(prev => ({ ...prev, score: Math.max(0, prev.score - 1) }));
        } else {
            setPlayer2(prev => ({ ...prev, score: Math.max(0, prev.score - 1) }));
        }
    };

    const useTimeout = (player: 1 | 2) => {
        if (player === 1 && player1.timeouts > 0) {
            setPlayer1(prev => ({ ...prev, timeouts: prev.timeouts - 1 }));
        } else if (player === 2 && player2.timeouts > 0) {
            setPlayer2(prev => ({ ...prev, timeouts: prev.timeouts - 1 }));
        }
    };

    const resetMatch = () => {
        setPlayer1(prev => ({ ...prev, score: 0, timeouts: 2 }));
        setPlayer2(prev => ({ ...prev, score: 0, timeouts: 2 }));
        setTimer(0);
        setIsRunning(false);
        setWinner(null);
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Quick Scorer
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-lg">{formatTime(timer)}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsRunning(!isRunning)}
                            className="h-8 w-8"
                        >
                            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetMatch}
                            className="h-8 w-8"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {winner && (
                    <div className="p-4 bg-yellow-500/20 border-b border-yellow-500/30 text-center">
                        <div className="flex items-center justify-center gap-2 text-lg font-bold">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            {winner === 1 ? player1.name : player2.name} Wins!
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 divide-x">
                    {/* Player 1 */}
                    <div className={`p-6 ${winner === 1 ? 'bg-green-500/10' : ''}`}>
                        <div className="text-center space-y-4">
                            <div>
                                <p className="font-medium text-lg">{player1.name}</p>
                                <Badge variant="outline">Race to {player1.raceTarget}</Badge>
                            </div>

                            <div
                                className="text-7xl font-bold cursor-pointer select-none transition-transform active:scale-95"
                                onClick={() => addScore(1)}
                            >
                                {player1.score}
                            </div>

                            <div className="flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => subtractScore(1)}
                                    disabled={player1.score === 0 || !!winner}
                                >
                                    -1
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => addScore(1)}
                                    disabled={!!winner}
                                >
                                    +1
                                </Button>
                            </div>

                            <div className="pt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => useTimeout(1)}
                                    disabled={player1.timeouts === 0}
                                    className="text-xs"
                                >
                                    Timeout ({player1.timeouts} left)
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Player 2 */}
                    <div className={`p-6 ${winner === 2 ? 'bg-green-500/10' : ''}`}>
                        <div className="text-center space-y-4">
                            <div>
                                <p className="font-medium text-lg">{player2.name}</p>
                                <Badge variant="outline">Race to {player2.raceTarget}</Badge>
                            </div>

                            <div
                                className="text-7xl font-bold cursor-pointer select-none transition-transform active:scale-95"
                                onClick={() => addScore(2)}
                            >
                                {player2.score}
                            </div>

                            <div className="flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => subtractScore(2)}
                                    disabled={player2.score === 0 || !!winner}
                                >
                                    -1
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => addScore(2)}
                                    disabled={!!winner}
                                >
                                    +1
                                </Button>
                            </div>

                            <div className="pt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => useTimeout(2)}
                                    disabled={player2.timeouts === 0}
                                    className="text-xs"
                                >
                                    Timeout ({player2.timeouts} left)
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
