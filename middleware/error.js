const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
  // console.log(err.stack.red);

  let error = { ...err };
  error.message = err.message;

  //   console.log(err.name);

  //   Mongoose Bad Object
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose  Duplicate Field
  if (err.code === 11000) {
    const message = 'Duplicate Field Value Entered';
    error = new ErrorResponse(message, 400);
  }

  //Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.keys(err.errors).map((mes) => `Please add ${mes}`);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
