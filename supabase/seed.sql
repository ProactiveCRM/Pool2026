-- PoolFinder Seed Data
-- Run this AFTER migrations to populate test data
-- Insert sample venues
INSERT INTO public.venues (
        name,
        slug,
        address,
        city,
        state,
        zip,
        phone,
        description,
        num_tables,
        table_types,
        amenities,
        is_claimed,
        is_active,
        latitude,
        longitude
    )
VALUES -- California
    (
        'Rack ''Em Up Billiards',
        'rack-em-up-billiards-la',
        '1234 Sunset Blvd',
        'Los Angeles',
        'CA',
        '90028',
        '(323) 555-0101',
        'Premier pool hall in the heart of Hollywood. 24 tournament-quality tables, full bar, and weekly tournaments.',
        24,
        ARRAY ['pool', 'snooker'],
        ARRAY ['bar', 'food', 'tournaments', 'parking', 'wifi'],
        true,
        true,
        34.0928,
        -118.3287
    ),
    (
        'The Cue Club',
        'the-cue-club-sf',
        '567 Market Street',
        'San Francisco',
        'CA',
        '94105',
        '(415) 555-0202',
        'Upscale billiards lounge with craft cocktails and a sophisticated atmosphere.',
        16,
        ARRAY ['pool'],
        ARRAY ['bar', 'wifi', 'private_room'],
        true,
        true,
        37.7897,
        -122.3972
    ),
    (
        '8-Ball Palace',
        '8-ball-palace-sd',
        '890 Pacific Highway',
        'San Diego',
        'CA',
        '92101',
        '(619) 555-0303',
        'Family-friendly pool hall with games for all skill levels.',
        20,
        ARRAY ['pool', 'carom'],
        ARRAY ['food', 'parking', 'lessons', 'pro_shop'],
        false,
        true,
        32.7157,
        -117.1611
    ),
    -- Texas
    (
        'Lone Star Billiards',
        'lone-star-billiards-houston',
        '2345 Main Street',
        'Houston',
        'TX',
        '77002',
        '(713) 555-0404',
        'Texas-sized pool hall with 40+ tables and legendary BBQ.',
        42,
        ARRAY ['pool', 'snooker'],
        ARRAY ['bar', 'food', 'tournaments', 'parking', 'wifi', 'pro_shop'],
        true,
        true,
        29.7604,
        -95.3698
    ),
    (
        'DFW Cue Sports',
        'dfw-cue-sports-dallas',
        '4567 Commerce St',
        'Dallas',
        'TX',
        '75201',
        '(214) 555-0505',
        'Modern pool hall with state-of-the-art Diamond tables.',
        28,
        ARRAY ['pool'],
        ARRAY ['bar', 'tournaments', 'lessons', 'parking'],
        true,
        true,
        32.7767,
        -96.7970
    ),
    (
        'Austin Chalk',
        'austin-chalk',
        '789 6th Street',
        'Austin',
        'TX',
        '78701',
        '(512) 555-0606',
        'Keep Austin weird - and playing pool! Live music and craft beer.',
        18,
        ARRAY ['pool'],
        ARRAY ['bar', 'wifi', 'tournaments'],
        false,
        true,
        30.2672,
        -97.7431
    ),
    -- New York
    (
        'Manhattan Billiards',
        'manhattan-billiards-nyc',
        '123 W 42nd Street',
        'New York',
        'NY',
        '10036',
        '(212) 555-0707',
        'Classic NYC pool hall near Times Square. Open 24/7.',
        30,
        ARRAY ['pool', 'snooker', 'carom'],
        ARRAY ['bar', 'food', 'wifi', 'tournaments'],
        true,
        true,
        40.7580,
        -73.9855
    ),
    (
        'Brooklyn Cue Club',
        'brooklyn-cue-club',
        '456 Atlantic Ave',
        'Brooklyn',
        'NY',
        '11217',
        '(718) 555-0808',
        'Hip Williamsburg pool spot with artisanal cocktails.',
        12,
        ARRAY ['pool'],
        ARRAY ['bar', 'wifi', 'private_room'],
        true,
        true,
        40.6872,
        -73.9418
    ),
    -- Florida
    (
        'Miami Pool Lounge',
        'miami-pool-lounge',
        '789 Ocean Drive',
        'Miami',
        'FL',
        '33139',
        '(305) 555-0909',
        'South Beach''s hottest billiards destination. VIP rooms available.',
        22,
        ARRAY ['pool', 'snooker'],
        ARRAY ['bar', 'food', 'private_room', 'parking', 'wifi'],
        true,
        true,
        25.7617,
        -80.1918
    ),
    (
        'Tampa Bay Billiards',
        'tampa-bay-billiards',
        '321 Water Street',
        'Tampa',
        'FL',
        '33602',
        '(813) 555-1010',
        'Waterfront pool hall with stunning bay views.',
        16,
        ARRAY ['pool'],
        ARRAY ['bar', 'food', 'parking', 'wifi'],
        false,
        true,
        27.9506,
        -82.4572
    ),
    -- Illinois
    (
        'Chicago Cue Sports',
        'chicago-cue-sports',
        '555 Michigan Ave',
        'Chicago',
        'IL',
        '60611',
        '(312) 555-1111',
        'Premier Midwest pool destination. Home of regional tournaments.',
        35,
        ARRAY ['pool', 'snooker', 'carom'],
        ARRAY ['bar', 'food', 'tournaments', 'lessons', 'pro_shop', 'parking'],
        true,
        true,
        41.8781,
        -87.6298
    ),
    (
        'Wrigleyville Rack',
        'wrigleyville-rack-chicago',
        '1060 W Addison St',
        'Chicago',
        'IL',
        '60613',
        '(773) 555-1212',
        'Sports bar and pool hall near Wrigley Field.',
        14,
        ARRAY ['pool'],
        ARRAY ['bar', 'food', 'wifi', 'parking'],
        false,
        true,
        41.9484,
        -87.6553
    ),
    -- Arizona
    (
        'Phoenix Cue Club',
        'phoenix-cue-club',
        '2468 Camelback Rd',
        'Phoenix',
        'AZ',
        '85016',
        '(602) 555-1313',
        'Desert oasis for pool players. AC''d comfort year-round.',
        20,
        ARRAY ['pool'],
        ARRAY ['bar', 'food', 'parking', 'wifi', 'tournaments'],
        true,
        true,
        33.5091,
        -112.0748
    ),
    -- Nevada
    (
        'Vegas Billiards Royale',
        'vegas-billiards-royale',
        '3535 Las Vegas Blvd',
        'Las Vegas',
        'NV',
        '89109',
        '(702) 555-1414',
        'High-stakes pool on the Strip. Tournament prize pools up to $100K.',
        40,
        ARRAY ['pool', 'snooker', 'carom'],
        ARRAY ['bar', 'food', 'tournaments', 'private_room', 'parking', 'wifi', 'pro_shop'],
        true,
        true,
        36.1147,
        -115.1728
    ),
    -- Washington
    (
        'Seattle Cue Lounge',
        'seattle-cue-lounge',
        '1234 Pike Street',
        'Seattle',
        'WA',
        '98101',
        '(206) 555-1515',
        'Pacific Northwest''s premier pool destination. Local craft beers on tap.',
        18,
        ARRAY ['pool'],
        ARRAY ['bar', 'food', 'wifi', 'tournaments'],
        true,
        true,
        47.6101,
        -122.3321
    ),
    -- Colorado
    (
        'Mile High Billiards',
        'mile-high-billiards-denver',
        '5280 Colfax Ave',
        'Denver',
        'CO',
        '80202',
        '(303) 555-1616',
        'Elevated pool experience in the heart of Denver.',
        22,
        ARRAY ['pool', 'snooker'],
        ARRAY ['bar', 'food', 'tournaments', 'parking', 'wifi'],
        true,
        true,
        39.7392,
        -104.9903
    ),
    -- Georgia
    (
        'Atlanta Rack Room',
        'atlanta-rack-room',
        '404 Peachtree St',
        'Atlanta',
        'GA',
        '30308',
        '(404) 555-1717',
        'Southern hospitality meets serious pool. Full kitchen and bar.',
        26,
        ARRAY ['pool'],
        ARRAY ['bar', 'food', 'parking', 'wifi', 'tournaments', 'lessons'],
        true,
        true,
        33.7490,
        -84.3880
    ),
    -- Massachusetts
    (
        'Boston Billiard Club',
        'boston-billiard-club',
        '617 Boylston St',
        'Boston',
        'MA',
        '02116',
        '(617) 555-1818',
        'New England''s finest pool hall. Established 1952.',
        20,
        ARRAY ['pool', 'snooker'],
        ARRAY ['bar', 'food', 'wifi', 'pro_shop'],
        true,
        true,
        42.3601,
        -71.0589
    ),
    -- Ohio
    (
        'Cleveland Cue Corner',
        'cleveland-cue-corner',
        '216 Euclid Ave',
        'Cleveland',
        'OH',
        '44114',
        '(216) 555-1919',
        'Rock and Roll Hall of Fame approved pool destination.',
        16,
        ARRAY ['pool'],
        ARRAY ['bar', 'food', 'parking', 'wifi'],
        false,
        true,
        41.4993,
        -81.6944
    ),
    -- Pennsylvania
    (
        'Philly Pool Hall',
        'philly-pool-hall',
        '1776 Market St',
        'Philadelphia',
        'PA',
        '19103',
        '(215) 555-2020',
        'Historic pool hall with championship tables. Cheesesteaks available.',
        24,
        ARRAY ['pool', 'carom'],
        ARRAY ['bar', 'food', 'parking', 'tournaments'],
        true,
        true,
        39.9526,
        -75.1652
    ) ON CONFLICT (slug) DO NOTHING;
-- Insert sample leagues
INSERT INTO public.leagues (
        name,
        slug,
        description,
        format,
        skill_level,
        max_teams,
        season_start,
        season_end,
        registration_deadline,
        entry_fee,
        prize_pool,
        status
    )
VALUES (
        'Los Angeles 8-Ball Championship',
        'la-8ball-championship',
        'Premier 8-ball league for serious players. Weekly matches at top LA venues.',
        '8-ball',
        'advanced',
        16,
        '2026-03-01',
        '2026-06-30',
        '2026-02-15',
        150.00,
        5000.00,
        'registration_open'
    ),
    (
        'NYC Amateur Pool League',
        'nyc-amateur-league',
        'Fun, competitive league for intermediate players. Great way to improve your game!',
        '8-ball',
        'intermediate',
        24,
        '2026-03-15',
        '2026-07-15',
        '2026-03-01',
        75.00,
        2000.00,
        'registration_open'
    ),
    (
        'Texas 9-Ball Tour',
        'texas-9ball-tour',
        'Statewide 9-ball competition with stops in Houston, Dallas, Austin, and San Antonio.',
        '9-ball',
        'all',
        32,
        '2026-04-01',
        '2026-08-31',
        '2026-03-15',
        200.00,
        10000.00,
        'registration_open'
    ),
    (
        'Chicago Snooker Society',
        'chicago-snooker-society',
        'Traditional snooker league for enthusiasts. Monthly tournaments and weekly practice sessions.',
        'snooker',
        'all',
        20,
        '2026-03-01',
        '2026-12-31',
        '2026-02-28',
        100.00,
        3000.00,
        'registration_open'
    ),
    (
        'Vegas High Rollers League',
        'vegas-high-rollers',
        'High-stakes 9-ball for elite players. Invitation or qualification required.',
        '9-ball',
        'professional',
        8,
        '2026-05-01',
        '2026-09-30',
        '2026-04-15',
        500.00,
        25000.00,
        'upcoming'
    ),
    (
        'Seattle Casual Pool Club',
        'seattle-casual-club',
        'Laid-back weekly pool nights. All skill levels welcome. Just show up and play!',
        '8-ball',
        'beginner',
        30,
        '2026-02-01',
        '2026-12-31',
        NULL,
        25.00,
        500.00,
        'active'
    ),
    (
        'Miami Beach Billiards League',
        'miami-beach-league',
        'Beachside billiards competition. Play at South Beach''s best venues.',
        '8-ball',
        'intermediate',
        16,
        '2026-04-01',
        '2026-08-01',
        '2026-03-20',
        125.00,
        4000.00,
        'registration_open'
    ),
    (
        'Denver Mile High 8-Ball',
        'denver-mile-high-8ball',
        'Colorado''s largest amateur pool league. Over 100 players compete each season.',
        '8-ball',
        'all',
        40,
        '2026-03-01',
        '2026-07-31',
        '2026-02-20',
        60.00,
        6000.00,
        'registration_open'
    ) ON CONFLICT (slug) DO NOTHING;
-- Add some sample venue hours for claimed venues
INSERT INTO public.venue_hours (venue_id, day_of_week, open_time, close_time)
SELECT v.id,
    d.day,
    CASE
        WHEN d.day IN (0, 6) THEN '10:00'::TIME
        ELSE '14:00'::TIME
    END,
    CASE
        WHEN d.day IN (5, 6) THEN '04:00'::TIME
        ELSE '02:00'::TIME
    END
FROM public.venues v
    CROSS JOIN (
        SELECT generate_series(0, 6) AS day
    ) d
WHERE v.is_claimed = true ON CONFLICT (venue_id, day_of_week) DO NOTHING;
-- Add sample tables for some venues
INSERT INTO public.tables (
        venue_id,
        name,
        table_type,
        size,
        hourly_rate,
        is_available
    )
SELECT v.id,
    'Table ' || t.num,
    CASE
        WHEN t.num <= 8 THEN 'pool'
        WHEN t.num <= 10 THEN 'snooker'
        ELSE 'carom'
    END,
    CASE
        WHEN t.num <= 8 THEN '9ft'
        WHEN t.num <= 10 THEN '12ft'
        ELSE '10ft'
    END,
    CASE
        WHEN t.num <= 8 THEN 15.00
        WHEN t.num <= 10 THEN 25.00
        ELSE 20.00
    END,
    true
FROM public.venues v
    CROSS JOIN (
        SELECT generate_series(1, 12) AS num
    ) t
WHERE v.slug IN (
        'manhattan-billiards-nyc',
        'la-8ball-championship',
        'chicago-cue-sports',
        'vegas-billiards-royale'
    )
LIMIT 48;
SELECT 'Seed data loaded successfully!' AS status;