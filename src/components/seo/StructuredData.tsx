interface StructuredDataProps {
    type: 'WebApplication' | 'SportsOrganization' | 'LocalBusiness' | 'FAQPage';
    data?: Record<string, unknown>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://rackcity.app';

    const schemas: Record<string, object> = {
        WebApplication: {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'RackCity',
            description: 'The #1 platform for pool players. Find venues, track stats, improve your game.',
            url: baseUrl,
            applicationCategory: 'SportsApplication',
            operatingSystem: 'Web',
            offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
            },
            author: {
                '@type': 'Organization',
                name: 'RackCity',
            },
            ...data,
        },
        SportsOrganization: {
            '@context': 'https://schema.org',
            '@type': 'SportsOrganization',
            name: 'RackCity',
            description: 'Pool and billiards community platform for players of all skill levels.',
            url: baseUrl,
            sport: 'Billiards',
            ...data,
        },
        LocalBusiness: {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': `${baseUrl}/venues`,
            ...data,
        },
        FAQPage: {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: data?.faq || [],
        },
    };

    const schema = schemas[type];

    if (!schema) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

// Pre-built schema for the app
export function AppStructuredData() {
    return (
        <StructuredData
            type="WebApplication"
            data={{
                featureList: [
                    'Find pool halls and billiards venues',
                    'Track your stats and performance',
                    'Practice drills for cue ball control',
                    'AI coaching and shot analysis',
                    'Join leagues and tournaments',
                    'APA handicap calculator',
                ],
            }}
        />
    );
}
