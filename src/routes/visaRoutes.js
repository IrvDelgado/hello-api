const express = require('express');
const { calculateEligibility } = require('../controllers/visaController');
const { validateVisaRequest } = require('../middleware/validator');

const router = express.Router();

router.post('/eligibility', validateVisaRequest, calculateEligibility);

module.exports = router;