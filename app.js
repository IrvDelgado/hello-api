require('dotenv').config();
const express = require('express');
const { 
  helmet, 
  cors, 
  additionalSecurity, 
  createEndpointLimiter 
} = require('./src/middleware/security');
const { 
  optionalApiKey, 
  createAuthBasedLimiter, 
  logApiAccess 
} = require('./src/middleware/auth');
const i18n = require('./src/middleware/i18n');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Configuración de proxy para producción
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// Middleware de seguridad (ORDEN IMPORTANTE)
app.use(helmet);                     // 1. Headers de seguridad
app.use(cors);                       // 2. CORS restringido
app.use(additionalSecurity);         // 3. Seguridad adicional

// Parsing y validación
app.use(express.json({ limit: '1mb' })); // Limitar tamaño de requests
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Autenticación y logging
app.use(optionalApiKey);             // 4. Verificar API key opcional
app.use(logApiAccess);               // 5. Logging de accesos

// Rate limiting diferenciado por autenticación
const authBasedLimiter = createAuthBasedLimiter(
  process.env.NODE_ENV === 'production' ? 200 : 500, // Auth users: 200/500 reqs
  process.env.NODE_ENV === 'production' ? 20 : 50,   // Public users: 20/50 reqs  
  15 // 15 minutos
);
app.use('/api', authBasedLimiter);

// Internacionalización
app.use(i18n);

// Rutas de la API
app.use('/api/v1', routes);

// Error handler (debe ser último)
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Visa calculator API listening on port ${port}`);
});

module.exports = app; 
