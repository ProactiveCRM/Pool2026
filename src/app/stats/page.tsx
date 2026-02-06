import { Metadata } from 'next';
import { StatsDashboard } from '@/components/player/StatsDashboard';
import { RunOutTracker } from '@/components/player/RunOutTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Flame } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Stats',
    description: 'Your pool performance statistics and run out tracking',
};

export default function StatsPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-lg">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Your Stats</h1>
                    <p className="text-muted-foreground">
                        Performance tracking and run out streaks
                    </p>
                </div>

                <Tabs defaultValue="dashboard" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="dashboard" className="gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="runouts" className="gap-2">
                            <Flame className="h-4 w-4" />
                            Run Outs
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard">
                        <StatsDashboard />
                    </TabsContent>

                    <TabsContent value="runouts">
                        <RunOutTracker
                            onSave={(runOut) => {
                                console.log('Run out saved:', runOut);
                                alert('Run out logged!');
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
