const naftaProfessions = require('../models/naftaProfessions');
const responseFormatter = require('../utils/responseFormatter');
const { isNAFTAProfession } = require('../models/scoringCriteria');

const getValidProfessions = async (req, res, next) => {
  try {
    const professions = naftaProfessions
      .sort()
      .map(profession => ({
        id: profession,
        name: profession.charAt(0).toUpperCase() + profession.slice(1), // Capitalize first letter
        category: categorizeProfession(profession)
      }));

    res.status(200).json(responseFormatter.success('Valid professions retrieved', {
      professions,
      total: professions.length,
      categories: [...new Set(professions.map(p => p.category))]
    }));
  } catch (error) {
    next(error);
  }
};

const validateProfession = async (req, res, next) => {
  try {
    const { profession } = req.params;
    const isValid = isNAFTAProfession(profession);
    
    const suggestions = isValid ? [] : naftaProfessions
      .filter(prof => prof.includes(profession.toLowerCase()) || profession.toLowerCase().includes(prof))
      .slice(0, 5);

    res.status(200).json(responseFormatter.success('Profession validation result', {
      profession,
      isValid,
      suggestions,
      message: isValid 
        ? 'This profession is eligible for NAFTA/USMCA visas' 
        : 'This profession is not recognized in the NAFTA/USMCA professional list'
    }));
  } catch (error) {
    next(error);
  }
};

const getValidCountries = async (req, res, next) => {
  try {
    const countries = [
      { code: 'MX', name: 'Mexico', region: 'North America', usmca: true },
      { code: 'CA', name: 'Canada', region: 'North America', usmca: true },
      { code: 'US', name: 'United States', region: 'North America', usmca: true },
      { code: 'AR', name: 'Argentina', region: 'South America', usmca: false },
      { code: 'BR', name: 'Brazil', region: 'South America', usmca: false },
      { code: 'CL', name: 'Chile', region: 'South America', usmca: false },
      { code: 'CO', name: 'Colombia', region: 'South America', usmca: false },
      { code: 'PE', name: 'Peru', region: 'South America', usmca: false },
      { code: 'VE', name: 'Venezuela', region: 'South America', usmca: false },
      { code: 'EC', name: 'Ecuador', region: 'South America', usmca: false },
      { code: 'UY', name: 'Uruguay', region: 'South America', usmca: false },
      { code: 'PY', name: 'Paraguay', region: 'South America', usmca: false },
      { code: 'BO', name: 'Bolivia', region: 'South America', usmca: false },
      { code: 'GT', name: 'Guatemala', region: 'Central America', usmca: false },
      { code: 'CR', name: 'Costa Rica', region: 'Central America', usmca: false },
      { code: 'PA', name: 'Panama', region: 'Central America', usmca: false },
      { code: 'HN', name: 'Honduras', region: 'Central America', usmca: false },
      { code: 'SV', name: 'El Salvador', region: 'Central America', usmca: false },
      { code: 'NI', name: 'Nicaragua', region: 'Central America', usmca: false },
      { code: 'DO', name: 'Dominican Republic', region: 'Caribbean', usmca: false },
      { code: 'CU', name: 'Cuba', region: 'Caribbean', usmca: false },
      { code: 'ES', name: 'Spain', region: 'Europe', usmca: false }
    ];

    res.status(200).json(responseFormatter.success('Valid countries retrieved', {
      countries,
      total: countries.length,
      usmcaCountries: countries.filter(c => c.usmca).length
    }));
  } catch (error) {
    next(error);
  }
};

function categorizeProfession(profession) {
  if (profession.includes('engineer') || profession.includes('engineering')) return 'Engineering';
  if (profession.includes('doctor') || profession.includes('physician') || profession.includes('medical') || 
      profession.includes('nurse') || profession.includes('dentist') || profession.includes('therapist')) return 'Medical';
  if (profession.includes('scientist') || profession.includes('research') || profession.includes('biologist') || 
      profession.includes('chemist') || profession.includes('physicist')) return 'Science';
  if (profession.includes('programmer') || profession.includes('developer') || profession.includes('analyst') || 
      profession.includes('computer') || profession.includes('systems')) return 'Technology';
  if (profession.includes('manager') || profession.includes('consultant') || profession.includes('accountant') || 
      profession.includes('economist')) return 'Business';
  if (profession.includes('lawyer') || profession.includes('attorney')) return 'Legal';
  if (profession.includes('teacher') || profession.includes('professor')) return 'Education';
  if (profession.includes('designer') || profession.includes('architect')) return 'Design';
  return 'General';
}

module.exports = { 
  getValidProfessions, 
  validateProfession, 
  getValidCountries 
};