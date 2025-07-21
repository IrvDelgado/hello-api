 const naftaProfessions = require('./naftaProfessions');

// Spanish to English profession mapping for Latin American users
const spanishProfessionMap = {
  'ingeniero': 'engineer',
  'medico': 'physician',
  'doctor': 'physician',
  'enfermero': 'nurse',
  'enfermera': 'registered nurse',
  'abogado': 'lawyer',
  'contador': 'accountant',
  'contadora': 'accountant',
  'arquitecto': 'architect',
  'psicologo': 'psychologist',
  'psicologa': 'psychologist',
  'dentista': 'dentist',
  'veterinario': 'veterinarian',
  'farmaceutico': 'pharmacist',
  'quimico': 'chemist',
  'biologo': 'biologist',
  'fisico': 'physicist',
  'matematico': 'mathematician',
  'economista': 'economist',
  'administrador': 'manager',
  'gerente': 'manager',
  'director': 'manager',
  'consultor': 'consultant',
  'analista': 'analyst',
  'investigador': 'researcher',
  'cientifico': 'scientist',
  'programador': 'programmer',
  'desarrollador': 'developer',
  'diseñador': 'designer',
  'profesor': 'teacher',
  'maestro': 'teacher',
  'bibliotecario': 'librarian',
  'trabajador social': 'social worker',
  'fisioterapeuta': 'physiotherapist',
  'terapeuta': 'therapist',
  'nutriologo': 'nutritionist',
  'agrónomo': 'agriculturist',
  'geologo': 'geologist',
  'meteorologo': 'meteorologist',
  'urbanista': 'urban planner',
  'silvicultor': 'sylviculturist',
  'forestal': 'forester',
  'topografo': 'land surveyor'
};

// Improved profession matching function - now returns score instead of boolean
function isNAFTAProfession(jobTitle) {
  if (!jobTitle || typeof jobTitle !== 'string') return false;
  
  const normalizedJob = jobTitle.toLowerCase().trim();
  
  // Direct match in English list
  if (naftaProfessions.includes(normalizedJob)) return true;
  
  // Check Spanish translations
  if (spanishProfessionMap[normalizedJob]) {
    const englishEquivalent = spanishProfessionMap[normalizedJob];
    return naftaProfessions.includes(englishEquivalent);
  }
  
  // Fuzzy matching for common variations
  for (const profession of naftaProfessions) {
    // Check if job title contains the profession (e.g., "software engineer" contains "engineer")
    if (normalizedJob.includes(profession) || profession.includes(normalizedJob)) {
      return true;
    }
    
    // Check common variations and abbreviations
    if (isJobVariation(normalizedJob, profession)) {
      return true;
    }
  }
  
  return false;
}

// New function to evaluate profession category and give partial credit
function evaluateProfessionScore(jobTitle) {
  if (!jobTitle || typeof jobTitle !== 'string') return 0;
  
  const normalizedJob = jobTitle.toLowerCase().trim();
  
  // Full score for NAFTA professions
  if (isNAFTAProfession(normalizedJob)) return 100;
  
  // Partial scores for related professional categories
  const professionCategories = {
    // High-skill professions that often qualify for specialty visas
    highSkill: ['ingeniero', 'doctor', 'médico', 'abogado', 'científico', 'investigador', 'profesor', 'consultor', 'director', 'gerente', 'administrador', 'analista', 'especialista'],
    mediumSkill: ['técnico', 'supervisor', 'coordinador', 'asistente', 'representante', 'vendedor', 'operador', 'inspector', 'diseñador'],
    professionalServices: ['contador', 'auditor', 'asesor', 'traductor', 'intérprete', 'editor', 'periodista', 'escritor'],
    healthcare: ['enfermero', 'enfermera', 'terapeuta', 'fisioterapeuta', 'nutricionista', 'técnico médico'],
    education: ['maestro', 'instructor', 'educador', 'capacitador'],
    creative: ['artista', 'músico', 'fotógrafo', 'videoasta', 'editor de video', 'diseñador gráfico'],
    it: ['programador', 'desarrollador', 'tester', 'soporte técnico', 'administrador de sistemas']
  };
  
  // Check each category and assign score
  for (const [category, keywords] of Object.entries(professionCategories)) {
    for (const keyword of keywords) {
      if (normalizedJob.includes(keyword) || keyword.includes(normalizedJob)) {
        switch (category) {
          case 'highSkill': 
          case 'professionalServices':
          case 'healthcare':
            return 70; // Good chance for specialty visas
          case 'mediumSkill':
          case 'education':
          case 'it':
            return 60; // Moderate chance
          case 'creative':
            return 50; // Some opportunities
          default:
            return 40;
        }
      }
    }
  }
  
  // Any professional-sounding job gets some credit
  if (normalizedJob.length > 3 && !['obrero', 'trabajador', 'empleado'].includes(normalizedJob)) {
    return 30;
  }
  
  return 20; // Minimum score for any job
}

// Helper function to check job variations
function isJobVariation(jobTitle, profession) {
  const variations = {
    'engineer': ['ing', 'ingeniero', 'engineering', 'engr'],
    'physician': ['md', 'doctor', 'medico', 'dr'],
    'lawyer': ['attorney', 'abogado', 'legal counsel', 'counsel'],
    'accountant': ['cpa', 'contador', 'accounting'],
    'nurse': ['rn', 'enfermero', 'enfermera', 'nursing'],
    'programmer': ['developer', 'programador', 'dev', 'software dev'],
    'analyst': ['analista', 'analysis'],
    'consultant': ['consultor', 'consulting'],
    'manager': ['mgr', 'gerente', 'director', 'jefe'],
    'scientist': ['cientifico', 'researcher', 'investigador'],
    'teacher': ['profesor', 'maestro', 'educator', 'instructor'],
    'designer': ['diseñador', 'design'],
    'architect': ['arquitecto', 'architecture']
  };
  
  if (variations[profession]) {
    return variations[profession].some(variation => 
      jobTitle.includes(variation) || variation.includes(jobTitle)
    );
  }
  
  return false;
}

// Example function, expand as needed for all visa logics
function calculateReadinessScore(userData, criteria) {
  let score = 0, max = 0, details = [];

  for (const c of criteria) {
    let achieved = 0;

    // Enhanced validation for required fields
    if (c.required) {
      if (c.key) {
        const value = getValue(userData, c.key);
        
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
        if (!isNAFTAProfession(userData.employment?.jobTitle)) {
          return { percentage: 0, details: [], requiredFailed: true };
        }
      }
    }

    // Enhanced scoring calculation with graduated scores
    if (c.check === 'NAFTA_LIST') {
      achieved = evaluateProfessionScore(userData.employment?.jobTitle);
    } else if (c.key) {
      const value = getValue(userData, c.key);
      achieved = calculateGraduatedScore(c, value);
    }

    score += achieved * c.weight;
    max += 100 * c.weight;

    details.push({ key: c.key || c.check, achieved, weight: c.weight });
  }

  const percentage = max === 0 ? 0 : Math.round((score / max) * 100);
  return { percentage, details };
}

// Helper function to get value from nested objects
function getValue(userData, key) {
  // Check in all possible locations (return first non-undefined/non-null value)
  const personalValue = userData.personalInfo?.[key];
  const employmentValue = userData.employment?.[key];
  const familyValue = userData.familyTies?.[key];
  const preferencesValue = userData.preferences?.[key];
  
  return personalValue !== undefined && personalValue !== null ? personalValue :
         employmentValue !== undefined && employmentValue !== null ? employmentValue :
         familyValue !== undefined && familyValue !== null ? familyValue :
         preferencesValue !== undefined && preferencesValue !== null ? preferencesValue :
         undefined;
}

// Enhanced graduated scoring for better accuracy
function calculateGraduatedScore(criterion, value) {
  if (value === undefined || value === null) return 0;

  const { key, min, max, value: targetValue } = criterion;

  // Boolean values
  if (typeof targetValue === 'boolean') {
    return value === targetValue ? 100 : 0;
  }

  // Exact match values (with degree level logic)
  if (targetValue !== undefined) {
    // Special logic for degree levels - master/doctorate should qualify for bachelor requirement
    if (key === 'degreeLevel' && targetValue === 'bachelor') {
      return ['bachelor', 'master', 'doctorate'].includes(value) ? 100 : 0;
    }
    return value === targetValue ? 100 : 0;
  }

  // Range-based scoring with gradual falloff
  if (min !== undefined && max === undefined) {
    if (value >= min) return 100;
    // Graduated scoring for values below minimum
    const ratio = value / min;
    return Math.max(0, Math.min(100, ratio * 100));
  }

  if (max !== undefined && min === undefined) {
    if (value <= max) return 100;
    // Penalty for exceeding maximum (e.g., age, visit duration)
    const ratio = max / value;
    return Math.max(0, Math.min(100, ratio * 100));
  }

  // Range scoring (between min and max)
  if (min !== undefined && max !== undefined) {
    if (value >= min && value <= max) return 100;
    if (value < min) {
      const ratio = value / min;
      return Math.max(0, ratio * 100);
    }
    if (value > max) {
      const ratio = max / value;
      return Math.max(0, ratio * 100);
    }
  }

  // Special scoring logic for specific fields
  return calculateSpecialFieldScore(key, value);
}

// Special scoring for fields requiring custom logic
function calculateSpecialFieldScore(key, value) {
  switch (key) {
    case 'financialProof':
    case 'academicRecord':
    case 'tiesHomeCountry':
    case 'englishProficiency':
      // These are already percentages (0-100)
      return Math.min(100, Math.max(0, value));
    
    case 'salary':
      // Graduated salary scoring (optimized for Latin American context)
      if (value >= 80000) return 95;   // Excellent 
      if (value >= 50000) return 80;   // Very good
      if (value >= 25000) return 60;   // Acceptable
      if (value >= 15000) return 40;   // Below average
      if (value >= 10000) return 20;   // Low
      return 10; // Very low
    
    case 'age':
      // Optimal age range for visas (25-40 is prime)
      if (value >= 30 && value <= 35) return 95;  // Prime age
      if (value >= 25 && value <= 40) return 80;  // Very good
      if (value >= 20 && value <= 50) return 70;  // Good
      if (value >= 18 && value <= 60) return 50;  // Acceptable
      return 35; // Very young or older applicants
    
    case 'visitDuration':
      // Shorter visits are better for tourist visas
      if (value <= 30) return 80;  // Capped at 80
      if (value <= 90) return 60;
      if (value <= 180) return 40;
      return 20; // Long visits raise suspicion
    
    default:
      return 0;
  }
}


function getScoreCategory(score) {
  if (score >= 90) return 'Muy preparado';
  if (score >= 70) return 'Bien preparado';
  if (score >= 50) return 'Preparación moderada';
  if (score >= 30) return 'Preparación baja';
  return 'No preparado';
}

function getNextSteps(visaType, scoreObj) {
  const { code } = visaType;
  const { percentage, details } = scoreObj;
  let steps = [];

  // Common steps for all visa types
  const commonSteps = [
    'Agenda una cita en el consulado estadounidense más cercano',
    'Prepara todos los documentos requeridos con traducciones oficiales',
    'Practica para la entrevista consular'
  ];

  // Specific steps based on visa type and score
  switch (code) {
    case 'TN':
      steps = [
        percentage >= 80 
          ? 'Tu perfil es excelente para visa TN. Solicita una oferta laboral formal'
          : 'Mejora tu nivel de inglés y busca empleadores que ofrezcan posiciones NAFTA',
        'Verifica que tu profesión esté en la lista NAFTA',
        'Obtén una carta de empleo detallada del empleador estadounidense',
        ...commonSteps
      ];
      break;

    case 'H1B':
      steps = [
        percentage >= 70
          ? 'Perfil competitivo para H-1B. Busca empleadores con historial de patrocinio'
          : 'Necesitas mejorar: considera maestría, certificaciones, o más experiencia',
        'Encuentra empleadores dispuestos a patrocinar H-1B',
        'Prepara evidencia de especialización en tu campo',
        'Considera aplicar a múltiples empleadores para aumentar chances',
        ...commonSteps
      ];
      break;

    case 'H2A':
    case 'H2B':
      steps = [
        'Busca empleadores estadounidenses con certificación laboral temporal',
        'Verifica que tu país esté en la lista elegible para H-2',
        'Prepara evidencia de que regresarás a tu país de origen',
        ...commonSteps
      ];
      break;

    case 'F1':
      steps = [
        percentage >= 60
          ? 'Buen candidato para F-1. Aplica a universidades acreditadas'
          : 'Fortalece tu perfil académico y evidencia financiera',
        'Obtén admisión en una institución SEVP-certificada',
        'Demuestra fondos suficientes para estudios y manutención',
        'Prepara evidencia de vínculos fuertes con tu país de origen',
        ...commonSteps
      ];
      break;

    case 'B1B2':
      steps = [
        percentage >= 50
          ? 'Perfil adecuado para visa de turista/negocios'
          : 'Fortalece vínculos con tu país y evidencia financiera',
        'Prepara itinerario detallado de tu viaje',
        'Demuestra ingresos estables y propiedades en tu país',
        'Obtén reservaciones de hotel y boletos de regreso',
        ...commonSteps
      ];
      break;

    case 'IR1':
    case 'K1':
      steps = [
        'Presenta petición I-130 o I-129F según corresponda',
        'Reúne evidencia exhaustiva de relación genuina',
        'Completa examen médico en centro aprobado',
        'Prepara documentos de antecedentes policiales',
        ...commonSteps
      ];
      break;

    case 'E2':
      steps = [
        percentage >= 60
          ? 'Inversión suficiente para E-2. Desarrolla plan de negocios sólido'
          : 'Aumenta monto de inversión o mejora plan de negocios',
        'Invierte al menos $150,000 USD en empresa estadounidense',
        'Demuestra que la inversión creará empleos para ciudadanos estadounidenses',
        'Prepara plan de negocios detallado con proyecciones financieras',
        ...commonSteps
      ];
      break;

    default:
      steps = [
        'Consulta con un abogado de inmigración especializado',
        'Evalúa alternativas de visa que se adapten mejor a tu perfil',
        ...commonSteps
      ];
  }

  // Add improvement suggestions based on low-scoring criteria
  const lowScoringCriteria = details.filter(d => d.achieved < 50);
  if (lowScoringCriteria.length > 0) {
    steps.unshift('🎯 Áreas de mejora prioritarias:');
    
    lowScoringCriteria.forEach(criterion => {
      switch (criterion.key) {
        case 'englishProficiency':
          steps.push('• Mejora tu inglés: toma clases, obtén certificación TOEFL/IELTS');
          break;
        case 'financialProof':
          steps.push('• Fortalece tu situación financiera: aumenta ahorros, obtén carta bancaria');
          break;
        case 'academicRecord':
          steps.push('• Considera estudios adicionales: certificaciones, cursos, títulos');
          break;
        case 'tiesHomeCountry':
          steps.push('• Demuestra vínculos con tu país: trabajo, familia, propiedades');
          break;
        case 'hasJobOffer':
          steps.push('• Consigue oferta laboral formal de empleador estadounidense');
          break;
      }
    });
  }

  return steps.slice(0, 8); // Limit to 8 most important steps
}

module.exports = { calculateReadinessScore, getScoreCategory, getNextSteps, isNAFTAProfession, evaluateProfessionScore };

