const scoringService = require('../services/scoringService');
const responseFormatter = require('../utils/responseFormatter');

const calculateEligibility = async (req, res, next) => {
  try {
    const { personalInfo, employment, familyTies, preferences } = req.body;
    const results = await scoringService.calculateVisaEligibility({
      personalInfo, employment, familyTies, preferences
    });
    res.status(200).json(responseFormatter.success(req.t('calculation.success'), results));
  } catch (error) {
    next(error);
  }
};
module.exports = { calculateEligibility };
