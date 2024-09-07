// Worker that processes queued jobs

const { Worker } = require('bullmq');
const { jobProcessor } = require('../../services/jobService');
const logger = require('../../utils/logger');
const Job = require('../../models/job'); // Import the Job model

const jobWorker = new Worker('fileQueue', async job => {
  try {
    const result = await jobProcessor(job);  // Capture the result from jobProcessor
    return result;  // Return the result so that it's available for `completed` event
  } catch (error) {
    logger.error('Job processing error:', error);
    throw error;  // Ensure error is propagated correctly
  }
}, {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// Handle worker events
// jobWorker.on('completed', async (job) => {
//   try {
//     await Job.findByIdAndUpdate(
//       job.data.mongoJobId,  // Assuming you store the MongoDB Job ID in job.data when adding a job
//       {
//         status: 'completed',
//         resultFilePath: job.returnvalue,  // Path to the converted file
//       },
//       { new: true }  // Return the updated document
//     );
//     console.log(`Job ${job.id} completed and saved to MongoDB`);
//   } catch (error) {
//     console.error('Error saving completed job to MongoDB:', error.message);
//   }
// });

// jobWorker.on('failed', async (job, err) => {
//   try {
//     await Job.findByIdAndUpdate(
//       job.data.mongoJobId,  // Same assumption as above
//       {
//         status: 'failed',
//         resultFilePath: '',  // Clear the result file path
//       },
//       { new: true }
//     );
//     console.error(`Job ${job.id} failed with error: ${err.message}`);
//   } catch (error) {
//     console.error('Error saving failed job to MongoDB:', error.message);
//   }
// });

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
