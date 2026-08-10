const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status     = err.status     || 'error';

  res.status(statusCode).json({
    status,
    message: err.message || 'Something went wrong',

    // Stack trace only in Development — never in Production
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
};
module.exports = errorHandler;