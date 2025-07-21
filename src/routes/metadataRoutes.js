const express = require('express');
const { 
  getValidProfessions, 
  validateProfession, 
  getValidCountries 
} = require('../controllers/metadataController');

const router = express.Router();

// Get list of valid NAFTA professions
router.get('/professions', getValidProfessions);

// Validate a specific profession
router.get('/professions/validate/:profession', validateProfession);

// Get list of valid country codes
router.get('/countries', getValidCountries);

module.exports = router;