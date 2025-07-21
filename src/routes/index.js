const express = require('express');
const visaRoutes = require('./visaRoutes');
const healthRoutes = require('./healthRoutes');
const metadataRoutes = require('./metadataRoutes');

const router = express.Router();
router.use('/visa', visaRoutes);
router.use('/health', healthRoutes);
router.use('/metadata', metadataRoutes);

module.exports = router;