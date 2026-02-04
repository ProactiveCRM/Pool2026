// Sentry configuration for Next.js
// This file is auto-loaded by Next.js

import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust this value in production for better performance
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Enable debug mode in development
    debug: process.env.NODE_ENV === 'development',

    // Capture Replay for 10% of all sessions and 100% of sessions with errors
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

    // Filter out known non-actionable errors
    ignoreErrors: [
        'ResizeObserver loop',
        'Non-Error promise rejection',
        /Loading chunk \d+ failed/,
    ],

    // Environment tracking
    environment: process.env.NODE_ENV,
});
