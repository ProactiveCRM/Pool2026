import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchCalendar, demoMatches } from '@/components/leagues/MatchCalendar';
import { StatsDashboard, demoPerformanceData, demoGameTypeStats, demoRecentForm } from '@/components/stats/StatsDashboard';
import { Calendar, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
    title: 'My Schedule & Stats',
    description: 'View your match schedule and performance statistics',
};

export default function SchedulePage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Schedule & Stats</h1>
                    <p className="text-muted-foreground">
                        Track your upcoming matches and analyze your performance
                    </p>
                </div>

                <Tabs defaultValue="schedule" className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="schedule" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Schedule
                        </TabsTrigger>
                        <TabsTrigger value="stats" className="gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Stats
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="schedule">
                        <MatchCalendar
                            matches={demoMatches}
                            onDateSelect={(date) => console.log('Selected:', date)}
                            onMatchClick={(match) => console.log('Match:', match)}
                        />
                    </TabsContent>

                    <TabsContent value="stats">
                        <StatsDashboard
                            performanceData={demoPerformanceData}
                            gameTypeStats={demoGameTypeStats}
                            currentStreak={4}
                            bestStreak={12}
                            totalGames={156}
                            winRate={62.8}
                            winRateChange={5.2}
                            recentForm={demoRecentForm}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
