'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

// Subscribe to theme changes
function subscribe(callback: () => void) {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });
    return () => observer.disconnect();
}

function getSnapshot() {
    return document.documentElement.classList.contains('dark');
}

function getServerSnapshot() {
    return true; // Default to dark on server
}

export function ThemeToggle() {
    const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const toggleTheme = useCallback(() => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }, [isDark]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 transition-colors hover:bg-primary/10"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
                <Moon className="h-5 w-5 text-primary" />
            )}
        </Button>
    );
}

