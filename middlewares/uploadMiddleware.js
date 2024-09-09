// Multer setup for file uploads

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

//const upload = multer({ storage });

// Add file size limits and error handling
const upload = multer({
  storage,
  limits: {
    // Set file size limit (e.g., 500MB, adjust as needed)
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    // Define supported file types
    const supportedTypes = ['text/csv', 'text/tab-separated-values', 'application/xml', 'application/json'];

    if (supportedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Unsupported file format')); // Reject file
    }
  }
}); // Assuming the field name for file uploads is 'file'

// Error handling middleware for Multer errors
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle specific Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum allowed size is 500MB.'
      });
    }
    return res.status(400).json({
      message: 'Multer error occurred: ' + err.message
    });
  } else if (err) {
    // Handle unsupported file format or other errors
    return res.status(400).json({
      message: err.message || 'An error occurred during file upload.'
    });
  }
  next(); // No errors, proceed to the next middleware
};

// Exporting upload single/multiple file configurations
// You can configure it for single or multiple files or specific fields

// Single file upload, ensure the field name in Postman matches 'file'
const uploadSingleFile = upload.single('file'); 

// Multiple files upload
const uploadMultipleFiles = upload.array('files', 10); // Accept up to 10 files with the field name 'files'

// Named fields for more complex uploads
const uploadFields = upload.fields([
  { name: 'file1', maxCount: 1 }, // Upload with field name 'file1'
  { name: 'file2', maxCount: 1 }  // Upload with field name 'file2'
]);

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadFields,
  handleMulterError
};

//module.exports = { upload, handleMulterError };

//module.exports = upload;
