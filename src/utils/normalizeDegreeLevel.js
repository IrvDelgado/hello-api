// src/utils/normalizeDegreeLevel.js
function normalizeDegreeLevel(input) {
  const normalized = String(input).toLowerCase().replace(/\s+/g, '');

  const map = {
    none: 'none',
    ninguna: 'none',
    sinestudios: 'none',

    primaria: 'elementary',
    elementary: 'elementary',

    secundaria: 'middle_school',
    middleschool: 'middle_school',

    preparatoria: 'high_school',
    highschool: 'high_school',
    'high_school': 'high_school',

    tecnico: 'associate',
    technical: 'associate',
    associate: 'associate',

    licenciatura: 'bachelor',
    bachelor: 'bachelor',
    bsc: 'bachelor',

    maestria: 'master',
    master: 'master',
    msc: 'master',

    doctorado: 'doctorate',
    phd: 'doctorate',
    doctorate: 'doctorate',
  };

  return map[normalized] || null;
}

module.exports = normalizeDegreeLevel;
