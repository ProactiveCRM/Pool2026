import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parse } from 'csv-parse/sync';

function generateSlug(name: string, city: string, state: string): string {
    const base = `${name}-${city}-${state}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Add random suffix for uniqueness
    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: adminUser } = await supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse file
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const text = await file.text();
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as Record<string, string>[];

        const errors: string[] = [];
        let success = 0;

        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            const rowNum = i + 2; // Account for header row

            try {
                // Validate required fields
                if (!row.name || !row.address || !row.city || !row.state || !row.zip) {
                    errors.push(`Row ${rowNum}: Missing required fields (name, address, city, state, zip)`);
                    continue;
                }

                // Parse arrays
                const tableTypes = row.table_types
                    ? row.table_types.split('|').map((t: string) => t.trim()).filter(Boolean)
                    : [];

                const amenities = row.amenities
                    ? row.amenities.split('|').map((a: string) => a.trim()).filter(Boolean)
                    : [];

                // Generate slug
                const slug = generateSlug(row.name, row.city, row.state);

                // Insert venue
                const { error } = await supabase.from('venues').insert({
                    name: row.name,
                    slug,
                    address: row.address,
                    city: row.city,
                    state: row.state.toUpperCase(),
                    zip: row.zip,
                    phone: row.phone || null,
                    email: row.email || null,
                    website: row.website || null,
                    description: row.description || null,
                    num_tables: parseInt(row.num_tables) || 0,
                    table_types: tableTypes.length > 0 ? tableTypes : null,
                    amenities: amenities.length > 0 ? amenities : null,
                    is_active: true,
                    is_claimed: false,
                });

                if (error) {
                    errors.push(`Row ${rowNum}: ${error.message}`);
                } else {
                    success++;
                }
            } catch (err) {
                errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        }

        return NextResponse.json({ success, errors });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            { error: 'Failed to process import' },
            { status: 500 }
        );
    }
}
