'use client';

import { ShotTracker } from '@/components/practice/ShotTracker';
import { CueBallControl } from '@/components/practice/CueBallControl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Crosshair } from 'lucide-react';

export default function TrainingPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-lg">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Training</h1>
                    <p className="text-muted-foreground">
                        Track your shots and practice fundamentals
                    </p>
                </div>

                <Tabs defaultValue="shots" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="shots" className="gap-2">
                            <Target className="h-4 w-4" />
                            Shot Tracker
                        </TabsTrigger>
                        <TabsTrigger value="cueball" className="gap-2">
                            <Crosshair className="h-4 w-4" />
                            Cue Ball Control
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="shots">
                        <ShotTracker
                            onSessionEnd={(stats) => {
                                console.log('Session ended:', stats);
                                alert('Training session saved!');
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="cueball">
                        <CueBallControl
                            onComplete={(results) => {
                                console.log('Training complete:', results);
                                alert('Cue ball training saved!');
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

