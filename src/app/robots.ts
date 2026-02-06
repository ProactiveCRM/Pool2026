import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rackcity.app';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/auth/',
                    '/dashboard/',
                    '/settings/',
                    '/my-reservations/',
                    '/my-teams/',
                    '/notifications/',
                    '/venue-dashboard/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
