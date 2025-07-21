// Lista de errores seguros para mostrar en producción
const SAFE_ERROR_MESSAGES = {
  400: 'Bad Request - Invalid input data',
  401: 'Unauthorized - Authentication required',
  403: 'Forbidden - Insufficient permissions',
  404: 'Not Found - Resource does not exist',
  429: 'Too Many Requests - Rate limit exceeded',
  500: 'Internal Server Error - Please try again later'
};

// Función para sanitizar mensajes de error
function sanitizeErrorMessage(err, isProduction) {
  const statusCode = err.statusCode || err.status || 500;
  
  if (!isProduction) {
    return {
      message: err.message || 'Unknown error occurred',
      stack: err.stack,
      details: err.details || null
    };
  }
  
  // En producción, solo mostrar mensajes seguros
  return {
    message: SAFE_ERROR_MESSAGES[statusCode] || SAFE_ERROR_MESSAGES[500],
    stack: undefined,
    details: undefined
  };
}

// Función para log seguro de errores
function logError(err, req) {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const apiKeyPrefix = req.apiKey ? req.apiKey.substring(0, 8) + '...' : 'None';
  
  console.error(`🚨 ERROR [${timestamp}]`);
  console.error(`IP: ${ip} | API Key: ${apiKeyPrefix} | UA: ${userAgent}`);
  console.error(`${req.method} ${req.originalUrl}`);
  console.error(`Status: ${err.statusCode || err.status || 500}`);
  console.error(`Message: ${err.message}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.error(`Stack: ${err.stack}`);
  }
  console.error('---');
}

module.exports = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.statusCode || err.status || 500;
  
  // Log del error (siempre completo en servidor)
  logError(err, req);
  
  // Respuesta sanitizada
  const sanitizedError = sanitizeErrorMessage(err, isProduction);
  
  res.status(statusCode).json({
    success: false,
    ...sanitizedError,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
};