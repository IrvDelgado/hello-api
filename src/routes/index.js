const express = require('express');
const visaRoutes = require('./visaRoutes');
const healthRoutes = require('./healthRoutes');

const router = express.Router();
router.use('/visa', visaRoutes);
router.use('/health', healthRoutes);

module.exports = router;