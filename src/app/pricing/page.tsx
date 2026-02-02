import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Pricing - PoolFinder',
    description: 'Simple, transparent pricing for players and venue owners.',
};

const playerFeatures = [
    { name: 'Browse all venues', included: true },
    { name: 'Read reviews & ratings', included: true },
    { name: 'View venue details & hours', included: true },
    { name: 'Book tables online', included: true },
    { name: 'Join leagues & teams', included: true },
    { name: 'Player profile & stats', included: true },
    { name: 'Notification preferences', included: true },
    { name: 'Favorite venues', included: true },
];

const venueFeatures = {
    free: [
        { name: 'Basic venue listing', included: true },
        { name: 'Photos & description', included: true },
        { name: 'Hours & contact info', included: true },
        { name: 'Claim verification badge', included: true },
        { name: 'Respond to reviews', included: false },
        { name: 'Analytics dashboard', included: false },
        { name: 'Online reservations', included: false },
        { name: 'Promotions & deals', included: false },
        { name: 'Priority placement', included: false },
    ],
    pro: [
        { name: 'Everything in Free', included: true },
        { name: 'Respond to reviews', included: true },
        { name: 'Analytics dashboard', included: true },
        { name: 'Online reservations', included: true },
        { name: 'Promotions & deals', included: true },
        { name: 'Priority placement', included: true },
        { name: 'Email notifications', included: true },
        { name: 'API access', included: true },
        { name: 'Priority support', included: true },
    ],
};

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <Badge variant="secondary" className="mb-4">Simple Pricing</Badge>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Free for Players. <span className="text-primary">Affordable for Venues.</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            No hidden fees. Cancel anytime. Start free and upgrade when you&apos;re ready.
                        </p>
                    </div>
                </div>
            </section>

            {/* Player Pricing */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">For Players</h2>
                    <div className="max-w-md mx-auto">
                        <Card className="bg-card/50 border-primary/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl">Player Account</CardTitle>
                                <CardDescription>Everything you need to play</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-6">
                                    <span className="text-5xl font-bold">$0</span>
                                    <span className="text-muted-foreground">/forever</span>
                                </div>
                                <ul className="space-y-3 text-left mb-6">
                                    {playerFeatures.map((feature) => (
                                        <li key={feature.name} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-sm">{feature.name}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full" asChild>
                                    <Link href="/auth">Get Started Free</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Venue Pricing */}
            <section className="py-12 bg-card/30">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-4">For Venue Owners</h2>
                    <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
                        Claim your venue for free, or upgrade to Pro for the full suite of tools.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Tier */}
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl">Free</CardTitle>
                                <CardDescription>Get listed and verified</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-6">
                                    <span className="text-5xl font-bold">$0</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                <ul className="space-y-3 text-left mb-6">
                                    {venueFeatures.free.map((feature) => (
                                        <li key={feature.name} className="flex items-center gap-2">
                                            {feature.included ? (
                                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            ) : (
                                                <X className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                                            )}
                                            <span className={`text-sm ${!feature.included ? 'text-muted-foreground/50' : ''}`}>
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/venues">Claim Your Venue</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Pro Tier */}
                        <Card className="bg-card/50 border-primary/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                            <Badge className="absolute top-4 right-4">Most Popular</Badge>
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-2xl">Pro</CardTitle>
                                <CardDescription>Full venue management suite</CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="mb-6">
                                    <span className="text-5xl font-bold">$49</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                <ul className="space-y-3 text-left mb-6">
                                    {venueFeatures.pro.map((feature) => (
                                        <li key={feature.name} className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            <span className="text-sm">{feature.name}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full" asChild>
                                    <Link href="/contact">Contact Sales</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="p-6 bg-card/50 rounded-lg">
                            <h3 className="font-semibold mb-2">Is PoolFinder really free for players?</h3>
                            <p className="text-sm text-muted-foreground">
                                Yes! Players can browse venues, book tables, join leagues, and build their profile completely free. No credit card required.
                            </p>
                        </div>
                        <div className="p-6 bg-card/50 rounded-lg">
                            <h3 className="font-semibold mb-2">How do I claim my venue?</h3>
                            <p className="text-sm text-muted-foreground">
                                Find your venue on PoolFinder and click &quot;Claim This Venue.&quot; We&apos;ll verify your ownership and you&apos;ll have access within 2-3 business days.
                            </p>
                        </div>
                        <div className="p-6 bg-card/50 rounded-lg">
                            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                            <p className="text-sm text-muted-foreground">
                                Absolutely. There are no long-term contracts. Cancel your Pro subscription anytime from your dashboard.
                            </p>
                        </div>
                        <div className="p-6 bg-card/50 rounded-lg">
                            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                            <p className="text-sm text-muted-foreground">
                                We accept all major credit cards, debit cards, and PayPal for Pro subscriptions.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
