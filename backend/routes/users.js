const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/watchlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('watchlist');
    res.json({
      success: true,
      data: user.watchlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/users/watchlist/:seriesId
// @desc    Add series to watchlist
// @access  Private
router.post('/watchlist/:seriesId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.watchlist.includes(req.params.seriesId)) {
      return res.status(400).json({
        success: false,
        message: 'Series already in watchlist'
      });
    }

    user.watchlist.push(req.params.seriesId);
    await user.save();

    res.json({
      success: true,
      message: 'Added to watchlist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/users/watchlist/:seriesId
// @desc    Remove series from watchlist
// @access  Private
router.delete('/watchlist/:seriesId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.watchlist = user.watchlist.filter(
      id => id.toString() !== req.params.seriesId
    );
    await user.save();

    res.json({
      success: true,
      message: 'Removed from watchlist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/users/history
// @desc    Get watch history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('watchHistory.series')
      .populate('watchHistory.episode');
    
    res.json({
      success: true,
      data: user.watchHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/users/history
// @desc    Add to watch history
// @access  Private
router.post('/history', protect, async (req, res) => {
  try {
    const { seriesId, episodeId, progress } = req.body;
    const user = await User.findById(req.user.id);

    user.watchHistory.push({
      series: seriesId,
      episode: episodeId,
      progress: progress || 0
    });

    await user.save();

    res.json({
      success: true,
      message: 'Added to watch history'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
