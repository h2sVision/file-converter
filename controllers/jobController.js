// Handles job submission, status checking, file download APIs

const { fileQueue } = require('../config/queue');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const Job = require('../models/job'); // Import the Job model

console.log("Job controller function invoked");

const submitJob = async (req, res) => {
  console.log("Submit Job function triggered"); // To check if the function is being called

  try {
    const { fileType, outputFormat, fileData } = req.body;

     // Log incoming request details
     console.log('Submit Job Request:', { fileType, outputFormat, fileData });

     // Validate incoming data
    if (!fileType || !outputFormat || !fileData) {
      console.error('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }


    // Create a MongoDB job entry
    const mongoJob = new Job({
      fileType,
      outputFormat,
      status: 'pending', // Initial status
    });
    await mongoJob.save();
    console.log('Job saved to MongoDB:', mongoJob);

    // Add the job to the queue and include the MongoDB Job ID
    const job = await fileQueue.add('fileConversion', {
      mongoJobId: mongoJob._id,  // Save the MongoDB Job ID in the job data
      fileType,
      fileData,
      outputFormat,
    });

    // Update the MongoDB job entry with the queue job ID
    mongoJob.queueJobId = job.id;
    await mongoJob.save();


    console.log('Job added to queue:', job.id);

    successResponse(res, { jobId: job.id, mongoJobId: mongoJob._id }, 'Job submitted successfully');
  } catch (error) {
    errorResponse(res, error, 'Failed to submit job');


    if (err.name === 'ValidationError') {
      console.error('Validation Error:', err.errors);
    } else {
      console.error('Job saving error:', err);
    }
    throw err;  // Re-throw the error after logging it


  }
};

const getJobStatus = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    console.log(`Getting status for job ID: ${jobId}`);
    const job = await fileQueue.getJob(jobId);

    if (job) {
      // Determine the job status
      const status = await job.getState();
      console.log(`Job ${jobId} status: ${status}`);
      let jobResult = null;

      // Retrieve the result if the job is completed
      if (status === 'completed') {
        jobResult = job.returnvalue;  // job.returnvalue contains the result
      }

      successResponse(res, { jobId: job.id, status, result: jobResult }, 'Job status retrieved');
    } else {
      console.error('Job not found in the queue:', jobId);
      errorResponse(res, new Error('Job not found'), 'Job not found');
    }
  } catch (error) {
    console.error('Failed to retrieve job status:', error);
    errorResponse(res, error, 'Failed to retrieve job status');
  }
};


module.exports = { submitJob, getJobStatus };
