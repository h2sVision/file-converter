// Business logic for file conversion and processing

const fs = require('fs');
const { convertToFormat } = require('../utils/fileConversion');
const Job = require('../models/job');

const processFile = async (job) => {
  try {
    const convertedData = convertToFormat(job.data, job.outputFormat);
    const outputPath = `uploads/${job.id}.${job.outputFormat}`;
    fs.writeFileSync(outputPath, convertedData, 'utf8');

    job.status = 'completed';
    job.resultFilePath = outputPath;
    await job.save();
    return job;
  } catch (error) {
    job.status = 'failed';
    await job.save();
    throw error;
  }
};

module.exports = { processFile };
