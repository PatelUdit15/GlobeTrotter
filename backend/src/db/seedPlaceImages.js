/**
 * GlobeTrotter — Seed & Update Place Images in PostgreSQL Database
 * Usage: node src/db/seedPlaceImages.js
 */
require('dotenv').config();
const { pool } = require('./db');

async function q(sql, params = []) {
  return pool.query(sql, params);
}

const CITIES_DATA = [
  {
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    cost_level: 3,
    is_featured: true,
    popularity_label: 'Trending',
    popularity_score: 95,
    description: 'The city of love, lights, haute couture, and timeless art along the Seine.',
    cover_image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    region: 'Asia',
    cost_level: 3,
    is_featured: true,
    popularity_label: 'Popular',
    popularity_score: 94,
    description: 'A dazzling blend of ultra-modern neon skyscrapers and tranquil historic temples.',
    cover_image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    cost_level: 1,
    is_featured: true,
    popularity_label: 'Trending',
    popularity_score: 96,
    description: 'Tropical paradise of emerald rice terraces, cliffside temples, and serene beaches.',
    cover_image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'New York',
    country: 'USA',
    region: 'North America',
    cost_level: 4,
    is_featured: true,
    popularity_label: 'Popular',
    popularity_score: 92,
    description: 'The iconic cultural metropolis that never sleeps, featuring Broadway and Central Park.',
    cover_image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    cost_level: 2,
    is_featured: true,
    popularity_label: 'Popular',
    popularity_score: 90,
    description: 'Whimsical Gaudí architecture, sun-kissed Mediterranean beaches, and vibrant tapas bars.',
    cover_image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    region: 'Asia',
    cost_level: 1,
    is_featured: false,
    popularity_label: 'Budget Pick',
    popularity_score: 84,
    description: 'Street food capital of the world with ornate golden shrines and bustling floating markets.',
    cover_image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    cost_level: 2,
    is_featured: true,
    popularity_label: 'Trending',
    popularity_score: 91,
    description: 'Dramatic Table Mountain landscapes, world-class coastal wineries, and penguin beaches.',
    cover_image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'South America',
    cost_level: 2,
    is_featured: false,
    popularity_label: 'Popular',
    popularity_score: 83,
    description: 'Carnival energy, samba rhythms, Copacabana sands, and Christ the Redeemer panoramas.',
    cover_image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    region: 'Europe',
    cost_level: 3,
    is_featured: false,
    popularity_label: 'Popular',
    popularity_score: 85,
    description: 'Picturesque canal rings, historic gabled townhouses, and world-renowned cycling culture.',
    cover_image_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    cost_level: 2,
    is_featured: true,
    popularity_label: 'Hidden Gem',
    popularity_score: 89,
    description: 'Ancient wooden machiya, thousands of vermilion shrines, and peaceful zen rock gardens.',
    cover_image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Lisbon',
    country: 'Portugal',
    region: 'Europe',
    cost_level: 2,
    is_featured: false,
    popularity_label: 'Trending',
    popularity_score: 87,
    description: 'Sunlit pastel hills, iconic vintage yellow trams, melancholic fado, and coastal viewpoints.',
    cover_image_url: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Medellín',
    country: 'Colombia',
    region: 'South America',
    cost_level: 1,
    is_featured: false,
    popularity_label: 'Hidden Gem',
    popularity_score: 79,
    description: 'The city of eternal spring nestled in the lush Aburrá Valley with vibrant street murals.',
    cover_image_url: 'https://images.unsplash.com/photo-1599814421111-9a7413d789bd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    cost_level: 3,
    is_featured: true,
    popularity_label: 'Popular',
    popularity_score: 93,
    description: 'The Eternal City with the Colosseum, Roman Forum, Trevi Fountain, and exquisite culinary heritage.',
    cover_image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'London',
    country: 'UK',
    region: 'Europe',
    cost_level: 4,
    is_featured: true,
    popularity_label: 'Popular',
    popularity_score: 91,
    description: 'Historic royal landmarks, West End theatre, world-class museums, and diverse global dining.',
    cover_image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Dubai',
    country: 'UAE',
    region: 'Middle East',
    cost_level: 4,
    is_featured: true,
    popularity_label: 'Trending',
    popularity_score: 90,
    description: 'Futuristic architecture, luxury shopping, golden desert dunes, and glittering coastal marinas.',
    cover_image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    cost_level: 3,
    is_featured: true,
    popularity_label: 'Popular',
    popularity_score: 89,
    description: 'Iconic Sydney Opera House, Harbour Bridge, Bondi surf culture, and pristine coastal tracks.',
    cover_image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    cost_level: 4,
    is_featured: true,
    popularity_label: 'Trending',
    popularity_score: 91,
    description: 'Futuristic Gardens by the Bay, Marina Bay skyline, lush city greenery, and Hawker food stalls.',
    cover_image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    cost_level: 3,
    is_featured: true,
    popularity_label: 'Trending',
    popularity_score: 94,
    description: 'Cycladic whitewashed villages, blue-domed churches, volcanic cliffs, and legendary sunsets.',
    cover_image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    cost_level: 1,
    is_featured: false,
    popularity_label: 'Hidden Gem',
    popularity_score: 82,
    description: 'Timeless Pyramids of Giza, the Great Sphinx, Nile River cruises, and historic Khan el-Khalili bazaar.',
    cover_image_url: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Reykjavik',
    country: 'Iceland',
    region: 'Europe',
    cost_level: 4,
    is_featured: false,
    popularity_label: 'Adventure',
    popularity_score: 86,
    description: 'Gateway to cascading waterfalls, steaming geothermal lagoons, glaciers, and Northern Lights.',
    cover_image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cusco',
    country: 'Peru',
    region: 'South America',
    cost_level: 2,
    is_featured: false,
    popularity_label: 'Adventure',
    popularity_score: 85,
    description: 'Ancient capital of the Inca Empire in the Andes, gateway to mystical Machu Picchu.',
    cover_image_url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Istanbul',
    country: 'Turkey',
    region: 'Europe',
    cost_level: 2,
    is_featured: false,
    popularity_label: 'Cultural',
    popularity_score: 88,
    description: 'Where East meets West across the Bosphorus, adorned with Hagia Sophia and the Grand Bazaar.',
    cover_image_url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'San Francisco',
    country: 'USA',
    region: 'North America',
    cost_level: 4,
    is_featured: false,
    popularity_label: 'Popular',
    popularity_score: 84,
    description: 'The Golden Gate Bridge, rolling hills with cable cars, Victorian Painted Ladies, and bay vistas.',
    cover_image_url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Prague',
    country: 'Czech Republic',
    region: 'Europe',
    cost_level: 2,
    is_featured: false,
    popularity_label: 'Hidden Gem',
    popularity_score: 83,
    description: 'The City of a Hundred Spires, historic Charles Bridge, fairytale castle, and Bohemian beer gardens.',
    cover_image_url: 'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Venice',
    country: 'Italy',
    region: 'Europe',
    cost_level: 3,
    is_featured: true,
    popularity_label: 'Trending',
    popularity_score: 92,
    description: 'Enchanting floating city of romantic gondolas, bridges, and Venetian Gothic palaces.',
    cover_image_url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Seoul',
    country: 'South Korea',
    region: 'Asia',
    cost_level: 2,
    is_featured: false,
    popularity_label: 'Trending',
    popularity_score: 88,
    description: 'Vibrant K-culture hub where royal palaces meet high-tech innovation and night markets.',
    cover_image_url: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80',
  },
];

const TEMPLATES_DATA = [
  {
    title: 'European Highlights',
    category: 'Cultural',
    duration_days: 14,
    estimated_budget: 3500,
    badge: 'Popular',
    tags: 'europe,culture,history,art',
    description: 'Classic grand tour exploring the wonders of Paris, Barcelona, and Amsterdam.',
    cover_image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Southeast Asia Backpacker',
    category: 'Adventure',
    duration_days: 21,
    estimated_budget: 1800,
    badge: 'Budget',
    tags: 'asia,budget,beaches,food',
    description: 'Island hopping and cultural discovery across Thailand, Bali, and Vietnam.',
    cover_image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Japan Cherry Blossom',
    category: 'Nature',
    duration_days: 10,
    estimated_budget: 2800,
    badge: 'Seasonal',
    tags: 'japan,nature,sakura,culture',
    description: 'Experience the magic of sakura season in Tokyo, Kyoto, and Mount Fuji.',
    cover_image_url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'South American Adventure',
    category: 'Adventure',
    duration_days: 18,
    estimated_budget: 2200,
    badge: 'New',
    tags: 'south-america,adventure,nature,wildlife',
    description: 'Vibrant cities and breathtaking wilderness in Rio, Medellín, and Patagonia.',
    cover_image_url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'African Safari',
    category: 'Wildlife',
    duration_days: 12,
    estimated_budget: 5000,
    badge: 'Premium',
    tags: 'africa,safari,wildlife,nature',
    description: 'The ultimate Big Five wildlife expedition across South Africa and Kenya.',
    cover_image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
  },
];

const USER_AVATARS = {
  'admin@globetrotter.app': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'alice@example.com':      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'bob@example.com':        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'priya@example.com':      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
};

async function seedPlaceImages() {
  console.log('🚀 Starting Place Images Seed...\n');

  // 1. Update/insert cities
  console.log('📍 Updating & seeding cities with images...');
  for (const c of CITIES_DATA) {
    const existing = await q('SELECT id FROM cities WHERE name = $1 LIMIT 1', [c.name]);
    if (existing.rows.length > 0) {
      await q(
        `UPDATE cities
         SET country = $1, region = $2, description = $3, cost_level = $4,
             is_featured = $5, popularity_label = $6, popularity_score = $7,
             cover_image_url = $8
         WHERE name = $9`,
        [c.country, c.region, c.description, c.cost_level, c.is_featured, c.popularity_label, c.popularity_score, c.cover_image_url, c.name]
      );
      console.log(`  ✓ Updated city: ${c.name} (${c.country})`);
    } else {
      await q(
        `INSERT INTO cities (name, country, region, description, cost_level, is_featured, popularity_label, popularity_score, cover_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [c.name, c.country, c.region, c.description, c.cost_level, c.is_featured, c.popularity_label, c.popularity_score, c.cover_image_url]
      );
      console.log(`  + Inserted new city: ${c.name} (${c.country})`);
    }
  }

  // 2. Recreate/Update 'destinations' view to include both cover_image_url and image_url
  console.log('\n👁️ Updating destinations view...');
  await q(`DROP VIEW IF EXISTS destinations;`);
  await q(`
    CREATE VIEW destinations AS
      SELECT
        id,
        name,
        region,
        country,
        cover_image_url,
        cover_image_url  AS image_url,
        popularity_score,
        is_featured,
        cost_level,
        popularity_label
      FROM cities;
  `);
  console.log('  ✓ destinations view updated');

  // 3. Update trip templates
  console.log('\n🗺️ Updating trip templates with cover images...');
  for (const t of TEMPLATES_DATA) {
    const existing = await q('SELECT id FROM trip_templates WHERE title = $1 LIMIT 1', [t.title]);
    if (existing.rows.length > 0) {
      await q(
        `UPDATE trip_templates
         SET category = $1, duration_days = $2, estimated_budget = $3,
             badge = $4, tags = $5, description = $6, cover_image_url = $7
         WHERE title = $8`,
        [t.category, t.duration_days, t.estimated_budget, t.badge, t.tags, t.description, t.cover_image_url, t.title]
      );
      console.log(`  ✓ Updated template: ${t.title}`);
    } else {
      await q(
        `INSERT INTO trip_templates (title, category, duration_days, estimated_budget, badge, tags, description, cover_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [t.title, t.category, t.duration_days, t.estimated_budget, t.badge, t.tags, t.description, t.cover_image_url]
      );
      console.log(`  + Inserted template: ${t.title}`);
    }
  }

  // 4. Update trips with images
  console.log('\n🧳 Updating existing trips with cover images...');
  const tripsRes = await q('SELECT id, title, cover_image_url FROM trips');
  for (const trip of tripsRes.rows) {
    let coverUrl = trip.cover_image_url;
    if (!coverUrl) {
      if (trip.title.toLowerCase().includes('europe') || trip.title.toLowerCase().includes('paris')) {
        coverUrl = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80';
      } else if (trip.title.toLowerCase().includes('japan') || trip.title.toLowerCase().includes('tokyo') || trip.title.toLowerCase().includes('kyoto')) {
        coverUrl = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80';
      } else if (trip.title.toLowerCase().includes('bali')) {
        coverUrl = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80';
      } else {
        coverUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
      }
      await q('UPDATE trips SET cover_image_url = $1 WHERE id = $2', [coverUrl, trip.id]);
      console.log(`  ✓ Updated trip [${trip.id}] "${trip.title}"`);
    }
  }

  // 5. Seed post_images for community posts
  console.log('\n📸 Seeding post_images for community posts...');
  const postsRes = await q('SELECT id, location, title FROM community_posts');
  for (const p of postsRes.rows) {
    const imgCount = (await q('SELECT COUNT(*) FROM post_images WHERE post_id = $1', [p.id])).rows[0].count;
    if (parseInt(imgCount) === 0) {
      let urls = [];
      const loc = (p.location || '').toLowerCase();
      if (loc.includes('paris')) {
        urls = [
          'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
        ];
      } else if (loc.includes('bali')) {
        urls = [
          'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        ];
      } else if (loc.includes('tokyo')) {
        urls = [
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=80',
        ];
      } else if (loc.includes('kyoto')) {
        urls = [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80',
        ];
      } else {
        urls = [
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
        ];
      }

      for (let i = 0; i < urls.length; i++) {
        await q(
          'INSERT INTO post_images (post_id, image_url, sort_order) VALUES ($1, $2, $3)',
          [p.id, urls[i], i]
        );
      }
      console.log(`  ✓ Inserted ${urls.length} images for post [${p.id}] "${p.title}"`);
    }
  }

  // 6. Update user avatars
  console.log('\n👤 Updating user avatars...');
  for (const [email, avatar] of Object.entries(USER_AVATARS)) {
    await q('UPDATE users SET avatar_url = $1 WHERE email = $2 AND avatar_url IS NULL', [avatar, email]);
  }
  // Also set default avatar for any other user with null avatar
  await q(`
    UPDATE users
    SET avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
    WHERE avatar_url IS NULL
  `);
  console.log('  ✓ User avatars updated');

  console.log('\n✨ All place images successfully updated in PostgreSQL database!\n');
}

seedPlaceImages()
  .catch((err) => {
    console.error('❌ Failed seeding place images:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
