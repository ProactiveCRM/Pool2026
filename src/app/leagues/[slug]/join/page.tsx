'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Users, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { getLeagueBySlug, createTeam } from '@/lib/actions/leagues';
import type { League } from '@/types/leagues';
import { GAME_TYPE_LABELS } from '@/types/leagues';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function JoinLeaguePage({ params }: PageProps) {
    const router = useRouter();
    const [league, setLeague] = useState<League | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingLeague, setIsLoadingLeague] = useState(true);

    // Form state
    const [teamName, setTeamName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        async function loadLeague() {
            const { slug } = await params;
            const leagueData = await getLeagueBySlug(slug);
            setLeague(leagueData);
            setIsLoadingLeague(false);
        }
        loadLeague();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!league) return;

        if (!teamName.trim()) {
            toast.error('Please enter a team name');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createTeam({
                league_id: league.id,
                name: teamName.trim(),
                description: description.trim() || undefined,
            });

            if (result.success) {
                toast.success('🎱 Team registered!', {
                    description: `${teamName} is now in the league.`,
                });
                router.push(`/leagues/${league.slug}`);
            } else {
                toast.error(result.error || 'Failed to register team');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingLeague) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!league) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="text-center p-8">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">League not found</h2>
                        <Button asChild>
                            <Link href="/leagues">Browse Leagues</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (league.status !== 'registration') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="text-center p-8 max-w-md">
                    <CardContent>
                        <h2 className="text-xl font-semibold mb-2">Registration Closed</h2>
                        <p className="text-muted-foreground mb-4">
                            This league is not currently accepting new teams.
                        </p>
                        <Button asChild>
                            <Link href={`/leagues/${league.slug}`}>View League</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href={`/leagues/${league.slug}`}
                    className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to {league.name}
                </Link>

                {/* League Info Card */}
                <Card className="mb-6 bg-primary/5 border-primary/20">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">{league.name}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {GAME_TYPE_LABELS[league.game_type]}
                                </p>
                            </div>
                            <div className="text-right text-sm">
                                <p className="text-muted-foreground">Max {league.max_teams} teams</p>
                                {league.team_fee && (
                                    <p className="font-medium">${league.team_fee} / team</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Registration Form */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <UserPlus className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Register Your Team</CardTitle>
                                <CardDescription>
                                    Create a team to join this league
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Team Name */}
                            <div className="space-y-2">
                                <Label htmlFor="teamName">Team Name *</Label>
                                <Input
                                    id="teamName"
                                    placeholder="e.g. The Sharks"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Team Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tell others about your team..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Info */}
                            <div className="bg-muted/30 rounded-lg p-4 text-sm">
                                <p className="flex items-center gap-2 mb-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="font-medium">You&apos;ll be the team captain</span>
                                </p>
                                <p className="text-muted-foreground">
                                    As captain, you can invite players, manage your roster, and submit match scores.
                                </p>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Register Team
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
