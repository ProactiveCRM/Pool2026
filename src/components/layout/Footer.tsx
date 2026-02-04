import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                <span className="text-xl">🎱</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                Rack<span className="text-primary">City</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The #1 platform for pool players. Find venues, book tables, compete in leagues.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Explore</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/venues" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Browse Venues
                                </Link>
                            </li>
                            <li>
                                <Link href="/leagues" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Leagues
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Sign In
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Business */}
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">For Business</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/venues" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Claim Your Venue
                                </Link>
                            </li>
                            <li>
                                <Link href="/venue-dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Venue Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Admin Portal
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold mb-4 text-foreground">Company</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:hello@rackcity.com" className="text-muted-foreground hover:text-foreground transition-colors">
                                    hello@rackcity.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} RackCity. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
