import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'PoolFinder - Find Pool Halls & Billiards Venues Near You 🎱',
    template: '%s | PoolFinder 🎱',
  },
  description:
    'Discover the best pool halls, billiards rooms, and snooker venues in your area. Search by location, amenities, and table types. Made for pool players, by pool players.',
  keywords: [
    'pool hall',
    'billiards',
    'snooker',
    'pool tables',
    'cue sports',
    'pool venue',
    'billiards room',
    'pool hall near me',
    'billiards near me',
    'pool hall directory',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PoolFinder',
    title: 'PoolFinder - Find Pool Halls & Billiards Venues Near You 🎱',
    description: 'Discover the best pool halls, billiards rooms, and snooker venues in your area.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PoolFinder - Find Pool Halls Near You 🎱',
    description: 'Discover the best pool halls, billiards rooms, and snooker venues in your area.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Script to initialize theme before React hydrates to prevent flash
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PoolFinder" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

