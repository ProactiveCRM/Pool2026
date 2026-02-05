import { Metadata } from 'next';
import { LeagueStandings, demoStandings } from '@/components/leagues/LeagueStandings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';

export const metadata: Metadata = {
    title: 'League Standings Demo',
    description: 'View league standings and team rankings',
};

export default function StandingsDemoPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="py-8 border-b border-border">
                <div className="container mx-auto px-4">
                    <Button variant="ghost" size="sm" asChild className="mb-4">
                        <Link href="/leagues">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Leagues
                        </Link>
                    </Button>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <Badge variant="secondary" className="mb-2">🏆 Season 2024</Badge>
                            <h1 className="text-3xl font-bold">Austin 8-Ball Championship</h1>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Austin, TX
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    8 Teams
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Week 14 of 18
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">View Schedule</Button>
                            <Button>Join League</Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Standings */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <LeagueStandings
                        standings={demoStandings}
                        leagueName="Austin 8-Ball Championship"
                    />
                </div>
            </section>
        </div>
    );
}
