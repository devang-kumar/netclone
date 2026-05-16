const express = require('express');
const router = express.Router();
const Series = require('../models/Series');
const { cacheMiddleware } = require('../middleware/cache');

// @route   GET /api/categories/top-picks
// @desc    Get top picks series
// @access  Public
router.get('/top-picks', cacheMiddleware(300), async (req, res) => {
  try {
    const series = await Series.find({
      categories: 'top-picks',
      isPublished: true
    }).sort({ views: -1 }).limit(10).lean();

    res.json({
      success: true,
      count: series.length,
      data: series
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/categories/recommended
// @desc    Get recommended series
// @access  Public
router.get('/recommended', cacheMiddleware(300), async (req, res) => {
  try {
    const series = await Series.find({
      categories: 'recommended',
      isPublished: true
    }).sort({ rating: -1 }).limit(10).lean();

    res.json({
      success: true,
      count: series.length,
      data: series
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/categories/new-releases
// @desc    Get new releases
// @access  Public
router.get('/new-releases', cacheMiddleware(300), async (req, res) => {
  try {
    const series = await Series.find({
      categories: 'new-releases',
      isPublished: true
    }).sort({ createdAt: -1 }).limit(10).lean();

    res.json({
      success: true,
      count: series.length,
      data: series
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/categories/upcoming
// @desc    Get upcoming series
// @access  Public
router.get('/upcoming', cacheMiddleware(300), async (req, res) => {
  try {
    const series = await Series.find({
      categories: 'upcoming',
      isPublished: true,
      status: 'upcoming'
    }).sort({ releaseYear: -1 }).lean();

    res.json({
      success: true,
      count: series.length,
      data: series
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
