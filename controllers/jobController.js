// Handles job submission, status checking, file download APIs

const { fileQueue } = require('../config/queue');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const submitJob = async (req, res) => {
  try {
    const job = await fileQueue.add('fileConversion', req.body);
    successResponse(res, { jobId: job.id }, 'Job submitted successfully');
  } catch (error) {
    errorResponse(res, error, 'Failed to submit job');
  }
};

const getJobStatus = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await fileQueue.getJob(jobId);
    if (job) {
      successResponse(res, job, 'Job status retrieved');
    } else {
      errorResponse(res, new Error('Job not found'), 'Job not found');
    }
  } catch (error) {
    errorResponse(res, error, 'Failed to retrieve job status');
  }
};

module.exports = { submitJob, getJobStatus };
