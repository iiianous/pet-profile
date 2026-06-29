const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'production') {
    res.status(statusCode).render('error', {
      title: 'Something went wrong',
      message: statusCode === 500 ? 'Please try again later.' : err.message
    });
    return;
  }

  res.status(statusCode).render('error', {
    title: 'Something went wrong',
    message: err.message,
    stack: err.stack
  });
};

export default errorHandler;
