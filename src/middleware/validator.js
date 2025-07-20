const Joi = require('joi');

// 📌 NEW expanded schema here
const visaEligibilitySchema = Joi.object({
  personalInfo: Joi.object({
    nationality: Joi.string().length(2).required(),
    age: Joi.number().min(18).max(99).required(),
    educationLevel: Joi.string().valid('high_school', 'associate', 'bachelor', 'master', 'doctorate').required(),
    englishProficiency: Joi.number().min(0).max(100).optional(),
    financialProof: Joi.number().min(0).max(100).optional(),
    academicRecord: Joi.number().min(0).max(100).optional(),
    tiesHomeCountry: Joi.number().min(0).max(100).optional(),
    priorUSExperience: Joi.boolean().optional(),
    financialSupport: Joi.number().min(0).optional(),
    visitDuration: Joi.number().min(0).max(365).optional(),
    returnTicket: Joi.boolean().optional(),
    previousVisaRecord: Joi.boolean().optional(),
    age: Joi.number().min(0).max(120).optional()
  }),

  employment: Joi.object({
    jobTitle: Joi.string().optional(),
    jobType: Joi.string().valid('agricultural', 'nonagricultural', 'specialty').optional(),
    hasJobOffer: Joi.boolean().optional(),
    occupationType: Joi.string().optional(),
    salary: Joi.number().optional(),
    seasonal: Joi.boolean().optional()
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
  const { error } = visaEligibilitySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: req.t('validation.error'),
      errors: error.details.map(detail => ({ message: detail.message, field: detail.context.key }))
    });
  }
  next();
}

module.exports = { validateVisaRequest };
