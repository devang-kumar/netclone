/**
 * Full database seed — categories, series, episodes, demo users.
 * Run: node seedData.js   (from backend folder)
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Series = require('./models/Series');
const Episode = require('./models/Episode');
const Category = require('./models/Category');
const User = require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
];

const categoriesSeed = [
  { name: 'Top Picks', slug: 'top-picks', displayOrder: 1, sortBy: 'views', showOnHome: true },
  { name: 'Trending Now', slug: 'trending', displayOrder: 2, sortBy: 'rating', showOnHome: true },
  { name: 'New Releases', slug: 'new-releases', displayOrder: 3, sortBy: 'createdAt', showOnHome: true },
  { name: 'Action', slug: 'action', displayOrder: 4, sortBy: 'views', showOnHome: true },
  { name: 'Drama', slug: 'drama', displayOrder: 5, sortBy: 'rating', showOnHome: true },
  { name: 'Romance', slug: 'romance', displayOrder: 6, sortBy: 'rating', showOnHome: true },
  { name: 'Sci-Fi', slug: 'sci-fi', displayOrder: 7, sortBy: 'views', showOnHome: true },
  { name: 'Coming Soon', slug: 'coming-soon', displayOrder: 8, sortBy: 'releaseYear', showOnHome: true },
];

const seriesSeed = [
  {
    title: 'Shadow Chronicles',
    description:
      'In a world where shadows come alive, a young warrior must find the light to save humanity. Courage, betrayal, and magic collide in this epic short-form saga.',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80',
    genre: ['Action', 'Fantasy', 'Drama'],
    director: 'Alex Rivera',
    releaseYear: 2024,
    rating: 8.5,
    views: 12400,
    status: 'ongoing',
    categories: ['top-picks', 'new-releases'],
    categorySlugs: ['top-picks', 'action', 'new-releases'],
    episodeCount: 3,
  },
  {
    title: 'Cyber Pulse',
    description:
      'Neo-Tokyo, 2077. A rogue AI controls the city grid. A team of hackers races against time to prevent a digital apocalypse.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1920&q=80',
    genre: ['Sci-Fi', 'Thriller'],
    director: 'Mika Tanaka',
    releaseYear: 2023,
    rating: 9.0,
    views: 18900,
    status: 'completed',
    categories: ['recommended', 'top-picks'],
    categorySlugs: ['top-picks', 'trending', 'sci-fi'],
    episodeCount: 3,
  },
  {
    title: 'Eternal Summer',
    description:
      'Friends reunite for one last summer by the coast before life pulls them apart. A tender story of love, memory, and growing up.',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80',
    genre: ['Romance', 'Drama'],
    director: 'Sofia Mendez',
    releaseYear: 2024,
    rating: 7.8,
    views: 9200,
    status: 'ongoing',
    categories: ['new-releases', 'recommended'],
    categorySlugs: ['new-releases', 'romance', 'drama'],
    episodeCount: 2,
  },
  {
    title: 'Midnight Heist',
    description:
      'Six strangers plan the perfect vault robbery. When masks come off, loyalty is the first casualty.',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1920&q=80',
    genre: ['Thriller', 'Crime'],
    director: 'Jordan Blake',
    releaseYear: 2024,
    rating: 8.7,
    views: 15600,
    status: 'ongoing',
    categories: ['top-picks', 'recommended'],
    categorySlugs: ['trending', 'action', 'top-picks'],
    episodeCount: 4,
  },
  {
    title: 'Crown of Ash',
    description:
      'A fallen queen returns to reclaim her throne from the brother who betrayed her. Court intrigue meets battlefield glory.',
    thumbnail: 'https://images.unsplash.com/photo-1518676590629-556dc42a8803?w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1920&q=80',
    genre: ['Drama', 'Fantasy'],
    director: 'Elena Voss',
    releaseYear: 2023,
    rating: 8.2,
    views: 11300,
    status: 'completed',
    categories: ['recommended'],
    categorySlugs: ['drama', 'trending'],
    episodeCount: 3,
  },
  {
    title: 'Neon Knights',
    description:
      'Street racers with nothing left to lose compete in an underground circuit where the prize is freedom — or oblivion.',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1535013417620-29a1aabebd9a?w=1920&q=80',
    genre: ['Action', 'Drama'],
    director: 'Chris Park',
    releaseYear: 2024,
    rating: 8.0,
    views: 8700,
    status: 'ongoing',
    categories: ['new-releases'],
    categorySlugs: ['action', 'new-releases'],
    episodeCount: 2,
  },
  {
    title: 'Whisper Valley',
    description:
      'A detective arrives in a fog-shrouded town where every resident hides the same secret. Nothing is as quiet as it seems.',
    thumbnail: 'https://images.unsplash.com/photo-1594909126639-884965a066ad?w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1534802046520-4f23db94c6ed?w=1920&q=80',
    genre: ['Mystery', 'Thriller'],
    director: 'Nora Finch',
    releaseYear: 2025,
    rating: 7.5,
    views: 2100,
    status: 'upcoming',
    categories: ['upcoming'],
    categorySlugs: ['coming-soon'],
    episodeCount: 1,
    isPublished: true,
  },
  {
    title: 'Starfall Academy',
    description:
      'Gifted students train to defend Earth from cosmic threats — but the greatest danger may be inside the academy walls.',
    thumbnail: 'https://images.unsplash.com/photo-1419242902214-272b4f66e36c?w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    genre: ['Sci-Fi', 'Fantasy', 'Drama'],
    director: 'David Okonkwo',
    releaseYear: 2024,
    rating: 8.9,
    views: 20100,
    status: 'ongoing',
    categories: ['top-picks', 'new-releases'],
    categorySlugs: ['sci-fi', 'top-picks', 'trending', 'new-releases'],
    episodeCount: 3,
  },
];

const episodeTitles = [
  ['The Awakening', 'Into the Dark', 'Last Light', 'Reckoning'],
  ['System Breach', 'Ghost Protocol', 'Final Upload'],
  ['First Wave', 'Broken Ties'],
  ['The Plan', 'Inside Job', 'Double Cross', 'Getaway'],
  ['Exile', 'Return', 'Coronation'],
  ['Starting Line', 'Red Zone'],
  ['Arrival'],
  ['Orientation', 'Trial by Fire', 'Skyfall'],
];

async function ensureUser({ name, email, password, role }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, password, role });
    console.log(`  Created ${role}: ${email} / ${password}`);
  } else {
    console.log(`  ${role} exists: ${email}`);
  }
  return user;
}

async function seedDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ott-platform';
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.\n');

  console.log('Clearing series, episodes, categories...');
  await Episode.deleteMany({});
  await Series.deleteMany({});
  await Category.deleteMany({});

  console.log('Seeding categories...');
  const categories = await Category.insertMany(
    categoriesSeed.map((c) => ({ ...c, isActive: true }))
  );
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]));
  console.log(`  ${categories.length} categories created.\n`);

  console.log('Seeding users...');
  await ensureUser({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
  });
  await ensureUser({
    name: 'Demo Viewer',
    email: 'demo@example.com',
    password: 'demo123',
    role: 'user',
  });
  console.log('');

  console.log('Seeding series & episodes...');
  let videoIndex = 0;

  for (let sIdx = 0; sIdx < seriesSeed.length; sIdx++) {
    const s = seriesSeed[sIdx];
    const browseCategories = (s.categorySlugs || [])
      .map((slug) => catBySlug[slug])
      .filter(Boolean);

    const series = await Series.create({
      title: s.title,
      description: s.description,
      thumbnail: s.thumbnail,
      banner: s.banner,
      genre: s.genre,
      director: s.director,
      releaseYear: s.releaseYear,
      rating: s.rating,
      views: s.views || 0,
      totalEpisodes: s.episodeCount,
      status: s.status,
      categories: s.categories || [],
      browseCategories,
      isPublished: s.isPublished !== false,
    });

    const titles = episodeTitles[sIdx] || [];
    for (let i = 1; i <= s.episodeCount; i++) {
      const videoUrl = SAMPLE_VIDEOS[videoIndex % SAMPLE_VIDEOS.length];
      videoIndex += 1;

      await Episode.create({
        series: series._id,
        episodeNumber: i,
        title: titles[i - 1] || `Episode ${i}`,
        description: `${titles[i - 1] || `Episode ${i}`} of ${s.title} — the story intensifies.`,
        thumbnail: s.thumbnail,
        video: {
          url: videoUrl,
          publicId: `seed_${series._id}_ep${i}`,
          duration: 596 + i * 30,
        },
        isPublished: true,
      });
    }

    console.log(`  ${series.title} — ${s.episodeCount} episodes`);
  }

  console.log('\n========================================');
  console.log('Seed complete! Your site is ready.');
  console.log('========================================');
  console.log('\nLogin accounts:');
  console.log('  Admin:  admin@example.com / admin123');
  console.log('  Viewer: demo@example.com  / demo123');
  console.log('\nStart app: npm run dev:full (from project root)');
  console.log('========================================\n');

  await mongoose.connection.close();
  process.exit(0);
}

seedDB().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
