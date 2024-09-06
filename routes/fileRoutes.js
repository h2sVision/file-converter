// Routes for file handling (optional if more file handling logic is needed)

// const express = require('express');
// const { handleFileUpload } = require('../controllers/fileController');
// const validateFile = require('../middlewares/validateFile');

// const router = express.Router();

// router.post('/upload', validateFile, handleFileUpload);

// module.exports = router;

// const express = require('express');
// const { handleFileUpload, downloadFile } = require('../controllers/fileController');
// const validateFile = require('../middlewares/validateFile');
// const router = express.Router();

// router.post('/upload', validateFile, handleFileUpload);
// router.get('/download/:fileName', downloadFile);

// module.exports = router;

const express = require('express');
const { handleFileUpload, downloadFile } = require('../controllers/fileController');
const validateFile = require('../middlewares/validateFile');
const upload = require('../middlewares/uploadMiddleware'); // Import the multer middleware
const router = express.Router();

router.post('/upload', upload.single('file'), validateFile, handleFileUpload); // Apply multer middleware here
router.get('/download/:fileName', downloadFile);

module.exports = router;

