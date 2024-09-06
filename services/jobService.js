// Handles queue management, job processing, scheduling logic

const { fileQueue } = require('../config/queue');
const { processFile } = require('./fileService');

const jobProcessor = async (job) => {
  const jobRecord = await Job.findById(job.id);
  if (jobRecord) {
    jobRecord.status = 'processing';
    await jobRecord.save();
    
    try {
      await processFile(jobRecord);
      return 'Job processed successfully';
    } catch (error) {
      throw new Error('Error processing job');
    }
  } else {
    throw new Error('Job not found');
  }
};

module.exports = { jobProcessor };
