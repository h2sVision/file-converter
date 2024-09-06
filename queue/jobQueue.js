// Queue instance with job scheduling and processing

const { Queue } = require('bullmq');
const Redis = require('ioredis');
require('dotenv').config();

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

const fileQueue = new Queue('fileQueue', {
  redis
});

module.exports = { fileQueue };
