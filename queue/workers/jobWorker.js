// Worker that processes queued jobs

const { Worker } = require('bullmq');
const { jobProcessor } = require('../../services/jobService');
const logger = require('../../utils/logger');
const Job = require('../../models/job'); // Import the Job model

// Worker that processes queued jobs
const jobWorker = new Worker('fileQueue', async job => {
  try {
    // When a job is processed, first create a job entry in the DB
    const mongoJob = new Job({
      fileType: job.data.fileType,
      outputFormat: job.data.outputFormat,
      status: 'processing',  // Automatically set status to 'processing'
      queueJobId: job.id,  // Save the queue job ID
    });
    await mongoJob.save();  // Save the job entry to MongoDB

    console.log(`Job ${job.id} is now processing and saved to MongoDB`);

    // Process the job (file conversion)
    const result = await jobProcessor(job);

    return result;  // Return the result for the completed event
  } catch (error) {
    logger.error('Job processing error:', error);
    throw error;  // Propagate error for the failed event
  }
}, {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

jobWorker.on('completed', async (job) => {
  try {
    await Job.findOneAndUpdate(
      { queueJobId: job.id },  // Use queueJobId to find the job
      {
        status: 'completed',
        result: job.returnvalue,  // Path to the converted file
      },
      { new: true }  // Return the updated document
    );
    console.log(`Job ${job.id} completed and saved to MongoDB`);
  } catch (error) {
    console.error('Error saving completed job to MongoDB:', error.message);
  }
});

jobWorker.on('failed', async (job, err) => {
  try {
    await Job.findOneAndUpdate(
      { queueJobId: job.id },  // Use queueJobId to find the job
      {
        status: 'failed',
        result: '',  // Clear the result file path
      },
      { new: true }
    );
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  } catch (error) {
    console.error('Error saving failed job to MongoDB:', error.message);
  }
});


module.exports = jobWorker;
