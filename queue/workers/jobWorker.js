// Worker that processes queued jobs

const { Worker } = require('bullmq');
const { jobProcessor } = require('../../services/jobService');
const logger = require('../../utils/logger');

const jobWorker = new Worker('fileQueue', async job => {
  try {
    await jobProcessor(job);
  } catch (error) {
    logger.error('Job processing error:', error);
  }
}, {
  connection: {                                   //redis
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

module.exports = jobWorker;
