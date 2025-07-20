const visaTypes = require('../models/visaTypes');
const { calculateReadinessScore, getScoreCategory, getNextSteps } = require('../models/scoringCriteria');

const scoringService = {
  async calculateVisaEligibility(userData) {
    const visas = [];
    for (const vt of visaTypes) {
      const scoreObj = calculateReadinessScore(userData, vt.criteria);
      visas.push({
        type: vt.code,
        name: vt.name,
        score: scoreObj.percentage,
        category: getScoreCategory(scoreObj.percentage),
        requirements: scoreObj.details,
        nextSteps: getNextSteps(vt, scoreObj)
      });
    }
    visas.sort((a, b) => b.score - a.score);
    return {
      overallScore: visas[0]?.score || 0,
      eligibleVisas: visas.filter(v => v.score >= 50),
      allVisas: visas
    };
  }
};
module.exports = scoringService;