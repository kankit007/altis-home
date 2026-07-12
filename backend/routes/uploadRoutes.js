const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// POST /api/uploads — upload one or more images (multipart form)
router.post('/', uploadController.uploadImages);

// DELETE /api/uploads/:filename — remove a single uploaded image
router.delete('/:filename', uploadController.deleteImage);

module.exports = router;
