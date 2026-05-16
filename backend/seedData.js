const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Series = require('./models/Series');
const Episode = require('./models/Episode');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const sampleSeries = [
  {
    title: "Shadow Chronicles",
    description: "In a world where shadows come alive, one young warrior must find the light to save humanity from eternal darkness. A gripping tale of courage, betrayal, and magic.",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
    genre: ["Action", "Fantasy", "Drama"],
    releaseYear: 2024,
    rating: 8.5,
    totalEpisodes: 3,
    status: "ongoing",
    categories: ["top-picks", "new-releases"],
    isPublished: true
  },
  {
    title: "Cyber Pulse",
    description: "Neo-Tokyo, 2077. A rogue AI has taken over the city's infrastructure. Only a team of mismatched hackers can stop the impending digital apocalypse.",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop",
    genre: ["Sci-Fi", "Thriller"],
    releaseYear: 2023,
    rating: 9.0,
    totalEpisodes: 2,
    status: "completed",
    categories: ["recommended", "top-picks"],
    isPublished: true
  },
  {
    title: "Eternal Summer",
    description: "A group of friends rediscover the meaning of life and love during their final summer before college in a small coastal town.",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop",
    banner: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2070&auto=format&fit=crop",
    genre: ["Romance", "Slice of Life"],
    releaseYear: 2024,
    rating: 7.8,
    totalEpisodes: 2,
    status: "ongoing",
    categories: ["new-releases", "recommended"],
    isPublished: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Series.deleteMany({});
    await Episode.deleteMany({});
    console.log('Cleared existing data');

    for (const s of sampleSeries) {
      const series = await Series.create(s);
      console.log(`Created series: ${series.title}`);

      // Create episodes for each series
      for (let i = 1; i <= s.totalEpisodes; i++) {
        await Episode.create({
          series: series._id,
          episodeNumber: i,
          title: `Episode ${i}: ${s.title} Begins`,
          description: `This is the exciting start of ${s.title}. Discover the secrets hidden within.`,
          thumbnail: s.thumbnail,
          video: {
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            publicId: `sample_vid_${series._id}_${i}`,
            duration: 600
          },
          isPublished: true
        });
      }
      console.log(`Created ${s.totalEpisodes} episodes for ${series.title}`);
    }

    console.log('Database seeded successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDB();
