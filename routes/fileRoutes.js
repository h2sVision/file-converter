// Routes for file handling (optional if more file handling logic is needed)

const express = require('express');
const { handleFileUpload, downloadFile } = require('../controllers/fileController');
const { uploadSingleFile, handleMulterError } = require('../middlewares/uploadMiddleware'); // Import the updated multer middleware and error handler
const validateFile = require('../middlewares/validateFile'); // Import your validation middleware
const router = express.Router();

// POST route for file upload
router.post('/upload', 
  uploadSingleFile, // Multer file handling middleware
  handleMulterError, // Error handling for file upload issues
  validateFile, // Your custom validation middleware
  handleFileUpload // File handling controller
);

// GET route for file download
router.get('/download/:fileName', downloadFile); // File download route

module.exports = router;

