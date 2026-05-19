/**
 * Run: node scripts/seedCategories.js
 * Creates default browse categories if none exist.
 */
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Category = require('../models/Category');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const defaults = [
  { name: 'Top Picks', slug: 'top-picks', displayOrder: 1, sortBy: 'views' },
  { name: 'Trending', slug: 'trending', displayOrder: 2, sortBy: 'rating' },
  { name: 'New Releases', slug: 'new-releases', displayOrder: 3, sortBy: 'createdAt' },
  { name: 'Action', slug: 'action', displayOrder: 4, sortBy: 'views' },
  { name: 'Drama', slug: 'drama', displayOrder: 5, sortBy: 'rating' },
  { name: 'Coming Soon', slug: 'coming-soon', displayOrder: 6, sortBy: 'releaseYear' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await Category.countDocuments();
  if (count > 0) {
    console.log(`Categories already exist (${count}). Skipping seed.`);
    process.exit(0);
  }
  await Category.insertMany(defaults.map((c) => ({ ...c, isActive: true, showOnHome: true })));
  console.log(`Seeded ${defaults.length} categories.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
