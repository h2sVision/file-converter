// Centralized error handling middleware

// const errorHandler = (err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ message: 'Something went wrong!' });
//   };
  
//   module.exports = errorHandler;

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong!' });
};

module.exports = errorHandler;

  