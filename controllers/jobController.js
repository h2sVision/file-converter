// Handles job submission, status checking, file download APIs

const { fileQueue } = require('../config/queue');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const Job = require('../models/job'); // Import the Job model

const submitJob = async (req, res) => {
  try {
    const { fileType, outputFormat, fileData } = req.body;

    // Create a MongoDB job entry
    const mongoJob = new Job({
      fileType,
      outputFormat,
      status: 'pending', // Initial status
    });
    await mongoJob.save();

    // Add the job to the queue and include the MongoDB Job ID
    const job = await fileQueue.add('fileConversion', {
      mongoJobId: mongoJob._id,  // Save the MongoDB Job ID in the job data
      fileType,
      outputFormat,
      fileData,
    });

    successResponse(res, { jobId: job.id, mongoJobId: mongoJob._id }, 'Job submitted successfully');
  } catch (error) {
    errorResponse(res, error, 'Failed to submit job');
  }
};

const getJobStatus = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await fileQueue.getJob(jobId);

    if (job) {
      // Determine the job status
      const status = await job.getState();
      let jobResult = null;

      // Retrieve the result if the job is completed
      if (status === 'completed') {
        jobResult = job.returnvalue;  // job.returnvalue contains the result
      }

      successResponse(res, { jobId: job.id, status, result: jobResult }, 'Job status retrieved');
    } else {
      errorResponse(res, new Error('Job not found'), 'Job not found');
    }
  } catch (error) {
    errorResponse(res, error, 'Failed to retrieve job status');
  }
};


module.exports = { submitJob, getJobStatus };
