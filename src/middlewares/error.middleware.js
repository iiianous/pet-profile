import { NODE_ENV } from '../config/index.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (req.originalUrl.startsWith('/api') || req.accepts('json')) {
    return res.status(statusCode).json({
      status: 'error',
      message,
      errors: err.errors || []
    });
  }

  if (NODE_ENV === 'production') {
    res.status(statusCode).render('error', {
      title: 'Something went wrong',
      message: statusCode === 500 ? 'Please try again later.' : message
    });
    return;
  }

  res.status(statusCode).render('error', {
    title: 'Something went wrong',
    message,
    stack: err.stack
  });
};

export default errorHandler;
