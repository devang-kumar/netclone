const express = require('express');
const router = express.Router();
const Series = require('../models/Series');
const Episode = require('../models/Episode');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');
const { upload, uploadToCloudinary, deleteFromCloudinary, generateSignature } = require('../config/cloudinary');
const logger = require('../config/logger');
const { flushCache } = require('../middleware/cache');

/** Assign homepage categories when admin did not pick any browse row */
async function resolveBrowseCategories(browseCategoriesJson, legacyCategoriesJson) {
  let ids = [];
  if (browseCategoriesJson) {
    try {
      ids = JSON.parse(browseCategoriesJson);
    } catch {
      ids = [];
    }
  }
  if (ids.length > 0) return ids;

  let legacy = [];
  if (legacyCategoriesJson) {
    try {
      legacy = JSON.parse(legacyCategoriesJson);
    } catch {
      legacy = [];
    }
  }

  const slugCandidates = new Set(['new-releases', 'top-picks']);
  legacy.forEach((tag) => {
    if (tag === 'upcoming') slugCandidates.add('coming-soon');
    else slugCandidates.add(tag);
  });

  const cats = await Category.find({
    slug: { $in: [...slugCandidates] },
    isActive: true
  });
  return cats.map((c) => c._id);
}

// @route   GET /api/admin/upload-signature
// @desc    Get signature for direct Cloudinary upload
// @access  Admin
router.get('/upload-signature', (req, res) => {
  try {
    const folder = req.query.folder || 'ott-platform/general';
    const signatureData = generateSignature(folder);
    res.json({
      success: true,
      ...signatureData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Apply auth middleware to all admin routes
router.use(protect);
router.use(adminOnly);

// @route   POST /api/admin/series
// @desc    Create new series
// @access  Admin
router.post('/series', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, genre, director, releaseYear, categories, browseCategories, status } = req.body;

    // Upload images to Cloudinary
    let thumbnailUrl = '';
    let bannerUrl = '';

    if (req.files.thumbnail) {
      const result = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        'ott-platform/series/thumbnails',
        'image'
      );
      thumbnailUrl = result.secure_url;
    }

    if (req.files.banner) {
      const result = await uploadToCloudinary(
        req.files.banner[0].buffer,
        'ott-platform/series/banners',
        'image'
      );
      bannerUrl = result.secure_url;
    }

    const legacyCategories = categories ? JSON.parse(categories) : [];

    const seriesPayload = {
      title,
      description,
      thumbnail: thumbnailUrl,
      banner: bannerUrl,
      genre: JSON.parse(genre),
      director,
      releaseYear,
      categories: legacyCategories,
      browseCategories: await resolveBrowseCategories(browseCategories, categories),
      status
    };

    const series = await Series.create(seriesPayload);
    flushCache();

    res.status(201).json({
      success: true,
      data: series
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/series/:id
// @desc    Update series
// @access  Admin
router.put('/series/:id', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  try {
    let series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    const updateData = { ...req.body };

    // Handle file uploads if present
    if (req.files?.thumbnail) {
      const result = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        'ott-platform/series/thumbnails',
        'image'
      );
      updateData.thumbnail = result.secure_url;
    }

    if (req.files?.banner) {
      const result = await uploadToCloudinary(
        req.files.banner[0].buffer,
        'ott-platform/series/banners',
        'image'
      );
      updateData.banner = result.secure_url;
    }

    // Parse JSON fields if they exist
    if (updateData.genre) updateData.genre = JSON.parse(updateData.genre);
    if (updateData.categories) updateData.categories = JSON.parse(updateData.categories);
    if (updateData.browseCategories !== undefined) {
      updateData.browseCategories = await resolveBrowseCategories(
        updateData.browseCategories,
        updateData.categories ? JSON.stringify(updateData.categories) : JSON.stringify(series.categories)
      );
    }

    series = await Series.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    flushCache();

    res.json({
      success: true,
      data: series
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/series/:id
// @desc    Delete series
// @access  Admin
router.delete('/series/:id', async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);

    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    // Delete all episodes for this series
    await Episode.deleteMany({ series: req.params.id });

    await series.deleteOne();
    flushCache();

    res.json({
      success: true,
      message: 'Series and all episodes deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/series
// @desc    Get all series (including unpublished)
// @access  Admin
router.get('/series', async (req, res) => {
  try {
    const series = await Series.find().sort({ createdAt: -1 });
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

// @route   POST /api/admin/episodes
// @desc    Create new episode
// @access  Admin
router.post('/episodes', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { seriesId, episodeNumber, title, description, videoUrl: bodyVideoUrl, thumbnail: bodyThumbnail, duration: bodyDuration } = req.body;

    // Handle thumbnail (from file upload or direct URL)
    let thumbnailUrl = '';
    if (req.files?.thumbnail) {
      const result = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        'ott-platform/episodes/thumbnails',
        'image'
      );
      thumbnailUrl = result.secure_url;
    } else if (bodyThumbnail) {
      thumbnailUrl = bodyThumbnail;
    }

    // Handle Video (Either from file upload or direct URL from frontend)
    let videoUrl = bodyVideoUrl || '';
    let videoPublicId = '';
    let videoDuration = bodyDuration || 0;

    if (req.files?.video && !videoUrl) {
      logger.info(`Starting server-side video upload to Cloudinary for episode: ${title}`);
      const result = await uploadToCloudinary(
        req.files.video[0].buffer,
        'ott-platform/episodes/videos',
        'video'
      );
      logger.info(`Video upload completed for episode: ${title}`);
      videoUrl = result.secure_url;
      videoPublicId = result.public_id;
      videoDuration = result.duration || 0;
    }

    if (!videoUrl) {
      return res.status(400).json({ success: false, message: 'Video is required' });
    }

    // Extract publicId from URL if not provided
    if (!videoPublicId && videoUrl) {
      const urlParts = videoUrl.split('/');
      const fileWithExt = urlParts[urlParts.length - 1];
      const fileName = fileWithExt.split('.')[0];
      videoPublicId = `${urlParts[urlParts.length - 2]}/${fileName}`;
    }

    const episode = await Episode.create({
      series: seriesId,
      episodeNumber,
      title,
      description,
      thumbnail: thumbnailUrl,
      video: {
        url: videoUrl,
        publicId: videoPublicId,
        duration: videoDuration
      },
      isPublished: true
    });

    // Update series total episodes count
    await Series.findByIdAndUpdate(seriesId, {
      $inc: { totalEpisodes: 1 }
    });

    flushCache();

    res.status(201).json({
      success: true,
      data: episode
    });
  } catch (error) {
    logger.error('Episode creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/episodes/:id
// @desc    Update episode
// @access  Admin
router.put('/episodes/:id', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    let episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    const updateData = { ...req.body };

    // Handle thumbnail (from file upload or direct URL)
    if (req.files?.thumbnail) {
      const result = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        'ott-platform/episodes/thumbnails',
        'image'
      );
      updateData.thumbnail = result.secure_url;
    } else if (req.body.thumbnail) {
      updateData.thumbnail = req.body.thumbnail;
    }

    // Handle video (from file upload or direct URL)
    if (req.files?.video) {
      // Delete old video from Cloudinary
      if (episode.video.publicId) {
        await deleteFromCloudinary(episode.video.publicId, 'video');
      }

      const result = await uploadToCloudinary(
        req.files.video[0].buffer,
        'ott-platform/episodes/videos',
        'video'
      );
      
      updateData.video = {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration || 0
      };
    } else if (req.body.videoUrl) {
      // Delete old video from Cloudinary if replacing
      if (episode.video.publicId) {
        await deleteFromCloudinary(episode.video.publicId, 'video');
      }

      // Extract publicId from URL
      let videoPublicId = '';
      const urlParts = req.body.videoUrl.split('/');
      const fileWithExt = urlParts[urlParts.length - 1];
      const fileName = fileWithExt.split('.')[0];
      videoPublicId = `${urlParts[urlParts.length - 2]}/${fileName}`;

      updateData.video = {
        url: req.body.videoUrl,
        publicId: videoPublicId,
        duration: req.body.duration || 0
      };
    }

    episode = await Episode.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    flushCache();

    res.json({
      success: true,
      data: episode
    });
  } catch (error) {
    logger.error('Episode update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/episodes/:id
// @desc    Delete episode
// @access  Admin
router.delete('/episodes/:id', async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);

    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    // Delete video from Cloudinary
    if (episode.video.publicId) {
      await deleteFromCloudinary(episode.video.publicId, 'video');
    }

    // Update series total episodes count
    await Series.findByIdAndUpdate(episode.series, {
      $inc: { totalEpisodes: -1 }
    });

    await episode.deleteOne();
    flushCache();

    res.json({
      success: true,
      message: 'Episode deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/episodes
// @desc    Get all episodes (including unpublished)
// @access  Admin
router.get('/episodes', async (req, res) => {
  try {
    const episodes = await Episode.find()
      .populate('series', 'title')
      .sort({ createdAt: -1 });
    
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

// @route   PATCH /api/admin/series/:id/publish
// @desc    Toggle series publish status
// @access  Admin
router.patch('/series/:id/publish', async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    
    if (!series) {
      return res.status(404).json({
        success: false,
        message: 'Series not found'
      });
    }

    series.isPublished = !series.isPublished;
    await series.save();
    flushCache();

    res.json({
      success: true,
      data: series
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PATCH /api/admin/episodes/:id/publish
// @desc    Toggle episode publish status
// @access  Admin
router.patch('/episodes/:id/publish', async (req, res) => {
  try {
    const episode = await Episode.findById(req.params.id);
    
    if (!episode) {
      return res.status(404).json({
        success: false,
        message: 'Episode not found'
      });
    }

    episode.isPublished = !episode.isPublished;
    await episode.save();
    flushCache();

    res.json({
      success: true,
      data: episode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ——— Browse categories (admin-defined) ———

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

// @route   GET /api/admin/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/categories
router.post('/categories', async (req, res) => {
  try {
    const { name, slug, description, displayOrder, isActive, showOnHome, sortBy } = req.body;
    const categorySlug = slug || slugify(name);

    const existing = await Category.findOne({ slug: categorySlug });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category slug already exists' });
    }

    const category = await Category.create({
      name,
      slug: categorySlug,
      description: description || '',
      displayOrder: displayOrder ?? 0,
      isActive: isActive !== false,
      showOnHome: showOnHome !== false,
      sortBy: sortBy || 'views'
    });

    flushCache();

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/categories/:id
router.put('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, slug, description, displayOrder, isActive, showOnHome, sortBy } = req.body;

    if (name) category.name = name;
    if (slug) category.slug = slug;
    else if (name) category.slug = slugify(name);
    if (description !== undefined) category.description = description;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;
    if (showOnHome !== undefined) category.showOnHome = showOnHome;
    if (sortBy) category.sortBy = sortBy;

    await category.save();
    flushCache();
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/categories/:id
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await Series.updateMany(
      { browseCategories: category._id },
      { $pull: { browseCategories: category._id } }
    );

    await category.deleteOne();
    flushCache();
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
