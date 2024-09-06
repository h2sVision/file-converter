const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const dotenv = require('dotenv');
const fs = require('fs');
const { convertToFormat } = require('../utils/fileConversion'); // Ensure correct path
const Job = require('../models/job');  // Adjust the path as needed

// Load environment variables from .env file
dotenv.config();

// Create a Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null, // Important: BullMQ requires this to be set to null
});

// Create a queue for file processing
const fileQueue = new Queue('fileQueue', {
  connection: redis,
});

// Create a worker to process jobs from the queue
const worker = new Worker('fileQueue', async (job) => {
  try {
    console.log(`Processing job ${job.id}`);

    // Extract job data
    const {mongoJobId, fileType, data, outputFormat } = job.data;

    if (!data || !outputFormat) {
      throw new Error('Invalid job data');
    }

    // Convert the file data to the requested format
    const convertedData = convertToFormat(data, outputFormat);

    // Define the path for the converted file
    const outputFilePath = `./converted-files/${job.id}.${outputFormat}`;
    
    // Ensure the directory exists
    if (!fs.existsSync('./converted-files')) {
      fs.mkdirSync('./converted-files');
    }

    // Write the converted data to a file
    await fs.promises.writeFile(outputFilePath, convertedData);

    // Update job status in MongoDB
    await Job.findByIdAndUpdate(mongoJobId, {
      status: 'completed',
      result: outputFilePath,
    });

    console.log(`Job ${job.id} completed successfully`);

    // Return the path to the converted file as the result
    return outputFilePath;

  } catch (error) {
    console.error(`Failed to process job ${job.id}:`, error);
    await Job.findByIdAndUpdate(mongoJobId, {
      status: 'failed',
    });
    throw error; // Re-throw to let BullMQ handle retries or failures
  }
}, {
  connection: redis,
  concurrency: 5, // Number of jobs to process concurrently
  limiter: {
    max: 100, // Max number of jobs per interval
    duration: 60000, // Interval duration in milliseconds
  }
});

// Handle worker events
worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed with result: ${job.returnvalue}`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});

worker.on('error', (err) => {
  console.error('Worker encountered an error:', err.message);
});

// Export the queue and worker
module.exports = { fileQueue, worker };
