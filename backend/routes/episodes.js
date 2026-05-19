const express = require('express');
const router = express.Router();
const Episode = require('../models/Episode');
const { protect } = require('../middleware/auth');

// @route   GET /api/episodes/:id
// @desc    Get single episode
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id).populate('series');

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    episode.views += 1;
    await episode.save();

    const seriesEpisodes = await Episode.find({
      series: episode.series._id,
      isPublished: true
    })
      .sort({ episodeNumber: 1 })
      .select('_id episodeNumber title thumbnail video.duration')
      .lean();

    const currentIndex = seriesEpisodes.findIndex(
      (ep) => ep._id.toString() === episode._id.toString()
    );

    const prevEpisode = currentIndex > 0 ? seriesEpisodes[currentIndex - 1] : null;
    const nextEpisode =
      currentIndex >= 0 && currentIndex < seriesEpisodes.length - 1
        ? seriesEpisodes[currentIndex + 1]
        : null;

    res.json({
      success: true,
      data: {
        episode,
        seriesEpisodes,
        prevEpisode,
        nextEpisode
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/episodes/series/:seriesId
// @desc    Get all episodes for a series
// @access  Public
router.get('/series/:seriesId', async (req, res) => {
  try {
    const episodes = await Episode.find({
      series: req.params.seriesId,
      isPublished: true
    }).sort({ episodeNumber: 1 });

    res.json({
      success: true,
      count: episodes.length,
      data: episodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
