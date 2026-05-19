const express = require('express');
const router = express.Router();
const Series = require('../models/Series');
const Category = require('../models/Category');
const { cacheMiddleware } = require('../middleware/cache');

const sortMap = {
  views: { views: -1 },
  rating: { rating: -1 },
  createdAt: { createdAt: -1 },
  releaseYear: { releaseYear: -1 }
};

const LEGACY_CATEGORY_SLUGS = ['top-picks', 'recommended', 'new-releases', 'upcoming'];

const slugToLegacyTag = (slug) => {
  if (slug === 'coming-soon') return 'upcoming';
  if (LEGACY_CATEGORY_SLUGS.includes(slug)) return slug;
  return null;
};

const buildSeriesQueryForCategory = (category) => {
  const orConditions = [{ browseCategories: category._id }];
  const legacyTag = slugToLegacyTag(category.slug);
  if (legacyTag) {
    orConditions.push({ categories: legacyTag });
  }
  return { isPublished: true, $or: orConditions };
};

const getSeriesForCategory = async (category, sortBy = 'views', limit = 20) => {
  const sort = sortMap[sortBy] || sortMap.views;
  return Series.find(buildSeriesQueryForCategory(category))
    .sort(sort)
    .limit(limit)
    .lean();
};

// @route   GET /api/categories
router.get('/', cacheMiddleware(60), async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .select('name slug description displayOrder showOnHome')
      .lean();

    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/categories/home
router.get('/home', cacheMiddleware(60), async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true, showOnHome: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    const rows = await Promise.all(
      categories.map(async (cat) => ({
        category: cat,
        series: await getSeriesForCategory(cat, cat.sortBy, 20)
      }))
    );

    let filtered = rows.filter((row) => row.series.length > 0);

    // Row with every published series — so new uploads always appear on the homepage
    const recentlyAdded = await Series.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(24)
      .lean();

    if (recentlyAdded.length > 0) {
      filtered.unshift({
        category: {
          _id: 'recently-added',
          name: 'Recently Added',
          slug: 'recently-added',
          sortBy: 'createdAt'
        },
        series: recentlyAdded
      });
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/top-picks', cacheMiddleware(60), async (req, res) => {
  try {
    const series = await Series.find({ categories: 'top-picks', isPublished: true })
      .sort({ views: -1 }).limit(10).lean();
    res.json({ success: true, count: series.length, data: series });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/recommended', cacheMiddleware(60), async (req, res) => {
  try {
    const series = await Series.find({ categories: 'recommended', isPublished: true })
      .sort({ rating: -1 }).limit(10).lean();
    res.json({ success: true, count: series.length, data: series });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/new-releases', cacheMiddleware(60), async (req, res) => {
  try {
    const series = await Series.find({ categories: 'new-releases', isPublished: true })
      .sort({ createdAt: -1 }).limit(10).lean();
    res.json({ success: true, count: series.length, data: series });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/upcoming', cacheMiddleware(60), async (req, res) => {
  try {
    const series = await Series.find({
      categories: 'upcoming',
      isPublished: true,
      status: 'upcoming'
    }).sort({ releaseYear: -1 }).lean();
    res.json({ success: true, count: series.length, data: series });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:slug/series', cacheMiddleware(60), async (req, res) => {
  try {
    if (req.params.slug === 'recently-added') {
      const series = await Series.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .limit(40)
        .lean();
      return res.json({
        success: true,
        category: { name: 'Recently Added', slug: 'recently-added' },
        count: series.length,
        data: series
      });
    }

    const category = await Category.findOne({
      slug: req.params.slug,
      isActive: true
    }).lean();

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const series = await getSeriesForCategory(category, category.sortBy, 40);

    res.json({
      success: true,
      category,
      count: series.length,
      data: series
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
