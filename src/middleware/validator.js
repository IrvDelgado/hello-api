const Joi = require('joi');
const normalizeDegreeLevel = require('../utils/normalizeDegreeLevel');
const naftaProfessions = require('../models/naftaProfessions');
const { isNAFTAProfession } = require('../models/scoringCriteria');

// Valid country codes (ISO 3166-1 alpha-2) - focused on Latin America and common countries
const validCountryCodes = [
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GT', 'HN', 'MX', 
  'NI', 'PA', 'PY', 'PE', 'UY', 'VE', 'US', 'CA', 'ES', 'FR', 'DE', 'IT', 'GB',
  'CN', 'IN', 'JP', 'KR', 'AU', 'NZ', 'ZA', 'EG', 'NG', 'KE', 'GH', 'MA', 'TN',
  'PK', 'BD', 'LK', 'PH', 'TH', 'VN', 'MY', 'SG', 'ID', 'TR', 'RU', 'UA', 'PL'
];

// Custom Joi validation for nationality codes
const nationalityValidator = Joi.string().length(2).uppercase().custom((value, helpers) => {
  if (!validCountryCodes.includes(value)) {
    return helpers.error('nationality.invalid', { value });
  }
  return value;
}, 'nationality validation').messages({
  'nationality.invalid': '"{#value}" is not a valid country code. Use ISO 3166-1 alpha-2 format (e.g., MX for Mexico, BR for Brazil).'
});

// Custom Joi validation for profession names (now allows any profession)
const professionValidator = Joi.string().custom((value, helpers) => {
  if (!value) return value; // Allow empty/null values for optional fields
  
  const normalizedValue = value.toLowerCase().trim();
  
  // Basic validation - just ensure it's not empty and has reasonable length
  if (normalizedValue.length < 2) {
    return helpers.error('profession.tooShort');
  }
  
  if (normalizedValue.length > 100) {
    return helpers.error('profession.tooLong');
  }
  
  // Check for basic profanity or clearly invalid entries
  const invalidTerms = ['test', 'asdf', '123', 'xxx', 'aaa', 'bbb'];
  if (invalidTerms.some(term => normalizedValue.includes(term))) {
    return helpers.error('profession.invalid');
  }
  
  return normalizedValue;
}, 'Profession validation').messages({
  'profession.tooShort': 'La profesión debe tener al menos 2 caracteres',
  'profession.tooLong': 'La profesión no puede tener más de 100 caracteres',
  'profession.invalid': 'Por favor ingresa una profesión válida'
});

// 📌 NEW expanded schema here
const visaEligibilitySchema = Joi.object({
  personalInfo: Joi.object({
    nationality: nationalityValidator.required(),
    age: Joi.number().min(18).max(99).required(),
    degreeLevel: Joi.string().valid(
      'none',
      'elementary',
      'middle_school',
      'high_school',
      'associate',
      'bachelor',
      'master',
      'doctorate'
    ).required(),
    englishProficiency: Joi.number().min(0).max(100).allow(null).optional(),
    financialProof: Joi.number().min(0).max(100).allow(null).optional(),
    academicRecord: Joi.number().min(0).max(100).allow(null).optional(),
    tiesHomeCountry: Joi.number().min(0).max(100).allow(null).optional(),
    priorUSExperience: Joi.boolean().allow(null).optional(),
    financialSupport: Joi.number().min(0).allow(null).optional(),
    visitDuration: Joi.number().min(0).max(365).allow(null).optional(),
    returnTicket: Joi.boolean().allow(null).optional(),
    previousVisaRecord: Joi.boolean().allow(null).optional()
  }).required(),

  employment: Joi.object({
    jobTitle: professionValidator.allow(null).optional(),
    jobType: Joi.string().valid('agricultural', 'nonagricultural', 'specialty').allow(null).optional(),
    hasJobOffer: Joi.boolean().allow(null).optional(),
    occupationType: Joi.string().allow(null).optional(),
    salary: Joi.number().min(0).allow(null).optional(),
    seasonal: Joi.boolean().allow(null).optional()
  }).optional(),

  familyTies: Joi.object({
    relationship: Joi.string().valid(
      'child_single_citizen', 'spouse_child_LPR', 'child_adult_LPR'
    ).optional(),
    marriedToUSCitizen: Joi.boolean().optional(),
    proofGenuineMarriage: Joi.boolean().optional(),
    proofOfRelationship: Joi.boolean().optional(),
    engagedToUSCitizen: Joi.boolean().optional(),
    metInPerson: Joi.boolean().optional(),
    intentToMarryIn90Days: Joi.boolean().optional(),
    jointResidencePlan: Joi.boolean().optional()
  }).optional(),

  preferences: Joi.object({
    hasI20: Joi.boolean().optional(),
    sponsorProgram: Joi.boolean().optional(),
    exchangeTypeEligible: Joi.boolean().optional(),
    purposeValid: Joi.boolean().optional(),
    treatyCountry: Joi.boolean().optional(),
    investmentUSD: Joi.number().optional(),
    ownershipPercent: Joi.number().min(0).max(100).optional(),
    businessViable: Joi.boolean().optional(),
    businessValid: Joi.boolean().optional(),
    sourceOfFundsValid: Joi.boolean().optional(),
    jobCreation: Joi.number().optional()
  }).optional()
});
function validateVisaRequest(req, res, next) {
  console.log('Request body received:', req.body);

  // Normalize degree level if present
  if (req.body?.personalInfo?.degreeLevel) {
    req.body.personalInfo.degreeLevel = normalizeDegreeLevel(req.body.personalInfo.degreeLevel); 
  }

  // Normalize nationality to uppercase
  if (req.body?.personalInfo?.nationality) {
    req.body.personalInfo.nationality = req.body.personalInfo.nationality.toUpperCase();
  }

  // Normalize job title if present
  if (req.body?.employment?.jobTitle) {
    req.body.employment.jobTitle = req.body.employment.jobTitle.toLowerCase().trim();
  }

  const { error, value } = visaEligibilitySchema.validate(req.body, { 
    abortEarly: false, // Return all validation errors, not just the first
    stripUnknown: true // Remove unknown fields
  });

  if (error) {
    console.log('Validation failed:', error.details);
    
    const formattedErrors = error.details.map(detail => {
      const field = detail.path.join('.');
      let message = detail.message;
      
      // Enhance error messages for better UX
      if (detail.type === 'profession.invalid') {
        message = `Invalid profession: ${detail.context.value}. ${detail.context.suggestions}`;
      } else if (detail.type === 'nationality.invalid') {
        message = `Invalid country code: ${detail.context.value}. Please use ISO 3166-1 alpha-2 format (e.g., MX, BR, AR).`;
      }
      
      return { 
        field, 
        message,
        value: detail.context?.value,
        type: detail.type 
      };
    });
    
    return res.status(400).json({
      success: false,
      message: req.t('validation.error'),
      errors: formattedErrors,
      help: {
        professions: '/api/v1/metadata/professions',
        countries: '/api/v1/metadata/countries',
        validation: '/api/v1/metadata/professions/validate/{profession}'
      }
    });
  }
  
  // Update request body with validated and normalized values
  req.body = value;
  next();
}

module.exports = { validateVisaRequest };
