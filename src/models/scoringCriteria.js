const naftaProfessions = [
  'accountant', 'engineer', 'scientist', 'nurse', /* ...real list here... */ ];

// Example function, expand as needed for all visa logics
function calculateReadinessScore(userData, criteria) {
  let score = 0, max = 0, details = [];
  for (const c of criteria) {
    let achieved = 0;
    // Required rule check
    if (c.required && userData.personalInfo?.nationality !== c.value) return { percentage: 0, details: [], requiredFailed: true };
    // Profession for TN
    if (c.check === 'NAFTA_LIST' && naftaProfessions.includes(userData.employment?.jobTitle)) achieved = 100;
    // Examples for rest
    if (c.key && userData.personalInfo?.[c.key] === c.value) achieved = 100;
    // Numeric checks
    if (c.min !== undefined && (userData.personalInfo?.[c.key] || 0) >= c.min) achieved = 100;
    score += achieved * c.weight;
    max += 100 * c.weight;
    details.push({ key: c.key, achieved, weight: c.weight });
  }
  return { percentage: Math.round((score / max) * 100), details };
}

function getScoreCategory(score) {
  if (score >= 90) return 'Muy preparado';
  if (score >= 70) return 'Bien preparado';
  if (score >= 50) return 'Preparación moderada';
  if (score >= 30) return 'Preparación baja';
  return 'No preparado';
}

function getNextSteps(visaType, scoreObj) {
  // Placeholder: Map next steps from visaType and detail object
  return ['Contacta a un asesor/consulado', 'Prepara tus documentos'];
}

module.exports = { calculateReadinessScore, getScoreCategory, getNextSteps };

