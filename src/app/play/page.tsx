import { Metadata } from 'next';
import { TableTimer } from '@/components/venues/TableTimer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Play',
    description: 'Track your table time and costs',
};

export default function PlayPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4 max-w-lg">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Play Session</h1>
                    <p className="text-muted-foreground">
                        Track your table time and rental costs
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Current Venue */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="h-4 w-4" />
                                Current Venue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">Breakers Billiards</p>
                            <p className="text-sm text-muted-foreground">
                                1234 Main St, Austin, TX
                            </p>
                        </CardContent>
                    </Card>

                    {/* Table Timer */}
                    <TableTimer
                        hourlyRate={12}
                        warningMinutes={50}
                        onTimeUpdate={(minutes, cost) => {
                            console.log(`Time: ${minutes}min, Cost: $${cost.toFixed(2)}`);
                        }}
                    />

                    {/* Quick Tips */}
                    <Card className="bg-muted/30">
                        <CardContent className="pt-4">
                            <p className="text-sm font-medium mb-2">💡 Tips</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Timer warns 10 minutes before next hour</li>
                                <li>• Pause timer during breaks</li>
                                <li>• Cost updates automatically</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
