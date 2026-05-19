/**
 * Ensures all published series appear on homepage (browse categories + legacy tags).
 * Run: node scripts/fixPublishedSeries.js
 */
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Series = require('../models/Series');
const Category = require('../models/Category');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const defaultCats = await Category.find({
    slug: { $in: ['new-releases', 'top-picks'] },
    isActive: true
  });
  const defaultIds = defaultCats.map((c) => c._id);

  const seriesList = await Series.find({});
  let fixed = 0;

  for (const s of seriesList) {
    let changed = false;

    if (s.isPublished) {
      const existing = new Set((s.browseCategories || []).map(String));
      defaultIds.forEach((id) => {
        if (!existing.has(String(id))) {
          existing.add(String(id));
          changed = true;
        }
      });
      if (changed) {
        s.browseCategories = [...existing];
      }
      if (!s.categories || s.categories.length === 0) {
        s.categories = ['new-releases'];
        changed = true;
      }
    }

    if (changed) {
      await s.save();
      console.log('Updated:', s.title);
      fixed += 1;
    }
  }

  const shin = await Series.findOne({ title: /shinchan/i });
  if (shin) {
    console.log('\nShinchan status:', {
      title: shin.title,
      isPublished: shin.isPublished,
      browseCategories: shin.browseCategories?.length,
      categories: shin.categories
    });
  }

  console.log(`\nDone. Updated ${fixed} series.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
