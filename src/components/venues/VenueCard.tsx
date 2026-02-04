import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Table2, CheckCircle, Star } from 'lucide-react';
import type { Venue } from '@/lib/types';

interface VenueCardProps {
    venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
    return (
        <Card className="group glass-card card-hover border-0 overflow-hidden">
            {/* Image with shine effect */}
            <div className="relative h-52 bg-gradient-to-br from-primary/20 to-secondary/10 overflow-hidden shine">
                {venue.image_url ? (
                    <img
                        src={venue.image_url}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center gradient-mesh">
                        <div className="pool-ball w-16 h-16 opacity-30" />
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Verified badge */}
                {venue.is_claimed && (
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-primary/90 text-primary-foreground border-0 glow-hover">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                        </Badge>
                    </div>
                )}

                {/* Rating overlay - visible on hover */}
                {venue.rating && (
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Badge variant="secondary" className="glass border-0">
                            <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                            {venue.rating.toFixed(1)}
                        </Badge>
                    </div>
                )}
            </div>

            <CardContent className="pt-5 pb-4">
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {venue.name}
                </h3>

                <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0 text-primary/60" />
                    <span className="line-clamp-1">
                        {venue.city}, {venue.state}
                    </span>
                </div>

                {/* Table count with icon */}
                <div className="flex items-center justify-between text-sm mb-4">
                    {venue.num_tables > 0 && (
                        <div className="flex items-center text-muted-foreground">
                            <Table2 className="h-4 w-4 mr-1.5 text-primary/60" />
                            <span>{venue.num_tables} tables</span>
                        </div>
                    )}
                    {venue.rating && (
                        <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{venue.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Table types with better styling */}
                {venue.table_types && venue.table_types.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {venue.table_types.slice(0, 3).map((type) => (
                            <Badge
                                key={type}
                                variant="outline"
                                className="text-xs border-primary/20 bg-primary/5"
                            >
                                {type}
                            </Badge>
                        ))}
                        {venue.table_types.length > 3 && (
                            <Badge variant="outline" className="text-xs border-muted">
                                +{venue.table_types.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0 pb-5">
                <Button asChild className="w-full btn-glow" variant="default">
                    <Link href={`/venues/${venue.slug}`}>View Details →</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
