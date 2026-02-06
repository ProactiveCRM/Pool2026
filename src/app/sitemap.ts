import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rackcity.app';

    // Static pages
    const staticPages = [
        '',              // Home
        '/training',
        '/stats',
        '/strategy',
        '/scoring',
        '/venues',
        '/leagues',
        '/coach',
        '/analyzer',
        '/practice',
        '/play',
        '/log-match',
        '/schedule',
        '/tournaments',
        '/leaderboard',
        '/achievements',
        '/rules',
        '/about',
        '/contact',
        '/pricing',
        '/auth',
    ];

    const staticRoutes: MetadataRoute.Sitemap = staticPages.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route === '/venues' ? 0.9 : 0.7,
    }));

    // TODO: Add dynamic routes for venues, leagues, etc.
    // Example:
    // const venues = await getVenues();
    // const venueRoutes = venues.map(v => ({
    //     url: `${baseUrl}/venues/${v.slug}`,
    //     lastModified: v.updatedAt,
    //     changeFrequency: 'weekly',
    //     priority: 0.8,
    // }));

    return [...staticRoutes];
}
