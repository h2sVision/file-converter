// Utility to standardize API responses

const successResponse = (res, data, message = 'Success') => {
    res.status(200).json({ message, data });
  };
  
  const errorResponse = (res, error, message = 'Error') => {
    res.status(500).json({ message, error: error.message });
  };
  
  module.exports = { successResponse, errorResponse };
  