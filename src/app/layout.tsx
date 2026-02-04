import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';

// Modern geometric font for brand
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'RackCity — Find Pool Halls, Book Tables, Join Leagues',
    template: '%s | RackCity',
  },
  description:
    'The #1 platform for pool players. Discover top-rated billiards venues, book tables instantly, and compete in local leagues. Made for players, by players.',
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
    'pool leagues',
    'table reservations',
    'RackCity',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'RackCity',
    title: 'RackCity — The Pool Player\'s Platform',
    description: 'Discover venues, book tables, and compete in leagues. The home for pool players.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RackCity — The Pool Player\'s Platform',
    description: 'Discover venues, book tables, and compete in leagues.',
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
        <meta name="theme-color" content="#166534" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="RackCity" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}>
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
