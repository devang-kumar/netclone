const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../config/cloudinary');
const logger = require('../config/logger');

// Apply auth middleware
router.use(protect);
router.use(adminOnly);

// In-memory store for chunks (keyed by fileId)
const uploadChunks = new Map();

// ─── Direct upload (small files < 10MB) ────────────────────────────────────
router.post('/upload-cloudinary', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const folder = req.body.folder || 'ott-platform';
    const resourceType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    const result = await uploadToCloudinary(req.file.buffer, folder, resourceType);

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration || 0,
        format: result.format,
        resourceType: result.resource_type
      }
    });
  } catch (error) {
    logger.error('Direct upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
});

// ─── Receive a single chunk ─────────────────────────────────────────────────
// Just stores the chunk in memory and returns immediately (fast)
router.post('/upload-chunk', upload.single('chunk'), async (req, res) => {
  try {
    const { chunkIndex, totalChunks, fileId, fileName, fileType, folder } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No chunk data received' });
    }
    if (chunkIndex === undefined || !totalChunks || !fileId || !fileName || !fileType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const chunkNum = parseInt(chunkIndex);
    const totalNum = parseInt(totalChunks);

    logger.info(`Chunk ${chunkNum + 1}/${totalNum} received for ${fileName} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    // Init session on first chunk
    if (!uploadChunks.has(fileId)) {
      uploadChunks.set(fileId, {
        chunks: new Array(totalNum).fill(null),
        totalChunks: totalNum,
        fileName,
        fileType,
        folder: folder || 'ott-platform/videos',
        receivedCount: 0
      });
    }

    const session = uploadChunks.get(fileId);

    // Store only if not already stored (idempotent)
    if (!session.chunks[chunkNum]) {
      session.chunks[chunkNum] = req.file.buffer;
      session.receivedCount++;
    }

    // Respond immediately — do NOT trigger Cloudinary here
    res.json({
      success: true,
      received: session.receivedCount,
      total: session.totalChunks,
      progress: Math.round((session.receivedCount / session.totalChunks) * 100)
    });

  } catch (error) {
    logger.error('Chunk receive error:', error);
    res.status(500).json({ success: false, message: error.message || 'Chunk upload failed' });
  }
});

// ─── Finalize: assemble chunks and upload to Cloudinary ────────────────────
// Called by frontend AFTER all chunks are sent. Can take several minutes.
router.post('/upload-finalize', async (req, res) => {
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({ success: false, message: 'fileId is required' });
  }

  const session = uploadChunks.get(fileId);

  if (!session) {
    return res.status(404).json({ success: false, message: 'Upload session not found. Please re-upload.' });
  }

  // Check all chunks are present
  const missing = [];
  for (let i = 0; i < session.totalChunks; i++) {
    if (!session.chunks[i]) missing.push(i + 1);
  }
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing chunks: ${missing.join(', ')}. Please retry.`
    });
  }

  try {
    logger.info(`Assembling ${session.totalChunks} chunks for ${session.fileName}...`);
    const completeFile = Buffer.concat(session.chunks);
    logger.info(`Assembled: ${(completeFile.length / 1024 / 1024).toFixed(2)} MB`);

    const resourceType = session.fileType.startsWith('video/') ? 'video' : 'image';
    logger.info(`Uploading to Cloudinary as ${resourceType}...`);

    const result = await uploadToCloudinary(completeFile, session.folder, resourceType);

    // Clean up memory
    uploadChunks.delete(fileId);

    logger.info(`Cloudinary upload complete: ${result.secure_url}`);

    res.json({
      success: true,
      complete: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        duration: result.duration || 0,
        format: result.format,
        resourceType: result.resource_type
      }
    });
  } catch (error) {
    logger.error('Finalize/Cloudinary error:', error);
    uploadChunks.delete(fileId);
    res.status(500).json({ success: false, message: `Cloudinary upload failed: ${error.message}` });
  }
});

module.exports = router;
