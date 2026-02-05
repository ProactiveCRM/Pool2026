'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    X,
    MapPin,
    Trophy,
    Calendar,
    Bot,
    Camera,
    Target
} from 'lucide-react';

const quickActions = [
    { href: '/venues', label: 'Find Venue', icon: MapPin, color: 'bg-blue-500' },
    { href: '/leagues', label: 'Join League', icon: Trophy, color: 'bg-yellow-500' },
    { href: '/schedule', label: 'My Schedule', icon: Calendar, color: 'bg-green-500' },
    { href: '/coach', label: 'AI Coach', icon: Bot, color: 'bg-purple-500' },
    { href: '/analyzer', label: 'Analyze Shot', icon: Camera, color: 'bg-orange-500' },
    { href: '/profile', label: 'My Profile', icon: Target, color: 'bg-pink-500' },
];

export function QuickActions() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-16 right-0 mb-2"
                    >
                        <div className="bg-card border border-border rounded-xl shadow-xl p-3 space-y-2 min-w-[180px]">
                            {quickActions.map((action, index) => {
                                const Icon = action.icon;
                                return (
                                    <motion.div
                                        key={action.href}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            href={action.href}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                                        >
                                            <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                                                <Icon className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                                {action.label}
                                            </span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    size="lg"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-14 w-14 rounded-full shadow-lg transition-colors ${isOpen ? 'bg-muted-foreground' : 'bg-primary'
                        }`}
                >
                    <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Plus className="h-6 w-6" />
                        )}
                    </motion.div>
                </Button>
            </motion.div>
        </div>
    );
}
