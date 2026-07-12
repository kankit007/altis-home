const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomhex.ext
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    cb(null, name);
  }
});

// File filter — images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Only JPEG, PNG, WebP, GIF, and MP4, WebM, OGG, MOV videos are accepted.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // Max 20 MB (to accommodate video size limit)
  }
});

// Upload multiple images/videos (up to 10)
exports.uploadImages = [
  upload.array('images', 10),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Check conditional file size limits: Image (5 MB) vs Video (20 MB)
      const invalidFiles = req.files.filter(file => {
        const isVideo = file.mimetype.startsWith('video/');
        const limit = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
        return file.size > limit;
      });

      if (invalidFiles.length > 0) {
        // Clean up / delete the uploaded files from disk immediately
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(400).json({ 
          error: 'File size limit exceeded. Images must be under 5 MB, and videos must be under 20 MB.' 
        });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const urls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);

      res.status(201).json({
        message: `${req.files.length} file(s) uploaded successfully`,
        urls
      });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to upload files' });
    }
  }
];

// Delete a single uploaded image by filename
exports.deleteImage = (req, res) => {
  try {
    const { filename } = req.params;

    // Sanitize — prevent path traversal
    const safeName = path.basename(filename);
    const filePath = path.join(__dirname, '..', 'uploads', safeName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Image deleted successfully', filename: safeName });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};
