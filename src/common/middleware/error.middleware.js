import logger from '../../config/logger.js';
import ApiError from '../helpers/api-error.js';

export const errorHandler = (err, req, res, next) => {
  let { statusCode, message, errors } = err;

  // Log error
  logger.error(err);

  // If not standard ApiError, transform
  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
    errors = [];

    // Handle Prisma Specific Errors
    if (err.code === 'P2002') {
      statusCode = 409;
      const fields = err.meta?.target || [];
      message = `Duplicate field value entered: ${fields.join(', ')}`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = err.meta?.cause || 'Record not found';
    } else if (err.name === 'ValidationError') {
      statusCode = 400;
      message = err.message;
    }
  }

  const response = {
    success: false,
    message,
    ...(errors && errors.length > 0 && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};
