'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success('Message sent! We\'ll get back to you soon.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
                <div className="container mx-auto px-4 relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Get in Touch 📬
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Questions, feedback, or want to list your venue? We&apos;d love to hear from you.
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        {/* Contact Form */}
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader>
                                <CardTitle>Send a Message</CardTitle>
                                <CardDescription>
                                    Fill out the form and we&apos;ll respond within 24 hours.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Input
                                            id="subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="How can we help?"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Tell us more..."
                                            rows={5}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Mail className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Email</p>
                                            <a href="mailto:hello@rackcity.com" className="text-muted-foreground hover:text-primary">
                                                hello@rackcity.com
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                            <Phone className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Phone</p>
                                            <a href="tel:+18005551234" className="text-muted-foreground hover:text-primary">
                                                1-800-555-1234
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                            <MapPin className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Office</p>
                                            <p className="text-muted-foreground">
                                                123 Pool Street<br />
                                                Los Angeles, CA 90028
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-card/50 rounded-lg border border-border/50">
                                <h3 className="font-semibold mb-2">🏢 Venue Owners</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Want to claim or list your venue? It&apos;s free to get started.
                                </p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/venues">Claim Your Venue</Link>
                                </Button>
                            </div>

                            <div className="p-6 bg-card/50 rounded-lg border border-border/50">
                                <h3 className="font-semibold mb-2">🤝 Partnerships</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Interested in partnering with RackCity? Let&apos;s talk.
                                </p>
                                <Button variant="outline" size="sm" asChild>
                                    <a href="mailto:partners@rackcity.com">Email Partners Team</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
