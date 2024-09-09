// Handles file uploads, file parsing, and validation

const path = require('path');
const fs = require('fs');
const { fileQueue } = require('../config/queue');
const { convertToFormat } = require('../utils/fileConversion');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');
const { parseCSV, parseTSV, parseXML, parseJSON } = require('../utils/fileParser'); // Updated to include parseJSON
const Job = require('../models/job'); // Ensure this path is correct

const handleFileUpload = async (req, res) => {
  try {
    console.log('Uploaded File:', req.file);
    const file = req.file;

    if (!file) {
      return errorResponse(res, new Error('No file uploaded'), 'No file uploaded');
    }

     // Supported input and output formats
     const supportedInputFormats = ['text/csv', 'text/tab-separated-values', 'application/xml', 'application/json'];
     const supportedOutputFormats = ['json', 'csv', 'tsv', 'xml'];
 
     // Check if the uploaded file format is supported
     if (!supportedInputFormats.includes(file.mimetype)) {
       return errorResponse(res, new Error('Unsupported file format'), 'Unsupported file format');
     }

    let data;

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
        data = await parseJSON(file.path);  
        break;
      default:
        return errorResponse(res, new Error('Unsupported file format'), 'Unsupported file format', 400);
    }

    const outputFormat = req.body.outputFormat || 'json';

    if (!supportedOutputFormats.includes(outputFormat)) {
      return errorResponse(res, new Error('Unsupported output format'), 'Unsupported output format', 400);
    }

    // Create a new job in MongoDB (with status as 'pending')
    const newJob = await Job.create({
      fileType: file.mimetype,
      outputFormat: outputFormat,
      status: 'pending',
    });

    // Add job to the queue and pass the MongoDB job ID
    const queueJob = await fileQueue.add('fileConversion', {
      mongoJobId: newJob._id.toString(),
      fileType: file.mimetype,
      outputFormat,
      data, 
    });

    // Update the queue job ID in MongoDB
    await Job.findByIdAndUpdate(newJob._id, { queueJobId: queueJob.id });

    // Remove the uploaded file after processing
    fs.unlink(file.path, (err) => {
      if (err) {
        logger.error('Failed to delete the original uploaded file:', err);
      } else {
        console.log(`Deleted original file: ${file.path}`);
      }
    });

    // Respond with job information
    successResponse(res, { jobId: newJob._id , queueJobId: queueJob.id }, 'File uploaded and job created');
  } catch (error) {
    logger.error('Failed to handle file upload:', error);
    errorResponse(res, error, 'Failed to handle file upload');
  }
};



// Download file
const downloadFile = (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(__dirname, '../converted-files', fileName);

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


