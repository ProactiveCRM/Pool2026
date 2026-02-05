import { Metadata } from 'next';
import { TournamentBracket, demoTournamentMatches } from '@/components/tournaments/TournamentBracket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Tournaments',
    description: 'View and join pool tournaments',
};

const upcomingTournaments = [
    {
        id: '1',
        name: 'Austin Open 8-Ball Championship',
        date: 'Feb 15, 2026',
        time: '6:00 PM',
        venue: 'Championship Billiards',
        format: '8-Ball, Single Elimination',
        entryFee: '$50',
        prizePool: '$1,000',
        spotsLeft: 4,
        totalSpots: 32,
    },
    {
        id: '2',
        name: 'Weekly 9-Ball Showdown',
        date: 'Feb 8, 2026',
        time: '7:00 PM',
        venue: 'The Rack Room',
        format: '9-Ball, Double Elimination',
        entryFee: '$25',
        prizePool: '$400',
        spotsLeft: 8,
        totalSpots: 16,
    },
    {
        id: '3',
        name: 'Spring League Playoffs',
        date: 'Mar 1, 2026',
        time: '5:00 PM',
        venue: 'Downtown Billiards',
        format: '8-Ball, Best of 5',
        entryFee: 'League Members Only',
        prizePool: '$2,500',
        spotsLeft: 0,
        totalSpots: 16,
    },
];

export default function TournamentsPage() {
    return (
        <div className="min-h-screen bg-background py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Tournaments</h1>
                    <p className="text-muted-foreground">
                        Compete in tournaments and prove you&apos;re the best
                    </p>
                </div>

                {/* Active Tournament Bracket */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Live Tournament
                    </h2>
                    <TournamentBracket
                        matches={demoTournamentMatches}
                        tournamentName="Austin Winter Classic 2026"
                        rounds={3}
                    />
                </div>

                {/* Upcoming Tournaments */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Tournaments
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingTournaments.map(tournament => (
                            <Card key={tournament.id} className="overflow-hidden">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{tournament.name}</CardTitle>
                                    <Badge variant="outline">{tournament.format}</Badge>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {tournament.date}
                                        <Clock className="h-4 w-4 ml-2" />
                                        {tournament.time}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        {tournament.venue}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4" />
                                        {tournament.spotsLeft > 0
                                            ? `${tournament.spotsLeft} spots left of ${tournament.totalSpots}`
                                            : 'Full'
                                        }
                                    </div>

                                    <div className="pt-3 border-t flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-muted-foreground">Entry</div>
                                            <div className="font-semibold">{tournament.entryFee}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Prize</div>
                                            <div className="font-semibold text-primary">{tournament.prizePool}</div>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full mt-2"
                                        disabled={tournament.spotsLeft === 0}
                                    >
                                        {tournament.spotsLeft > 0 ? 'Register Now' : 'Waitlist'}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
