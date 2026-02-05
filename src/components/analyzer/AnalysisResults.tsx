'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, Circle } from 'lucide-react';
import type { AnalysisResult, ShotSuggestion } from '@/lib/actions/analyze-shot';

interface AnalysisResultsProps {
    result: AnalysisResult;
    imageUrl: string;
}

const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const pocketPositions: Record<string, { x: number; y: number }> = {
    'top-left': { x: 5, y: 5 },
    'top-center': { x: 50, y: 5 },
    'top-right': { x: 95, y: 5 },
    'bottom-left': { x: 5, y: 95 },
    'bottom-center': { x: 50, y: 95 },
    'bottom-right': { x: 95, y: 95 },
    'side-left': { x: 5, y: 50 },
    'side-right': { x: 95, y: 50 },
};

export function AnalysisResults({ result, imageUrl }: AnalysisResultsProps) {
    const { balls, suggestions, gameState } = result;

    return (
        <div className="space-y-6">
            {/* Table Visualization */}
            <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Table Analysis
                </h3>
                <div className="relative aspect-[2/1] bg-green-800 rounded-lg overflow-hidden">
                    {/* Background image */}
                    <img
                        src={imageUrl}
                        alt="Pool table"
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />

                    {/* Table overlay */}
                    <div className="absolute inset-2 border-4 border-brown-600 rounded">
                        {/* Pockets */}
                        {Object.entries(pocketPositions).map(([name, pos]) => (
                            <div
                                key={name}
                                className="absolute w-4 h-4 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                            />
                        ))}

                        {/* Balls */}
                        {balls?.map((ball, index) => (
                            <div
                                key={index}
                                className="absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-white/30"
                                style={{
                                    left: `${ball.x}%`,
                                    top: `${ball.y}%`,
                                    backgroundColor: ball.type === 'cue' ? 'white' :
                                        ball.type === '8ball' ? 'black' :
                                            ball.color || '#666',
                                    color: ball.type === 'cue' || ball.color === 'yellow' ? 'black' : 'white',
                                }}
                            >
                                {ball.number || (ball.type === 'cue' ? '●' : '')}
                            </div>
                        ))}
                    </div>
                </div>

                {gameState && (
                    <p className="mt-3 text-sm text-muted-foreground">
                        <strong>Game State:</strong> {gameState}
                    </p>
                )}
            </Card>

            {/* Shot Suggestions */}
            <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    Recommended Shots
                </h3>
                <div className="space-y-3">
                    {suggestions?.map((shot, index) => (
                        <ShotCard key={index} shot={shot} rank={index + 1} />
                    ))}
                    {(!suggestions || suggestions.length === 0) && (
                        <p className="text-sm text-muted-foreground">
                            No shot suggestions available
                        </p>
                    )}
                </div>
            </Card>

            {/* Ball Count */}
            <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Circle className="w-4 h-4 text-primary" />
                    Detected Balls ({balls?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                    {balls?.map((ball, index) => (
                        <Badge
                            key={index}
                            variant="outline"
                            className="gap-1"
                            style={{
                                borderColor: ball.type === 'cue' ? '#ccc' : ball.color,
                            }}
                        >
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                    backgroundColor: ball.type === 'cue' ? 'white' :
                                        ball.type === '8ball' ? 'black' :
                                            ball.color,
                                    border: ball.type === 'cue' ? '1px solid #ccc' : 'none',
                                }}
                            />
                            {ball.type === 'cue' ? 'Cue' :
                                ball.type === '8ball' ? '8-Ball' :
                                    `${ball.number || '?'} (${ball.type})`}
                        </Badge>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function ShotCard({ shot, rank }: { shot: ShotSuggestion; rank: number }) {
    return (
        <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                        {rank}
                    </span>
                    <div>
                        <p className="font-medium">
                            Ball {shot.targetBall} → {shot.pocketTarget}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {shot.description}
                        </p>
                    </div>
                </div>
                <Badge className={difficultyColors[shot.difficulty]}>
                    {shot.difficulty}
                </Badge>
            </div>
        </div>
    );
}
