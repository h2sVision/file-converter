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

const worker = new Worker('fileQueue', async (job) => {
  try {
    const { mongoJobId, data, outputFormat } = job.data;

    if (!data || !outputFormat) {
      throw new Error('Invalid job data');
    }

    // Update job status to 'processing'
    await Job.findByIdAndUpdate(mongoJobId, { status: 'processing' });

    // Convert file data
    const convertedData = convertToFormat(data, outputFormat);

    const outputFilePath = `./converted-files/${job.id}.${outputFormat}`;
    
    if (!fs.existsSync('./converted-files')) {
      fs.mkdirSync('./converted-files');
    }

    await fs.promises.writeFile(outputFilePath, convertedData);

    // Update job status to 'completed' and set the result file path
    await Job.findByIdAndUpdate(mongoJobId, {
      status: 'completed',
      resultFilePath: outputFilePath,
    });

    return outputFilePath;

  } catch (error) {
    const { mongoJobId } = job.data;

    // Update job status to 'failed'
    await Job.findByIdAndUpdate(mongoJobId, {
      status: 'failed',
    });

    throw error;
  }
}, {
  connection: redis,
  concurrency: 5,
  limiter: {
    max: 100,
    duration: 60000,
  }
});

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
