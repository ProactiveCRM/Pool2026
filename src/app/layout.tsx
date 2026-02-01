import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'PoolFinder - Find Pool Halls & Billiards Venues Near You',
    template: '%s | PoolFinder',
  },
  description:
    'Discover the best pool halls, billiards rooms, and snooker venues in your area. Search by location, amenities, and table types.',
  keywords: [
    'pool hall',
    'billiards',
    'snooker',
    'pool tables',
    'cue sports',
    'pool venue',
    'billiards room',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'PoolFinder',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="relative min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
