'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getMyProfile, updateProfile } from '@/lib/actions/profiles';
import type { PlayerProfile, SkillLevel } from '@/types/profiles';
import { SKILL_LEVEL_LABELS, TABLE_SIZE_LABELS } from '@/types/profiles';

export default function EditProfilePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<PlayerProfile | null>(null);

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [primaryGame, setPrimaryGame] = useState('');
    const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('');
    const [yearsPlaying, setYearsPlaying] = useState('');
    const [lookingForGames, setLookingForGames] = useState(false);
    const [lookingForTeam, setLookingForTeam] = useState(false);
    const [lookingForLeague, setLookingForLeague] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            const data = await getMyProfile();
            if (data) {
                setProfile(data);
                setDisplayName(data.display_name || '');
                setBio(data.bio || '');
                setCity(data.city || '');
                setState(data.state || '');
                setPrimaryGame(data.primary_game || '');
                setSkillLevel(data.skill_level || '');
                setYearsPlaying(data.years_playing?.toString() || '');
                setLookingForGames(data.looking_for_games);
                setLookingForTeam(data.looking_for_team);
                setLookingForLeague(data.looking_for_league);
            }
        }
        loadProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await updateProfile({
                display_name: displayName || undefined,
                bio: bio || undefined,
                city: city || undefined,
                state: state || undefined,
                primary_game: primaryGame || undefined,
                skill_level: skillLevel || undefined,
                years_playing: yearsPlaying ? parseInt(yearsPlaying) : undefined,
                looking_for_games: lookingForGames,
                looking_for_team: lookingForTeam,
                looking_for_league: lookingForLeague,
            });

            if (result.success) {
                toast.success('Profile updated!');
                router.push('/profile');
            } else {
                toast.error(result.error || 'Failed to update');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <Link
                    href="/profile"
                    className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to profile
                </Link>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>Update your player information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Display Name */}
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="How others see you"
                                />
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell others about yourself..."
                                    rows={3}
                                />
                            </div>

                            {/* Location */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input
                                        id="state"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Game Info */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="primaryGame">Primary Game</Label>
                                    <select
                                        id="primaryGame"
                                        value={primaryGame}
                                        onChange={(e) => setPrimaryGame(e.target.value)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Select...</option>
                                        <option value="8-ball">8-Ball</option>
                                        <option value="9-ball">9-Ball</option>
                                        <option value="10-ball">10-Ball</option>
                                        <option value="one-pocket">One Pocket</option>
                                        <option value="straight">Straight Pool</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="skillLevel">Skill Level</Label>
                                    <select
                                        id="skillLevel"
                                        value={skillLevel}
                                        onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Select...</option>
                                        {(Object.entries(SKILL_LEVEL_LABELS) as [SkillLevel, string][]).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Years Playing */}
                            <div className="space-y-2">
                                <Label htmlFor="yearsPlaying">Years Playing</Label>
                                <Input
                                    id="yearsPlaying"
                                    type="number"
                                    min="0"
                                    value={yearsPlaying}
                                    onChange={(e) => setYearsPlaying(e.target.value)}
                                />
                            </div>

                            {/* Looking For */}
                            <div className="space-y-4">
                                <Label className="text-base">Looking For</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="lookingGames" className="font-normal">
                                            Looking for games
                                        </Label>
                                        <Switch
                                            id="lookingGames"
                                            checked={lookingForGames}
                                            onCheckedChange={setLookingForGames}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="lookingTeam" className="font-normal">
                                            Looking for a team
                                        </Label>
                                        <Switch
                                            id="lookingTeam"
                                            checked={lookingForTeam}
                                            onCheckedChange={setLookingForTeam}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="lookingLeague" className="font-normal">
                                            Looking for a league
                                        </Label>
                                        <Switch
                                            id="lookingLeague"
                                            checked={lookingForLeague}
                                            onCheckedChange={setLookingForLeague}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
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
