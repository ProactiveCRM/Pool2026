'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { createLeague } from '@/lib/actions/leagues';
import {
    type GameType,
    type LeagueFormat,
    GAME_TYPE_LABELS,
    FORMAT_LABELS,
} from '@/types/leagues';

export default function CreateLeaguePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [gameType, setGameType] = useState<GameType>('8-ball');
    const [format, setFormat] = useState<LeagueFormat>('team');
    const [seasonName, setSeasonName] = useState('');
    const [seasonStart, setSeasonStart] = useState('');
    const [maxTeams, setMaxTeams] = useState('12');
    const [teamFee, setTeamFee] = useState('');
    const [rules, setRules] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter a league name');
            return;
        }

        setIsLoading(true);

        try {
            const result = await createLeague({
                name: name.trim(),
                description: description.trim() || undefined,
                game_type: gameType,
                format,
                season_name: seasonName.trim() || undefined,
                season_start: seasonStart || undefined,
                max_teams: parseInt(maxTeams) || 12,
                team_fee: teamFee ? parseFloat(teamFee) : undefined,
                rules: rules.trim() || undefined,
            });

            if (result.success && result.league) {
                toast.success('🏆 League created!', {
                    description: 'Now add teams and schedule matches.',
                });
                router.push(`/leagues/${result.league.slug}`);
            } else {
                toast.error(result.error || 'Failed to create league');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href="/leagues"
                    className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to leagues
                </Link>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Create a League</CardTitle>
                                <CardDescription>
                                    Set up a new pool league for your community
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* League Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">League Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Downtown 8-Ball League"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Game Type */}
                            <div className="space-y-2">
                                <Label>Game Type *</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {(Object.keys(GAME_TYPE_LABELS) as GameType[]).slice(0, 4).map((type) => (
                                        <Button
                                            key={type}
                                            type="button"
                                            variant={gameType === type ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setGameType(type)}
                                            className="justify-start"
                                        >
                                            {GAME_TYPE_LABELS[type]}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Format */}
                            <div className="space-y-2">
                                <Label>Format *</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(FORMAT_LABELS) as LeagueFormat[]).map((f) => (
                                        <Button
                                            key={f}
                                            type="button"
                                            variant={format === f ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setFormat(f)}
                                        >
                                            {FORMAT_LABELS[f]}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Season Info */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="seasonName">Season Name</Label>
                                    <Input
                                        id="seasonName"
                                        placeholder="e.g. Spring 2024"
                                        value={seasonName}
                                        onChange={(e) => setSeasonName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="seasonStart">Start Date</Label>
                                    <Input
                                        id="seasonStart"
                                        type="date"
                                        value={seasonStart}
                                        onChange={(e) => setSeasonStart(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Team Settings */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="maxTeams">Max Teams</Label>
                                    <Input
                                        id="maxTeams"
                                        type="number"
                                        min="2"
                                        max="64"
                                        value={maxTeams}
                                        onChange={(e) => setMaxTeams(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="teamFee">Team Fee ($)</Label>
                                    <Input
                                        id="teamFee"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Optional"
                                        value={teamFee}
                                        onChange={(e) => setTeamFee(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Tell players about your league..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Rules */}
                            <div className="space-y-2">
                                <Label htmlFor="rules">Rules & Guidelines</Label>
                                <Textarea
                                    id="rules"
                                    placeholder="League rules, scoring system, etc."
                                    value={rules}
                                    onChange={(e) => setRules(e.target.value)}
                                    rows={4}
                                />
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
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="mr-2 h-4 w-4" />
                                        Create League
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
