import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Building2,
    FileCheck,
    Users,
    Upload,
    ArrowLeft,
    Shield,
} from 'lucide-react';

const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/venues', label: 'Venues', icon: Building2 },
    { href: '/admin/claims', label: 'Claims', icon: FileCheck },
    { href: '/admin/leads', label: 'Leads', icon: Users },
    { href: '/admin/import', label: 'Import', icon: Upload },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth?next=/admin');
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

    if (!adminUser) {
        redirect('/dashboard?error=unauthorized');
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Admin Header */}
            <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="text-sm">Back to Site</span>
                        </Link>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <span className="font-semibold">Admin Panel</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{user.email}</span>
                        <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs uppercase">
                            {adminUser.role}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 border-r border-border/50 bg-card/20 min-h-[calc(100vh-57px)] hidden md:block">
                    <nav className="p-4 space-y-1">
                        {adminNavItems.map((item) => (
                            <Button
                                key={item.href}
                                variant="ghost"
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className="h-4 w-4 mr-3" />
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                {/* Mobile Nav */}
                <div className="md:hidden border-b border-border/50 w-full overflow-x-auto">
                    <nav className="flex p-2 gap-1">
                        {adminNavItems.map((item) => (
                            <Button
                                key={item.href}
                                variant="ghost"
                                size="sm"
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className="h-4 w-4 mr-2" />
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
