const helmet = require('helmet');
const cors = require('cors');

// Lista de dominios permitidos - CONFIGURA ESTOS CON TUS DOMINIOS REALES
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',  
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'https://www.pronostika.top/',
  'https://visapathway.pages.dev/'
  // AÑADE TUS DOMINIOS DE PRODUCCIÓN AQUÍ:
  // 'https://tudominio.com',
  // 'https://www.tudominio.com',
  // 'https://app.tudominio.com'
];

// Configuración CORS segura
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Verificar si el origin está en la lista permitida
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS policy'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key'
  ]
};

// Configuración Helmet segura
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Permite embeds para desarrollo
};

// Middleware adicional de seguridad
const additionalSecurity = (req, res, next) => {
  // Headers de seguridad adicionales
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Response-Time', Date.now());
  
  // Solo en producción - ocultar información del servidor
  if (process.env.NODE_ENV === 'production') {
    res.removeHeader('X-Powered-By');
    res.setHeader('Server', 'API');
  }
  
  next();
};

// Rate limiting más específico por endpoint
const createEndpointLimiter = (maxRequests = 50, windowMinutes = 15) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: windowMinutes
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Permitir bypass en desarrollo
    skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '127.0.0.1'
  });
};

module.exports = {
  helmet: helmet(helmetOptions),
  cors: cors(corsOptions),
  additionalSecurity,
  createEndpointLimiter,
  allowedOrigins
};