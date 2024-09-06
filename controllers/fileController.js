// Handles file uploads, file parsing, and validation

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fileQueue } = require('../config/queue');
const { convertToFormat } = require('../utils/fileConversion');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { parseCSV, parseTSV, parseXML, parseJSON } = require('../utils/fileParser'); // Updated to include parseJSON
const upload = require('../middlewares/uploadMiddleware');
const xml2js = require('xml2js'); // For parsing XML with streams


const handleFileUpload = async (req, res) => {
  try {
    // Log the file to verify it's being uploaded
    console.log('Uploaded File:', req.file);

    const file = req.file;
    if (!file) {
      return errorResponse(res, new Error('No file uploaded'), 'No file uploaded');
    }

    let data;

    // Parse the file based on MIME type
    switch (file.mimetype) {
      case 'text/csv':
        data = await parseCSV(file.path);
        break;
      case 'text/tab-separated-values':
        data = await parseTSV(file.path);
        break;
      case 'application/xml':
        data = await parseXML(file.path);
        break;
      case 'application/json':
        data = await parseJSON(file.path);  // Updated to use parseJSON for JSON files
        break;
      default:
        return errorResponse(res, new Error('Unsupported file format'), 'Unsupported file format');
    }

    // Convert data to the requested format
    const outputFormat = req.body.outputFormat || 'json';
    const convertedData = convertToFormat(data, outputFormat);

    // Save converted file to the uploads directory
    const outputFilePath = path.join('uploads', `${Date.now()}.${outputFormat}`);
    await fs.promises.writeFile(outputFilePath, convertedData);

    // Add job to the queue
    const job = await fileQueue.add('fileConversion', {
      fileType: file.mimetype,
      outputFormat,
      outputFilePath,
      data //pass data directly to the queue job new line
    });

    successResponse(res, { jobId: job.id, outputFilePath }, 'File uploaded, converted, and job created');
  } catch (error) {
    logger.error('Failed to handle file upload:', error);
    errorResponse(res, error, 'Failed to handle file upload');
  }
};



// Download file
const downloadFile = (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(__dirname, '../uploads', fileName);

  if (fs.existsSync(filePath)) {
    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error('Failed to download file:', err);
        return errorResponse(res, err, 'Failed to download file');
      }
    });
  } else {
    return errorResponse(res, new Error('File not found'), 'File not found');
  }
};

module.exports = { handleFileUpload, downloadFile };


