module.exports = (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || req.t('errors.internal_server_error'),
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};