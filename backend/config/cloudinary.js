const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.fieldname === 'chunk' ||
      file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit per chunk
  }
});

// Upload to Cloudinary
// For large files, uses upload_large which handles files > 100MB
const uploadToCloudinary = async (buffer, folder, resourceType = 'auto') => {
  const tmpFile = path.join(os.tmpdir(), `upload_${Date.now()}_${Math.random().toString(36).substr(2, 8)}.tmp`);

  try {
    // Write buffer to temp file
    fs.writeFileSync(tmpFile, buffer);
    
    let result;
    
    // For videos > 100MB, use upload_large
    if (resourceType === 'video' && buffer.length > 100 * 1024 * 1024) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(tmpFile, {
          folder,
          resource_type: 'video',
          chunk_size: 20 * 1024 * 1024, // 20MB chunks
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    } else {
      // For smaller files, use regular upload
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(tmpFile, {
          folder,
          resource_type: resourceType,
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    }
    
    return result;
  } finally {
    // Clean up temp file
    try { fs.unlinkSync(tmpFile); } catch (_) {}
  }
};

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw error;
  }
};

// Generate Signature for Direct Upload
const generateSignature = (folder) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET
  );
  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  };
};

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  generateSignature
};
