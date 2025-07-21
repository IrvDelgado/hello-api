const express = require('express');
const { calculateEligibility } = require('../controllers/visaController');
const { validateVisaRequest } = require('../middleware/validator');
const { requireApiKey } = require('../middleware/auth');

const router = express.Router();

// Main visa calculation - requires API key authentication
router.post('/eligibility', requireApiKey, validateVisaRequest, calculateEligibility);

module.exports = router;