const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Configure multer memory storage (hold files in memory buffers)
const storage = multer.memoryStorage();

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
    fileSize: 7 * 1024 * 1024 // Max 7 MB (global limit)
  }
});

// Helper: Stream buffer to GridFSBucket
const uploadToGridFS = (buffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'media'
    });
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype
    });
    const fileId = uploadStream.id;
    uploadStream.on('error', (err) => reject(err));
    uploadStream.on('finish', () => resolve({ _id: fileId }));
    uploadStream.end(buffer);
  });
};

// Upload multiple images/videos (up to 10) to GridFS
exports.uploadImages = [
  upload.array('images', 10),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      // Check conditional file size limits: Image (2 MB) vs Video (7 MB)
      const invalidFiles = req.files.filter(file => {
        const isVideo = file.mimetype.startsWith('video/');
        const limit = isVideo ? 7 * 1024 * 1024 : 2 * 1024 * 1024;
        return file.size > limit;
      });

      if (invalidFiles.length > 0) {
        return res.status(400).json({ 
          error: 'File size limit exceeded. Images must be under 2 MB, and videos must be under 7 MB.' 
        });
      }

      const uploadPromises = req.files.map(file => {
        const ext = path.extname(file.originalname).toLowerCase();
        const name = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        return uploadToGridFS(file.buffer, name, file.mimetype);
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const urls = uploadedFiles.map(file => `${baseUrl}/api/uploads/file/${file._id}`);

      res.status(201).json({
        message: `${req.files.length} file(s) uploaded successfully to MongoDB`,
        urls
      });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Failed to upload files to database' });
    }
  }
];

// Retrieve a single media asset from GridFS Bucket
exports.getFile = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'media'
    });

    let id;
    try {
      id = new mongoose.Types.ObjectId(req.params.id);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid file ID format' });
    }

    const files = await bucket.find({ _id: id }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Length', file.length);

    const downloadStream = bucket.openDownloadStream(id);
    downloadStream.pipe(res);
  } catch (err) {
    console.error('Error fetching file from GridFS:', err);
    res.status(500).json({ error: 'Error retrieving file from database' });
  }
};

// Delete a single uploaded image/video by filename or ObjectId from GridFS
exports.deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'media'
    });

    let fileId;
    if (mongoose.Types.ObjectId.isValid(filename)) {
      fileId = new mongoose.Types.ObjectId(filename);
    } else {
      const files = await bucket.find({ filename }).toArray();
      if (!files || files.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }
      fileId = files[0]._id;
    }

    await bucket.delete(fileId);
    res.json({ message: 'File deleted successfully from database' });
  } catch (err) {
    console.error('Delete image error:', err);
    res.status(500).json({ error: 'Failed to delete file from database' });
  }
};
