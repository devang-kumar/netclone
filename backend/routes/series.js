const express = require('express');
const router = express.Router();
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const { protect } = require('../middleware/auth');

// @route   GET /api/series
// @desc    Get all published series
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, genre, search } = req.query;
    let query = { isPublished: true };

    if (category) {
      query.categories = category;
    }

    if (genre) {
      query.genre = genre;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const series = await Series.find(query).sort({ createdAt: -1 });

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

// @route   GET /api/series/:id
// @desc    Get single series with episodes
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Get all episodes for this series
    const episodes = await Episode.find({ 
      series: req.params.id,
      isPublished: true 
    }).sort({ episodeNumber: 1 });

    // Increment views
    series.views += 1;
    await series.save();

    res.json({
      success: true,
      data: {
        series,
        episodes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/series/category/:category
// @desc    Get series by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const series = await Series.find({
      categories: req.params.category,
      isPublished: true
    }).sort({ createdAt: -1 });

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
