'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Home,
    Target,
    BarChart3,
    MapPin,
    Menu
} from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/training', label: 'Training', icon: Target },
    { href: '/stats', label: 'Stats', icon: BarChart3 },
    { href: '/venues', label: 'Venues', icon: MapPin },
];

const moreLinks = [
    { href: '/strategy', label: 'Strategy' },
    { href: '/scoring', label: 'Scoring' },
    { href: '/log-match', label: 'Log Match' },
    { href: '/play', label: 'Play Session' },
    { href: '/coach', label: 'AI Coach' },
    { href: '/analyzer', label: 'Shot Analyzer' },
    { href: '/leagues', label: 'Leagues' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/profile', label: 'My Profile' },
    { href: '/settings', label: 'Settings' },
];

export function BottomNav() {
    const pathname = usePathname();
    const [moreOpen, setMoreOpen] = useState(false);

    return (
        <>
            {/* Bottom Navigation - Mobile Only */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                {/* Glass background */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border" />

                {/* Safe area padding for notch devices */}
                <div className="relative flex items-center justify-around h-16 pb-safe">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="relative flex flex-col items-center justify-center w-16 h-full"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className={`flex flex-col items-center gap-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}

                    {/* More Menu */}
                    <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                        <SheetTrigger asChild>
                            <button className="relative flex flex-col items-center justify-center w-16 h-full">
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="flex flex-col items-center gap-0.5 text-muted-foreground"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="text-[10px] font-medium">More</span>
                                </motion.div>
                            </button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
                            <VisuallyHidden.Root>
                                <SheetTitle>More Features</SheetTitle>
                                <SheetDescription>Access additional app features</SheetDescription>
                            </VisuallyHidden.Root>
                            <div className="pt-4">
                                <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
                                <h3 className="text-lg font-bold mb-4 px-2">More Features</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {moreLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMoreOpen(false)}
                                            className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                                        >
                                            <span className="text-sm font-medium">{link.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>

            {/* Spacer to prevent content from being hidden behind bottom nav */}
            <div className="h-16 md:hidden" />
        </>
    );
}
