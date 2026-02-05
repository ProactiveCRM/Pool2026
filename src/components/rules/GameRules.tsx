'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BookOpen,
    Target,
    CircleDot,
    Layers,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';

interface GameRule {
    id: string;
    title: string;
    description: string;
    details?: string[];
}

interface GameType {
    id: string;
    name: string;
    icon: string;
    description: string;
    objective: string;
    ballCount: number;
    racking: string;
    breakRules: string[];
    legalShots: string[];
    fouls: string[];
    winning: string;
}

const gameTypes: GameType[] = [
    {
        id: '8ball',
        name: '8-Ball',
        icon: '🎱',
        description: 'The most popular pool game worldwide. Players are assigned stripes or solids after the break.',
        objective: 'Pocket all your assigned balls (stripes or solids), then legally pocket the 8-ball.',
        ballCount: 16,
        racking: 'Triangle rack with 8-ball in center. One stripe and one solid in back corners.',
        breakRules: [
            'Cue ball behind headstring',
            'Must hit head ball first',
            'Four balls must hit cushions OR a ball must be pocketed',
            'Scratching on break is ball-in-hand behind headstring',
        ],
        legalShots: [
            'Must hit your group first',
            'Must pocket a ball OR drive any ball to a cushion',
            'Combination shots are legal if you hit your ball first',
        ],
        fouls: [
            'Scratching (cue ball in pocket)',
            'Hitting opponent\'s ball first',
            'Failing to hit any ball',
            'Jumping cue ball off table',
            'Double-hitting the cue ball',
        ],
        winning: 'Legally pocket the 8-ball in the called pocket after clearing your group.',
    },
    {
        id: '9ball',
        name: '9-Ball',
        icon: '🟡',
        description: 'A fast-paced rotation game. Balls must be hit in numerical order.',
        objective: 'Legally pocket the 9-ball to win. Can be done at any time via combination.',
        ballCount: 10,
        racking: 'Diamond rack with 1-ball at apex, 9-ball in center. Other balls placed randomly.',
        breakRules: [
            'Cue ball behind headstring',
            'Must hit the 1-ball first',
            'One ball must be pocketed OR four balls hit cushions',
            'Making the 9-ball on break wins the game',
        ],
        legalShots: [
            'Must hit lowest numbered ball first',
            'Any ball can be pocketed (no call shot)',
            'Push out available after break',
            'Combination shots are legal',
        ],
        fouls: [
            'Scratching',
            'Not hitting lowest ball first',
            'No ball contacts cushion after contact',
            'Jumping cue ball off table',
        ],
        winning: 'Legally pocket the 9-ball at any time.',
    },
    {
        id: '10ball',
        name: '10-Ball',
        icon: '🔵',
        description: 'Similar to 9-ball but with called shots and ten balls. More skill-based.',
        objective: 'Legally pocket the 10-ball in the called pocket.',
        ballCount: 11,
        racking: 'Triangle rack with 1-ball at apex, 10-ball in center. 2 and 3 on wings.',
        breakRules: [
            'Cue ball behind headstring',
            'Must hit the 1-ball first',
            'Three balls must hit cushions OR a ball pocketed',
            'If 10-ball made on break, it spots',
        ],
        legalShots: [
            'Must hit lowest numbered ball first',
            'All shots must be called (ball and pocket)',
            'Obvious shots don\'t need to be called',
            'Combination shots are legal with call',
        ],
        fouls: [
            'Scratching',
            'Not hitting lowest ball first',
            'No cushion contact after hit',
            'Wrong ball pocketed without calling',
        ],
        winning: 'Legally pocket the 10-ball in the called pocket.',
    },
];

export function GameRules() {
    const [selectedGame, setSelectedGame] = useState('8ball');
    const currentGame = gameTypes.find(g => g.id === selectedGame)!;

    return (
        <div className="space-y-6">
            {/* Game Type Selector */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {gameTypes.map(game => (
                    <Card
                        key={game.id}
                        className={`cursor-pointer transition-all min-w-[150px] ${selectedGame === game.id ? 'border-primary ring-2 ring-primary/20' : ''
                            }`}
                        onClick={() => setSelectedGame(game.id)}
                    >
                        <CardContent className="pt-4 text-center">
                            <span className="text-3xl">{game.icon}</span>
                            <p className="font-semibold mt-2">{game.name}</p>
                            <p className="text-xs text-muted-foreground">{game.ballCount} balls</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Game Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {currentGame.name} Rules
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">{currentGame.description}</p>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <p className="font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Objective
                        </p>
                        <p className="text-sm mt-1">{currentGame.objective}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Rules */}
            <Tabs defaultValue="break">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="break">Break</TabsTrigger>
                    <TabsTrigger value="legal">Legal Shots</TabsTrigger>
                    <TabsTrigger value="fouls">Fouls</TabsTrigger>
                    <TabsTrigger value="winning">Winning</TabsTrigger>
                </TabsList>

                <TabsContent value="break">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                Breaking Rules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 p-3 rounded-lg bg-muted">
                                <p className="text-sm font-medium">Racking</p>
                                <p className="text-sm text-muted-foreground">{currentGame.racking}</p>
                            </div>
                            <ul className="space-y-2">
                                {currentGame.breakRules.map((rule, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <CircleDot className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="legal">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Legal Shot Requirements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {currentGame.legalShots.map((rule, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                                        {rule}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="fouls">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                Fouls
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {currentGame.fouls.map((foul, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <XCircle className="h-4 w-4 mt-0.5 text-red-500 flex-shrink-0" />
                                        {foul}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm font-medium text-red-500">Foul Penalty</p>
                                <p className="text-sm text-muted-foreground">
                                    Ball-in-hand for opponent anywhere on the table.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="winning">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-yellow-500" />
                                Winning the Game
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <p className="font-medium">{currentGame.winning}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
