require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { limiter } = require('./src/middleware/rateLimiter');
const i18n = require('./src/middleware/i18n');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(limiter);
app.use(i18n);
app.use('/api/v1', routes);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Visa calculator API listening on port ${port}`);
});

module.exports = app; // exporta el app para tests
