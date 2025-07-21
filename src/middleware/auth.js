const crypto = require('crypto');

// Función para obtener API keys válidas (lazy loading para asegurar que .env esté cargado)
function getValidApiKeys() {
  return new Set([
    process.env.VISA_CHECKER_API_KEY || 'dev-visa-checker-key-2024',
    process.env.BACKUP_API_KEY || 'backup-key-emergency-2024'
  ]);
}

// Generar nueva API key (para uso administrativo)
function generateApiKey() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware de autenticación por API Key
function requireApiKey(req, res, next) {
  // Obtener API key del header o query parameter
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['authorization']?.replace('Bearer ', '') ||
                 req.query.api_key;

  // Verificar si la API key existe
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key is required',
      message: 'Please provide a valid API key in the X-API-Key header or Authorization header'
    });
  }

  // Verificar si la API key es válida
  const validApiKeys = getValidApiKeys();
  if (!validApiKeys.has(apiKey)) {
    console.log(`🚫 Invalid API key attempt: ${apiKey.substring(0, 8)}...`);
    return res.status(403).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  // API key válida - agregar info al request
  req.apiKey = apiKey;
  req.authenticated = true;
  
  console.log(`✅ Authenticated request from API key: ${apiKey.substring(0, 8)}...`);
  next();
}

// Middleware opcional de API key (para endpoints públicos limitados)
function optionalApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || 
                 req.headers['authorization']?.replace('Bearer ', '') ||
                 req.query.api_key;

  const validApiKeys = getValidApiKeys();
  if (apiKey && validApiKeys.has(apiKey)) {
    req.apiKey = apiKey;
    req.authenticated = true;
    console.log(`✅ Authenticated request (optional): ${apiKey.substring(0, 8)}...`);
  } else {
    req.authenticated = false;
    console.log('🔓 Unauthenticated request (allowed)');
  }

  next();
}

// Rate limiting diferente para usuarios autenticados vs no autenticados
function createAuthBasedLimiter(authLimit = 200, publicLimit = 20, windowMinutes = 15) {
  const rateLimit = require('express-rate-limit');

  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: (req) => {
      // Usuarios autenticados obtienen más requests
      return req.authenticated ? authLimit : publicLimit;
    },
    message: (req) => ({
      success: false,
      error: 'Rate limit exceeded',
      message: req.authenticated 
        ? 'Too many requests from authenticated user'
        : 'Too many requests from unauthenticated user. Consider using an API key for higher limits.',
      retryAfter: windowMinutes,
      hint: req.authenticated ? null : 'Contact support for API key access'
    }),
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Diferentes límites por API key vs IP
      return req.authenticated ? `auth:${req.apiKey}` : `ip:${req.ip}`;
    }
  });
}

// Middleware para logging de accesos
function logApiAccess(req, res, next) {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const apiKeyPrefix = req.apiKey ? req.apiKey.substring(0, 8) + '...' : 'None';

  console.log(`📊 API Access: ${timestamp} | IP: ${ip} | API Key: ${apiKeyPrefix} | UA: ${userAgent} | ${req.method} ${req.originalUrl}`);
  
  next();
}

module.exports = {
  requireApiKey,
  optionalApiKey,
  createAuthBasedLimiter,
  logApiAccess,
  generateApiKey,
  getValidApiKeys
};