const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const Series = require('../models/Series');
const Episode = require('../models/Episode');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

const clearDatabase = async () => {
  try {
    console.log('🗑️  Starting database cleanup...');

    // Delete all episodes
    const episodesDeleted = await Episode.deleteMany({});
    console.log(`✅ Deleted ${episodesDeleted.deletedCount} episodes`);

    // Delete all series
    const seriesDeleted = await Series.deleteMany({});
    console.log(`✅ Deleted ${seriesDeleted.deletedCount} series`);

    console.log('🎉 Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

// Run the cleanup
clearDatabase();
