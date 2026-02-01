'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/venues', label: 'Find Venues' },
    { href: '/leagues', label: 'Leagues 🏆' },
];

export function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <span className="text-lg font-bold text-primary-foreground">🎱</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">PoolFinder</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href
                                ? 'text-primary'
                                : 'text-muted-foreground'
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    <Button variant="ghost" asChild>
                        <Link href="/auth">Sign In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/venues">Browse Venues</Link>
                    </Button>
                </div>

                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px]">
                        <div className="flex flex-col gap-6 pt-6">
                            <nav className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`text-lg font-medium transition-colors hover:text-primary ${pathname === link.href
                                            ? 'text-primary'
                                            : 'text-muted-foreground'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className="text-sm text-muted-foreground">Theme</span>
                                <ThemeToggle />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button variant="outline" asChild>
                                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                                        Sign In
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/venues" onClick={() => setMobileMenuOpen(false)}>
                                        Browse Venues
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
