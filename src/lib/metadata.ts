import type { Metadata } from "next";

export const metadata: Metadata = {
    title: {
        default: "Pool Directory - Find Pool Halls Near You",
        template: "%s | Pool Directory",
    },
    description:
        "Discover the best pool halls, billiard rooms, and cue sports venues in your area. Browse listings, read reviews, and find your perfect place to play.",
    keywords: [
        "pool halls",
        "billiards",
        "pool tables",
        "cue sports",
        "snooker",
        "pool hall directory",
        "find pool halls",
        "pool venues",
    ],
    authors: [{ name: "Pool Directory" }],
    creator: "Pool Directory",
    publisher: "Pool Directory",
    formatDetection: {
        telephone: true,
        email: true,
        address: true,
    },
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_APP_URL || "https://pooldirectory.com"
    ),
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "/",
        siteName: "Pool Directory",
        title: "Pool Directory - Find Pool Halls Near You",
        description:
            "Discover the best pool halls, billiard rooms, and cue sports venues in your area.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Pool Directory",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Pool Directory - Find Pool Halls Near You",
        description:
            "Discover the best pool halls, billiard rooms, and cue sports venues in your area.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
};
