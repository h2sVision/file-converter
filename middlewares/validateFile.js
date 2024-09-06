// Validates file types and content based on input format

const validMimeTypes = [
  'application/json',
  'text/csv',
  'text/tab-separated-values',
  'application/xml'
];

const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  if (!validMimeTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: `Invalid file type: ${req.file.mimetype}` });
  }

  next();
};

module.exports = validateFile;
