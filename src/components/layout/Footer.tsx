import Link from 'next/link';

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-card/50">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                <span className="text-lg font-bold text-primary-foreground">🎱</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">PoolFinder</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Discover the best pool halls and billiards venues near you.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Explore</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/venues" className="hover:text-primary transition-colors">
                                    Browse Venues
                                </Link>
                            </li>
                            <li>
                                <Link href="/leagues" className="hover:text-primary transition-colors">
                                    Leagues
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="hover:text-primary transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth" className="hover:text-primary transition-colors">
                                    Sign In
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Business */}
                    <div>
                        <h3 className="font-semibold mb-4">For Business</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/venues" className="hover:text-primary transition-colors">
                                    Claim Your Venue
                                </Link>
                            </li>
                            <li>
                                <Link href="/venue-dashboard" className="hover:text-primary transition-colors">
                                    Venue Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="hover:text-primary transition-colors">
                                    Admin Portal
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/about" className="hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-primary transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:support@poolfinder.com" className="hover:text-primary transition-colors">
                                    support@poolfinder.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} PoolFinder. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
