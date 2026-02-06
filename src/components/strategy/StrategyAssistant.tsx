'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Lightbulb,
    Target,
    Shield,
    Zap,
    ArrowRight,
    RotateCcw
} from 'lucide-react';

interface GameScenario {
    id: string;
    title: string;
    description: string;
    situation: string;
    options: StrategyOption[];
    bestChoice: string;
}

interface StrategyOption {
    id: string;
    name: string;
    description: string;
    risk: 'low' | 'medium' | 'high';
    reward: 'low' | 'medium' | 'high';
    explanation: string;
}

const scenarios: GameScenario[] = [
    {
        id: 'behind',
        title: 'Playing From Behind',
        description: 'You\'re down 4-6 in a race to 7',
        situation: 'Your opponent needs 1 game to win. You need 3. What\'s your strategy?',
        options: [
            {
                id: 'aggressive',
                name: 'Go All-In',
                description: 'Attempt every shot, take risks',
                risk: 'high',
                reward: 'high',
                explanation: 'When behind significantly, controlled aggression can turn momentum. Make balls and build confidence.'
            },
            {
                id: 'safe',
                name: 'Play Safe',
                description: 'Focus on leaving tough shots',
                risk: 'low',
                reward: 'medium',
                explanation: 'Force errors. At hill-hill (6-6) pressure often causes mistakes. Make them earn it.'
            },
            {
                id: 'balanced',
                name: 'Smart Aggression',
                description: 'Take good shots, pass on bad ones',
                risk: 'medium',
                reward: 'medium',
                explanation: 'Best overall approach. Take high-percentage shots but don\'t force impossible ones.'
            }
        ],
        bestChoice: 'balanced'
    },
    {
        id: 'no-shot',
        title: 'No Clear Shot',
        description: 'Object ball is blocked',
        situation: 'Your ball is behind two of opponent\'s balls. What do you do?',
        options: [
            {
                id: 'kick',
                name: 'Kick Shot',
                description: 'Bank off the rail to hit your ball',
                risk: 'medium',
                reward: 'high',
                explanation: 'If you see a clean kick, go for it. Practice kick shots regularly so this becomes reliable.'
            },
            {
                id: 'safety',
                name: 'Play Safe',
                description: 'Hide cue ball behind blockers',
                risk: 'low',
                reward: 'medium',
                explanation: 'Often the smartest play. Give opponent the same problem and force their error.'
            },
            {
                id: 'combo',
                name: 'Combination Shot',
                description: 'Use opponent\'s ball to make yours',
                risk: 'high',
                reward: 'high',
                explanation: 'Risky but can be devastating when it works. Only if the combo is clearly makeable.'
            }
        ],
        bestChoice: 'safety'
    },
    {
        id: 'early-8',
        title: '8-Ball Decision',
        description: 'Clear path to 8, but table still has your balls',
        situation: '8-ball is makeable, but 3 of your balls remain. Shoot 8?',
        options: [
            {
                id: 'clear-first',
                name: 'Clear Table First',
                description: 'Run your remaining balls, then 8',
                risk: 'medium',
                reward: 'high',
                explanation: 'Standard play. Don\'t get greedy. Your balls could block opponent or give you outs.'
            },
            {
                id: 'shoot-8',
                name: 'Shoot the 8',
                description: 'Go for the win now',
                risk: 'high',
                reward: 'high',
                explanation: 'Only if you\'re certain AND have good position. Miss = you might lose right there.'
            },
            {
                id: 'play-safe',
                name: 'Safety on 8',
                description: 'Hide the 8-ball from opponent',
                risk: 'low',
                reward: 'medium',
                explanation: 'If uncertain, a safety gives you another chance and puts pressure on opponent.'
            }
        ],
        bestChoice: 'clear-first'
    },
    {
        id: 'break-cluster',
        title: 'Ball Clusters',
        description: 'Three balls are tied up together',
        situation: 'You have a runnable table except for a 3-ball cluster. How do you handle it?',
        options: [
            {
                id: 'early-break',
                name: 'Break Early',
                description: 'Use first good shot to break cluster',
                risk: 'medium',
                reward: 'high',
                explanation: 'Smart players break clusters early while they have options. Don\'t wait until forced.'
            },
            {
                id: 'run-around',
                name: 'Avoid It',
                description: 'Run other balls, hope for opening',
                risk: 'high',
                reward: 'low',
                explanation: 'Risky. You might run out of "free" balls and be stuck. Clusters rarely fix themselves.'
            },
            {
                id: 'soft-break',
                name: 'Gentle Touch',
                description: 'Softly clip cluster for minimal change',
                risk: 'medium',
                reward: 'medium',
                explanation: 'Good for separating 2.balls. Hit thin with controlled speed for predictable results.'
            }
        ],
        bestChoice: 'early-break'
    }
];

export function StrategyAssistant() {
    const [currentScenario, setCurrentScenario] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);

    const scenario = scenarios[currentScenario];

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'high': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getRewardColor = (reward: string) => {
        switch (reward) {
            case 'low': return 'text-gray-500';
            case 'medium': return 'text-yellow-500';
            case 'high': return 'text-green-500';
            default: return 'text-gray-500';
        }
    };

    const nextScenario = () => {
        setCurrentScenario((currentScenario + 1) % scenarios.length);
        setSelectedOption(null);
        setShowAnswer(false);
    };

    const resetQuiz = () => {
        setCurrentScenario(0);
        setSelectedOption(null);
        setShowAnswer(false);
    };

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between">
                <Badge variant="outline">
                    Scenario {currentScenario + 1} of {scenarios.length}
                </Badge>
                <div className="flex gap-2">
                    {scenarios.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setCurrentScenario(i); setSelectedOption(null); setShowAnswer(false); }}
                            className={`w-3 h-3 rounded-full transition-all ${i === currentScenario ? 'bg-primary scale-125' : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Scenario */}
            <Card>
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Lightbulb className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>{scenario.title}</CardTitle>
                            <CardDescription>{scenario.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted">
                        <p className="font-medium">{scenario.situation}</p>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {scenario.options.map(option => {
                            const isSelected = selectedOption === option.id;
                            const isBest = option.id === scenario.bestChoice;
                            const showResult = showAnswer && isSelected;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedOption(option.id)}
                                    disabled={showAnswer}
                                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${showAnswer && isBest ? 'border-green-500 bg-green-500/10' :
                                            showResult && !isBest ? 'border-red-500 bg-red-500/10' :
                                                isSelected ? 'border-primary bg-primary/5' :
                                                    'border-muted hover:border-muted-foreground/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{option.name}</span>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className={getRiskColor(option.risk)}>
                                                Risk: {option.risk}
                                            </Badge>
                                            <span className={`text-sm ${getRewardColor(option.reward)}`}>
                                                ★ {option.reward}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{option.description}</p>

                                    {showAnswer && isBest && (
                                        <div className="mt-3 p-2 rounded bg-green-500/10 text-sm">
                                            <span className="font-medium text-green-500">✓ Best Choice: </span>
                                            {option.explanation}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!showAnswer ? (
                            <Button
                                className="flex-1"
                                disabled={!selectedOption}
                                onClick={() => setShowAnswer(true)}
                            >
                                <Target className="h-4 w-4 mr-2" />
                                Check Answer
                            </Button>
                        ) : (
                            <Button className="flex-1" onClick={nextScenario}>
                                Next Scenario
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* All Scenarios */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Strategy Scenarios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {scenarios.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => { setCurrentScenario(i); setSelectedOption(null); setShowAnswer(false); }}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${i === currentScenario ? 'bg-primary/10' : 'hover:bg-muted'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Badge variant={i === currentScenario ? 'default' : 'outline'}>
                                        {i + 1}
                                    </Badge>
                                    <span className="text-sm">{s.title}</span>
                                </div>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Reset */}
            <Button variant="outline" onClick={resetQuiz} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
            </Button>
        </div>
    );
}
