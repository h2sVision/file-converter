// MongoDB schema for jobs, storing metadata and statuses

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  fileType: { type: String, required: true },
  outputFormat: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  resultFilePath: { type: String },
  queueJobId: {type: String}
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
