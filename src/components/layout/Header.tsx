'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Menu, MapPin, Trophy, User, Bot, Camera, Home } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

const navLinks = [
    { href: '/', label: 'Home', icon: Home, tooltip: 'Back to homepage' },
    { href: '/venues', label: 'Venues', icon: MapPin, tooltip: 'Find pool halls near you' },
    { href: '/leagues', label: 'Leagues', icon: Trophy, tooltip: 'Join competitive leagues' },
    { href: '/coach', label: 'AI Coach', icon: Bot, tooltip: 'Get expert pool advice' },
    { href: '/analyzer', label: 'Analyzer', icon: Camera, tooltip: 'Analyze your shots with AI' },
];

export function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <TooltipProvider delayDuration={300}>
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

                    {/* Desktop Navigation with Tooltips */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;
                            return (
                                <Tooltip key={link.href}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={link.href}
                                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                                                ? 'bg-primary/10 text-foreground'
                                                : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                                                }`}
                                        >
                                            {Icon && <Icon className="h-4 w-4" />}
                                            {link.label}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{link.tooltip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <ThemeToggle />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-foreground/80" asChild>
                                    <Link href="/auth">
                                        <User className="h-4 w-4 mr-2" />
                                        Sign In
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Sign in or create account</p>
                            </TooltipContent>
                        </Tooltip>
                        <Button size="sm" className="font-semibold" asChild>
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
                        <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                            <nav className="flex flex-col gap-4 mt-8">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                                                ? 'bg-primary/10 text-foreground'
                                                : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                                                }`}
                                        >
                                            {Icon && <Icon className="h-5 w-5" />}
                                            {link.label}
                                        </Link>
                                    );
                                })}
                                <div className="border-t border-border pt-4 mt-2">
                                    <Link
                                        href="/auth"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted"
                                    >
                                        <User className="h-5 w-5" />
                                        Sign In
                                    </Link>
                                    <div className="px-4 mt-4">
                                        <Button
                                            className="w-full font-semibold"
                                            onClick={() => setMobileMenuOpen(false)}
                                            asChild
                                        >
                                            <Link href="/venues">Browse Venues</Link>
                                        </Button>
                                    </div>
                                    <div className="px-4 mt-4 flex justify-center">
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </header>
        </TooltipProvider>
    );
}
