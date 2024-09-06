// Routes for job-related endpoints (upload, status, download)

const express = require('express');
const { submitJob, getJobStatus } = require('../controllers/jobController');

const router = express.Router();

router.post('/submit', submitJob);
router.get('/status/:jobId', getJobStatus);

module.exports = router;
