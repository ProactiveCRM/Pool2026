import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getMyProfile, getMyFavorites, getAllBadges } from '@/lib/actions/profiles';
import { getMyReviews } from '@/lib/actions/reviews';
import { getMyTeams } from '@/lib/actions/leagues';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User, MapPin, Star, Heart, Trophy, Settings,
    Target, Calendar, Users
} from 'lucide-react';
import { SKILL_LEVEL_LABELS, getWinRate } from '@/types/profiles';
import { RatingDisplay } from '@/components/reviews/StarRating';

export const metadata: Metadata = {
    title: 'My Profile',
    description: 'View and manage your player profile',
};

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?next=/profile');
    }

    const [profile, favorites, reviews, teams, allBadges] = await Promise.all([
        getMyProfile(),
        getMyFavorites(),
        getMyReviews(),
        getMyTeams(),
        getAllBadges(),
    ]);

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="text-center p-8">
                    <CardContent>
                        <p>Error loading profile</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const earnedBadges = allBadges.filter(b => profile.badges?.includes(b.id));

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt=""
                                    className="h-full w-full rounded-full object-cover"
                                />
                            ) : (
                                '🎱'
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {profile.display_name || 'Player'}
                            </h1>
                            {(profile.city || profile.state) && (
                                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                                    <MapPin className="h-4 w-4" />
                                    {[profile.city, profile.state].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {profile.skill_level && (
                                <Badge variant="secondary" className="mt-2">
                                    {SKILL_LEVEL_LABELS[profile.skill_level]}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href="/profile/edit">
                            <Settings className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Link>
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
                            <div className="text-2xl font-bold">{profile.total_reservations}</div>
                            <div className="text-sm text-muted-foreground">Reservations</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Star className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                            <div className="text-2xl font-bold">{profile.total_reviews}</div>
                            <div className="text-sm text-muted-foreground">Reviews</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Trophy className="h-8 w-8 mx-auto text-green-500 mb-2" />
                            <div className="text-2xl font-bold">{profile.total_wins}</div>
                            <div className="text-sm text-muted-foreground">Wins</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <Target className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                            <div className="text-2xl font-bold">
                                {getWinRate(profile.total_wins, profile.total_matches)}
                            </div>
                            <div className="text-sm text-muted-foreground">Win Rate</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="favorites" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="favorites">
                            <Heart className="mr-2 h-4 w-4" />
                            Favorites
                        </TabsTrigger>
                        <TabsTrigger value="reviews">
                            <Star className="mr-2 h-4 w-4" />
                            Reviews
                        </TabsTrigger>
                        <TabsTrigger value="teams">
                            <Users className="mr-2 h-4 w-4" />
                            Teams
                        </TabsTrigger>
                        <TabsTrigger value="badges">
                            <Trophy className="mr-2 h-4 w-4" />
                            Badges
                        </TabsTrigger>
                    </TabsList>

                    {/* Favorites Tab */}
                    <TabsContent value="favorites">
                        {favorites.length === 0 ? (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">No Favorites Yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Save your favorite venues for quick access
                                    </p>
                                    <Button asChild>
                                        <Link href="/venues">Browse Venues</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {favorites.map((fav) => (
                                    <Card key={fav.id} className="hover:border-primary/50 transition-colors">
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                <Link
                                                    href={`/venues/${fav.venue?.slug}`}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {fav.venue?.name}
                                                </Link>
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {fav.venue?.city}, {fav.venue?.state}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Reviews Tab */}
                    <TabsContent value="reviews">
                        {reviews.length === 0 ? (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">No Reviews Yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Share your experiences at pool venues
                                    </p>
                                    <Button asChild>
                                        <Link href="/venues">Find a Venue</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <Card key={review.id}>
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">
                                                        <Link
                                                            href={`/venues/${review.venue?.slug}`}
                                                            className="hover:text-primary transition-colors"
                                                        >
                                                            {review.venue?.name}
                                                        </Link>
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </CardDescription>
                                                </div>
                                                <RatingDisplay rating={review.rating} />
                                            </div>
                                        </CardHeader>
                                        {(review.title || review.content) && (
                                            <CardContent>
                                                {review.title && (
                                                    <p className="font-medium mb-1">{review.title}</p>
                                                )}
                                                {review.content && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {review.content}
                                                    </p>
                                                )}
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Teams Tab */}
                    <TabsContent value="teams">
                        {teams.length === 0 ? (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="font-semibold mb-2">No Teams Yet</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Join a league to compete with others
                                    </p>
                                    <Button asChild>
                                        <Link href="/leagues">Browse Leagues</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {teams.map((team) => (
                                    <Card key={team.id}>
                                        <CardHeader>
                                            <CardTitle>{team.name}</CardTitle>
                                            {team.league && (
                                                <CardDescription>{team.league.name}</CardDescription>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between text-sm">
                                                <span>Record</span>
                                                <span className="font-medium">
                                                    {team.wins}W - {team.losses}L
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Badges Tab */}
                    <TabsContent value="badges">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {earnedBadges.length > 0 && (
                                <>
                                    <h3 className="col-span-full font-semibold text-lg">Earned Badges</h3>
                                    {earnedBadges.map((badge) => (
                                        <Card key={badge.id} className="bg-primary/5 border-primary/20">
                                            <CardContent className="pt-6 flex items-center gap-4">
                                                <div className="text-3xl">{badge.icon}</div>
                                                <div>
                                                    <p className="font-medium">{badge.name}</p>
                                                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </>
                            )}

                            <h3 className="col-span-full font-semibold text-lg mt-4">Available Badges</h3>
                            {allBadges.filter(b => !profile.badges?.includes(b.id)).map((badge) => (
                                <Card key={badge.id} className="opacity-60">
                                    <CardContent className="pt-6 flex items-center gap-4">
                                        <div className="text-3xl grayscale">{badge.icon}</div>
                                        <div>
                                            <p className="font-medium">{badge.name}</p>
                                            <p className="text-sm text-muted-foreground">{badge.requirement}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
