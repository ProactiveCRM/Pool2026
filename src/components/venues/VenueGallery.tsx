'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface VenueGalleryProps {
    images: {
        url: string;
        alt: string;
        caption?: string;
    }[];
    venueName: string;
}

export function VenueGallery({ images, venueName }: VenueGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (images.length === 0) return null;

    return (
        <>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    {/* Main Image */}
                    <div className="relative aspect-video group cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                        <Image
                            src={images[currentIndex].url}
                            alt={images[currentIndex].alt}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Navigation arrows */}
                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </>
                        )}

                        {/* Caption overlay */}
                        {images[currentIndex].caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                <p className="text-white text-sm">{images[currentIndex].caption}</p>
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-2 p-3 overflow-x-auto">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all ${index === currentIndex
                                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                            : 'opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <Image
                                        src={image.url}
                                        alt={image.alt}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Image counter */}
                    <div className="px-4 pb-3 text-sm text-muted-foreground">
                        {currentIndex + 1} of {images.length} photos
                    </div>
                </CardContent>
            </Card>

            {/* Lightbox */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white hover:bg-white/10"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={images[currentIndex].url}
                                    alt={images[currentIndex].alt}
                                    fill
                                    className="object-contain"
                                />
                            </motion.div>
                        </div>

                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
                                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
                                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            </>
                        )}

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
                            <p className="text-center font-medium">{venueName}</p>
                            <p className="text-sm text-white/70">{currentIndex + 1} of {images.length}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Demo data
export const demoVenueImages = [
    { url: '/placeholder-venue-1.jpg', alt: 'Main floor with pool tables', caption: 'Our main floor features 12 championship tables' },
    { url: '/placeholder-venue-2.jpg', alt: 'Bar area', caption: 'Full-service bar with craft cocktails' },
    { url: '/placeholder-venue-3.jpg', alt: 'Tournament room', caption: 'Private tournament room for leagues' },
    { url: '/placeholder-venue-4.jpg', alt: 'Lounge seating', caption: 'Comfortable lounge for spectators' },
];
