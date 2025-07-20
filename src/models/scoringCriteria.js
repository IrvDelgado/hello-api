 const naftaProfessions = require('./naftaProfessions');

// Example function, expand as needed for all visa logics
function calculateReadinessScore(userData, criteria) {
  let score = 0, max = 0, details = [];

  for (const c of criteria) {
    let achieved = 0;

    // Validar requeridos: si no se cumple, falla el score entero
    if (c.required) {
      if (c.key) {
        // Chequear en personalInfo o employment según la key
        const value = (userData.personalInfo?.[c.key] !== undefined) 
          ? userData.personalInfo[c.key]
          : userData.employment?.[c.key];

        if (c.value !== undefined && value !== c.value) {
          return { percentage: 0, details: [], requiredFailed: true };
        }
        if (c.min !== undefined && (value === undefined || value < c.min)) {
          return { percentage: 0, details: [], requiredFailed: true };
        }
        if (c.max !== undefined && (value !== undefined && value > c.max)) {
          return { percentage: 0, details: [], requiredFailed: true };
        }
      }
      else if (c.check === 'NAFTA_LIST') {
        if (!naftaProfessions.includes(userData.employment?.jobTitle)) {
          return { percentage: 0, details: [], requiredFailed: true };
        }
      }
    }

    // Calcular score normal:

    if (c.check === 'NAFTA_LIST') {
      achieved = naftaProfessions.includes(userData.employment?.jobTitle) ? 100 : 0;
    } else if (c.key) {
      let value = userData.personalInfo?.[c.key];
      if (value === undefined && userData.employment) {
        value = userData.employment[c.key];
      }

      if (c.value !== undefined) {
        achieved = value === c.value ? 100 : 0;
      } else if (c.min !== undefined) {
        achieved = (value !== undefined && value >= c.min) ? 100 : 0;
      } else if (c.max !== undefined) {
        achieved = (value !== undefined && value <= c.max) ? 100 : 0;
      }
    }

    score += achieved * c.weight;
    max += 100 * c.weight;

    details.push({ key: c.key || c.check, achieved, weight: c.weight });
  }

  const percentage = max === 0 ? 0 : Math.round((score / max) * 100);
  return { percentage, details };
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

