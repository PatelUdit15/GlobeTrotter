/**
 * GlobeTrotter — seed script
 * Usage: node src/db/seed.js
 * Seeds: users, cities, trip_templates, trips, stops, activities, expenses, community posts
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./db');

async function q(sql, params = []) {
  return pool.query(sql, params);
}

async function seed() {
  console.log('\n🌍  GlobeTrotter — seeding database...\n');

  // ── Users ──────────────────────────────────────────────────
  const aliceExists = (await q("SELECT id FROM users WHERE email='alice@example.com'")).rows.length;
  if (aliceExists) {
    console.log('  ↳ seed users already present, skipping');
  } else {
    const hash = (p) => bcrypt.hash(p, 12);
    const users = [
      { email: 'admin@globetrotter.app', password: 'Admin@1234',  first: 'Admin',  last: 'User',    is_admin: true,  tier: 'premium', city: 'San Francisco', country: 'USA', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
      { email: 'alice@example.com',      password: 'Alice@1234',  first: 'Alice',  last: 'Johnson', is_admin: false, tier: 'premium', city: 'New York',      country: 'USA', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
      { email: 'bob@example.com',        password: 'Bob@1234',    first: 'Bob',    last: 'Smith',   is_admin: false, tier: 'free',    city: 'London',        country: 'UK',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      { email: 'priya@example.com',      password: 'Priya@1234',  first: 'Priya',  last: 'Sharma',  is_admin: false, tier: 'free',    city: 'Mumbai',        country: 'India', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80' },
    ];
    for (const u of users) {
      const h = await hash(u.password);
      await q(
        `INSERT INTO users (email, password_hash, first_name, last_name, is_admin, membership_tier, city, country, avatar_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [u.email, h, u.first, u.last, u.is_admin, u.tier, u.city, u.country, u.avatar]
      );
    }
    console.log(`  ✓ seeded ${users.length} users`);
  }

  // ── Cities ─────────────────────────────────────────────────
  const existingCities = (await q('SELECT COUNT(*) FROM cities')).rows[0].count;
  if (parseInt(existingCities) > 0) {
    console.log('  ↳ cities already seeded, skipping');
  } else {
    const cities = [
      { name: 'Paris',          country: 'France',       region: 'Europe',        cost_level: 3, is_featured: true,  popularity_label: 'Trending',   popularity_score: 95, description: 'The city of love, lights, haute couture, and timeless art along the Seine.', cover_image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Tokyo',          country: 'Japan',        region: 'Asia',          cost_level: 3, is_featured: true,  popularity_label: 'Popular',    popularity_score: 94, description: 'A dazzling blend of ultra-modern neon skyscrapers and tranquil historic temples.', cover_image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Bali',           country: 'Indonesia',    region: 'Asia',          cost_level: 1, is_featured: true,  popularity_label: 'Trending',   popularity_score: 96, description: 'Tropical paradise of emerald rice terraces, cliffside temples, and serene beaches.', cover_image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80' },
      { name: 'New York',       country: 'USA',          region: 'North America', cost_level: 4, is_featured: true,  popularity_label: 'Popular',    popularity_score: 92, description: 'The iconic cultural metropolis that never sleeps, featuring Broadway and Central Park.', cover_image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Barcelona',      country: 'Spain',        region: 'Europe',        cost_level: 2, is_featured: true,  popularity_label: 'Popular',    popularity_score: 90, description: 'Whimsical Gaudí architecture, sun-kissed Mediterranean beaches, and vibrant tapas bars.', cover_image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Bangkok',        country: 'Thailand',     region: 'Asia',          cost_level: 1, is_featured: false, popularity_label: 'Budget Pick',popularity_score: 84, description: 'Street food capital of the world with ornate golden shrines and bustling floating markets.', cover_image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Cape Town',      country: 'South Africa', region: 'Africa',        cost_level: 2, is_featured: true,  popularity_label: 'Trending',   popularity_score: 91, description: 'Dramatic Table Mountain landscapes, world-class coastal wineries, and penguin beaches.', cover_image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Rio de Janeiro', country: 'Brazil',       region: 'South America', cost_level: 2, is_featured: false, popularity_label: 'Popular',    popularity_score: 83, description: 'Carnival energy, samba rhythms, Copacabana sands, and Christ the Redeemer panoramas.', cover_image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Amsterdam',      country: 'Netherlands',  region: 'Europe',        cost_level: 3, is_featured: false, popularity_label: 'Popular',    popularity_score: 85, description: 'Picturesque canal rings, historic gabled townhouses, and world-renowned cycling culture.', cover_image_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Kyoto',          country: 'Japan',        region: 'Asia',          cost_level: 2, is_featured: true,  popularity_label: 'Hidden Gem', popularity_score: 89, description: 'Ancient wooden machiya, thousands of vermilion shrines, and peaceful zen rock gardens.', cover_image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Lisbon',         country: 'Portugal',     region: 'Europe',        cost_level: 2, is_featured: false, popularity_label: 'Trending',   popularity_score: 87, description: 'Sunlit pastel hills, iconic vintage yellow trams, melancholic fado, and coastal viewpoints.', cover_image_url: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Medellín',       country: 'Colombia',     region: 'South America', cost_level: 1, is_featured: false, popularity_label: 'Hidden Gem', popularity_score: 79, description: 'The city of eternal spring nestled in the lush Aburrá Valley with vibrant street murals.', cover_image_url: 'https://images.unsplash.com/photo-1599814421111-9a7413d789bd?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Rome',           country: 'Italy',        region: 'Europe',        cost_level: 3, is_featured: true,  popularity_label: 'Popular',    popularity_score: 93, description: 'The Eternal City with the Colosseum, Roman Forum, Trevi Fountain, and exquisite culinary heritage.', cover_image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80' },
      { name: 'London',         country: 'UK',           region: 'Europe',        cost_level: 4, is_featured: true,  popularity_label: 'Popular',    popularity_score: 91, description: 'Historic royal landmarks, West End theatre, world-class museums, and diverse global dining.', cover_image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Dubai',          country: 'UAE',          region: 'Middle East',   cost_level: 4, is_featured: true,  popularity_label: 'Trending',   popularity_score: 90, description: 'Futuristic architecture, luxury shopping, golden desert dunes, and glittering coastal marinas.', cover_image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Sydney',         country: 'Australia',    region: 'Oceania',       cost_level: 3, is_featured: true,  popularity_label: 'Popular',    popularity_score: 89, description: 'Iconic Sydney Opera House, Harbour Bridge, Bondi surf culture, and pristine coastal tracks.', cover_image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Singapore',      country: 'Singapore',    region: 'Asia',          cost_level: 4, is_featured: true,  popularity_label: 'Trending',   popularity_score: 91, description: 'Futuristic Gardens by the Bay, Marina Bay skyline, lush city greenery, and Hawker food stalls.', cover_image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80' },
      { name: 'Santorini',      country: 'Greece',       region: 'Europe',        cost_level: 3, is_featured: true,  popularity_label: 'Trending',   popularity_score: 94, description: 'Cycladic whitewashed villages, blue-domed churches, volcanic cliffs, and legendary sunsets.', cover_image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80' },
    ];
    for (const c of cities) {
      await q(
        `INSERT INTO cities (name, country, region, description, cost_level, is_featured, popularity_label, popularity_score, cover_image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [c.name, c.country, c.region, c.description, c.cost_level, c.is_featured, c.popularity_label, c.popularity_score, c.cover_image_url]
      );
    }
    console.log(`  ✓ seeded ${cities.length} cities`);
  }

  // ── Trip Templates ─────────────────────────────────────────
  const existingTemplates = (await q('SELECT COUNT(*) FROM trip_templates')).rows[0].count;
  if (parseInt(existingTemplates) > 0) {
    console.log('  ↳ templates already seeded, skipping');
  } else {
    const templates = [
      { title: 'European Highlights',        category: 'Cultural',    duration: 14, budget: 3500, badge: 'Popular',    tags: 'europe,culture,history,art',             cover_image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80', description: 'Classic grand tour exploring the wonders of Paris, Barcelona, and Amsterdam.' },
      { title: 'Southeast Asia Backpacker',  category: 'Adventure',   duration: 21, budget: 1800, badge: 'Budget',     tags: 'asia,budget,beaches,food',               cover_image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80', description: 'Island hopping and cultural discovery across Thailand, Bali, and Vietnam.' },
      { title: 'Japan Cherry Blossom',       category: 'Nature',      duration: 10, budget: 2800, badge: 'Seasonal',   tags: 'japan,nature,sakura,culture',            cover_image_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80', description: 'Experience the magic of sakura season in Tokyo, Kyoto, and Mount Fuji.' },
      { title: 'South American Adventure',   category: 'Adventure',   duration: 18, budget: 2200, badge: 'New',        tags: 'south-america,adventure,nature,wildlife', cover_image_url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80', description: 'Vibrant cities and breathtaking wilderness in Rio, Medellín, and Patagonia.' },
      { title: 'African Safari',             category: 'Wildlife',    duration: 12, budget: 5000, badge: 'Premium',    tags: 'africa,safari,wildlife,nature',          cover_image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80', description: 'The ultimate Big Five wildlife expedition across South Africa and Kenya.' },
    ];
    for (const t of templates) {
      await q(
        `INSERT INTO trip_templates (title, category, duration_days, estimated_budget, badge, tags, description, cover_image_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [t.title, t.category, t.duration, t.budget, t.badge, t.tags, t.description, t.cover_image_url]
      );
    }
    console.log(`  ✓ seeded ${templates.length} trip templates`);
  }

  // ── Trips, Stops, Activities, Expenses ────────────────────
  const existingTrips = (await q('SELECT COUNT(*) FROM trips')).rows[0].count;
  if (parseInt(existingTrips) > 0) {
    console.log('  ↳ trips already seeded, skipping');
  } else {
    const alice = (await q("SELECT id FROM users WHERE email='alice@example.com'")).rows[0];
    const bob   = (await q("SELECT id FROM users WHERE email='bob@example.com'")).rows[0];

    // Alice — upcoming Europe trip (public)
    const { rows: [europeTrip] } = await q(
      `INSERT INTO trips (owner_id, title, description, cover_image_url, start_date, end_date, status, visibility)
       VALUES ($1,'European Summer 2025','Two weeks in Paris and Barcelona.',
               'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
               NOW()::date + 30, NOW()::date + 44, 'upcoming', 'public') RETURNING *`,
      [alice.id]
    );
    await q('INSERT INTO budgets (trip_id, total_budget, currency) VALUES ($1,3500,\'USD\')', [europeTrip.id]);

    const { rows: [paris] } = await q(
      `INSERT INTO trip_stops (trip_id, city_name, country, duration_nights, accommodation, sort_order)
       VALUES ($1,'Paris','France',7,'Hotel des Arts, Montmartre',0) RETURNING *`,
      [europeTrip.id]
    );
    const { rows: [barcelona] } = await q(
      `INSERT INTO trip_stops (trip_id, city_name, country, duration_nights, accommodation, sort_order)
       VALUES ($1,'Barcelona','Spain',7,'Hotel Arts Barcelona',1) RETURNING *`,
      [europeTrip.id]
    );

    const parisActivities = [
      { name: 'Eiffel Tower', cat: 'sightseeing', start: '10:00', end: '12:00', cost: 28, order: 0 },
      { name: 'Louvre Museum', cat: 'sightseeing', start: '14:00', end: '17:00', cost: 17, order: 1 },
      { name: 'Seine River Cruise', cat: 'activity', start: '19:00', end: '20:00', cost: 15, order: 2 },
    ];
    for (const a of parisActivities) {
      await q(
        `INSERT INTO activities (stop_id, name, category, start_time, end_time, cost, added_by_user_id, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [paris.id, a.name, a.cat, a.start, a.end, a.cost, alice.id, a.order]
      );
    }
    await q(
      `INSERT INTO activities (stop_id, name, category, start_time, end_time, cost, added_by_user_id, sort_order)
       VALUES ($1,'Sagrada Família','sightseeing','09:00','11:00',26,$2,0)`,
      [barcelona.id, alice.id]
    );

    const expenses = [
      { desc: 'Return flights', cat: 'flights',       amount: 850,  status: 'paid' },
      { desc: 'Paris hotel (7 nights)', cat: 'accommodation', amount: 980, status: 'paid' },
      { desc: 'Barcelona hotel (7 nights)', cat: 'accommodation', amount: 840, status: 'pending' },
    ];
    for (const e of expenses) {
      await q(
        `INSERT INTO expenses (trip_id, description, category, amount, status) VALUES ($1,$2,$3,$4,$5)`,
        [europeTrip.id, e.desc, e.cat, e.amount, e.status]
      );
    }

    // Bob — completed Japan trip (private)
    const { rows: [japanTrip] } = await q(
      `INSERT INTO trips (owner_id, title, description, cover_image_url, start_date, end_date, status, visibility)
       VALUES ($1,'Japan Cherry Blossom','Tokyo and Kyoto during sakura season.',
               'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
               NOW()::date - 40, NOW()::date - 30, 'completed', 'private') RETURNING *`,
      [bob.id]
    );
    await q('INSERT INTO budgets (trip_id, total_budget, currency) VALUES ($1,2800,\'USD\')', [japanTrip.id]);

    const { rows: [tokyo] } = await q(
      `INSERT INTO trip_stops (trip_id, city_name, country, duration_nights, sort_order)
       VALUES ($1,'Tokyo','Japan',5,0) RETURNING *`,
      [japanTrip.id]
    );
    const { rows: [kyoto] } = await q(
      `INSERT INTO trip_stops (trip_id, city_name, country, duration_nights, sort_order)
       VALUES ($1,'Kyoto','Japan',5,1) RETURNING *`,
      [japanTrip.id]
    );
    await q(`INSERT INTO activities (stop_id, name, category, cost, added_by_user_id, sort_order) VALUES ($1,'Shibuya Crossing','sightseeing',0,$2,0)`, [tokyo.id, bob.id]);
    await q(`INSERT INTO activities (stop_id, name, category, cost, added_by_user_id, sort_order) VALUES ($1,'Fushimi Inari Shrine','sightseeing',0,$2,0)`, [kyoto.id, bob.id]);

    console.log('  ✓ seeded trips, stops, activities, and expenses');
  }

  // ── Community Posts ────────────────────────────────────────
  const existingPosts = (await q('SELECT COUNT(*) FROM community_posts')).rows[0].count;
  if (parseInt(existingPosts) > 0) {
    console.log('  ↳ community posts already seeded, skipping');
  } else {
    const alice = (await q("SELECT id FROM users WHERE email='alice@example.com'")).rows[0];
    const bob   = (await q("SELECT id FROM users WHERE email='bob@example.com'")).rows[0];

    const posts = [
      {
        author: alice,
        title: 'A perfect week in Paris',
        content: 'Paris in autumn is magical. Here is my full 7-day itinerary...',
        location: 'Paris',
        tags: ['europe','france','travel-tips','budget'],
        images: [
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        author: alice,
        title: 'Bali on $50/day — is it possible?',
        content: 'Short answer: yes! Here is exactly how I did it for 2 weeks.',
        location: 'Bali',
        tags: ['asia','budget','bali','indonesia'],
        images: [
          'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        author: bob,
        title: 'Japan cherry blossom guide 2024',
        content: 'Timing is everything for sakura season. Tokyo Shinjuku Gyoen hit peak bloom on March 28.',
        location: 'Tokyo',
        tags: ['japan','sakura','nature','asia'],
        images: [
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80',
        ],
      },
      {
        author: bob,
        title: 'Hidden gems in Kyoto no one talks about',
        content: 'Everyone goes to Fushimi Inari. Here are 5 spots I had almost entirely to myself...',
        location: 'Kyoto',
        tags: ['japan','kyoto','hidden-gems','culture'],
        images: [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
        ],
      },
    ];

    for (const p of posts) {
      const { rows: [post] } = await q(
        'INSERT INTO community_posts (author_id, title, content, location) VALUES ($1,$2,$3,$4) RETURNING id',
        [p.author.id, p.title, p.content, p.location]
      );
      for (const tag of p.tags) {
        await q('INSERT INTO post_tags (post_id, tag) VALUES ($1,$2)', [post.id, tag]);
      }
      if (p.images && p.images.length > 0) {
        for (let idx = 0; idx < p.images.length; idx++) {
          await q('INSERT INTO post_images (post_id, image_url, sort_order) VALUES ($1, $2, $3)', [post.id, p.images[idx], idx]);
        }
      }
    }
    console.log(`  ✓ seeded ${posts.length} community posts and images`);
  }

  console.log('\n✅  Seed completed!\n');
  console.log('  Default accounts:');
  console.log('  admin@globetrotter.app  /  Admin@1234  (admin)');
  console.log('  alice@example.com       /  Alice@1234');
  console.log('  bob@example.com         /  Bob@1234\n');
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
}).finally(() => pool.end());
