import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Trophy, Heart } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About PoolFinder',
    description: 'Learn about our mission to connect pool players with the best billiards venues nationwide.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            About <span className="text-primary">PoolFinder</span> 🎱
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            We&apos;re on a mission to connect pool players with amazing venues
                            and build a thriving community around the sport we love.
                        </p>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="py-16 bg-card/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
                        <div className="prose prose-lg dark:prose-invert mx-auto">
                            <p>
                                PoolFinder started with a simple frustration: finding a great pool hall
                                shouldn&apos;t be hard. Whether you&apos;re traveling for work, moving to a new
                                city, or just looking for a better spot to play—every player deserves
                                to find their perfect venue.
                            </p>
                            <p>
                                Built by players, for players, PoolFinder is more than a directory.
                                It&apos;s a platform where you can discover venues, book tables, join
                                leagues, and connect with fellow enthusiasts.
                            </p>
                            <p>
                                From casual players to tournament pros, we believe everyone should
                                have access to quality tables and welcoming communities. That&apos;s why
                                we&apos;re building the most comprehensive pool hall platform in the world.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">What We Believe</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="bg-card/50 border-border/50">
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Target className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold mb-2">Quality First</h3>
                                <p className="text-sm text-muted-foreground">
                                    We verify venues and encourage honest reviews so you always know what to expect.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border-border/50">
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-6 w-6 text-blue-500" />
                                </div>
                                <h3 className="font-semibold mb-2">Community Driven</h3>
                                <p className="text-sm text-muted-foreground">
                                    Pool is better together. We help players connect, compete, and grow.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border-border/50">
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Trophy className="h-6 w-6 text-yellow-500" />
                                </div>
                                <h3 className="font-semibold mb-2">Grow the Sport</h3>
                                <p className="text-sm text-muted-foreground">
                                    From beginners to pros, we support everyone&apos;s journey in billiards.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-card/50 border-border/50">
                            <CardContent className="pt-6 text-center">
                                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                    <Heart className="h-6 w-6 text-red-500" />
                                </div>
                                <h3 className="font-semibold mb-2">Player First</h3>
                                <p className="text-sm text-muted-foreground">
                                    Every feature we build is designed to make your pool experience better.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-card/30">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Find Your Spot?</h2>
                    <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                        Join thousands of players discovering great venues and building connections.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button size="lg" asChild>
                            <Link href="/venues">Browse Venues</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/auth">Sign Up Free</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
