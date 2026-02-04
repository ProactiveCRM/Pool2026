'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MapPin, Trophy, User, Bot } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/venues', label: 'Venues', icon: MapPin },
    { href: '/leagues', label: 'Leagues', icon: Trophy },
    { href: '/coach', label: 'AI Coach', icon: Bot },
];

export function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo - RackCity */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                        <span className="text-xl">🎱</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold tracking-tight font-[var(--font-display)]">
                            Rack<span className="text-primary">City</span>
                        </span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                                    ? 'bg-primary/10 text-foreground'
                                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                {Icon && <Icon className="h-4 w-4" />}
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" className="text-foreground/80" asChild>
                        <Link href="/auth">
                            <User className="h-4 w-4 mr-2" />
                            Sign In
                        </Link>
                    </Button>
                    <Button size="sm" className="font-semibold" asChild>
                        <Link href="/venues">Browse Venues</Link>
                    </Button>
                </div>

                {/* Mobile Menu */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] bg-background border-border">
                            <div className="flex flex-col gap-6 pt-8">
                                {/* Brand in mobile menu */}
                                <div className="flex items-center gap-2 pb-4 border-b border-border">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                        <span className="text-xl">🎱</span>
                                    </div>
                                    <span className="text-xl font-bold">
                                        Rack<span className="text-primary">City</span>
                                    </span>
                                </div>

                                <nav className="flex flex-col gap-2">
                                    {navLinks.map((link) => {
                                        const isActive = pathname === link.href;
                                        const Icon = link.icon;
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all ${isActive
                                                    ? 'bg-primary/10 text-foreground'
                                                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                                                    }`}
                                            >
                                                {Icon && <Icon className="h-5 w-5" />}
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </nav>

                                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                                    <Button variant="outline" className="justify-start" asChild>
                                        <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                                            <User className="h-4 w-4 mr-2" />
                                            Sign In
                                        </Link>
                                    </Button>
                                    <Button className="justify-start font-semibold" asChild>
                                        <Link href="/venues" onClick={() => setMobileMenuOpen(false)}>
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Browse Venues
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
