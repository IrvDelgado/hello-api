module.exports = [
  // TN Professional (Mexico/Canada)
  {
    code: 'TN',
    name: 'Visa TN (Profesional USMCA/NAFTA)',
    criteria: [
      { key: 'nationality', value: 'MX', weight: 0.30, required: true },
      { check: 'NAFTA_LIST', weight: 0.22, required: true },
      { key: 'degreeLevel', value: 'bachelor', weight: 0.18 },
      { key: 'hasJobOffer', value: true, weight: 0.20 },
      { key: 'englishProficiency', min: 70, weight: 0.10 }
    ]
  },

  // H-1B Specialty Worker
  {
    code: 'H1B',
    name: 'Visa H-1B (Profesional Especializado)',
    criteria: [
      { key: 'degreeLevel', value: 'bachelor', weight: 0.22, required: true },
      { key: 'jobType', value: 'specialty', weight: 0.22 },
      { key: 'hasJobOffer', value: true, weight: 0.21 },
      { key: 'salary', min: 40000, weight: 0.14 },
      { key: 'englishProficiency', min: 60, weight: 0.10 },
      { key: 'priorUSExperience', value: true, weight: 0.11 }
    ]
  },

  // H-2A Temporary Agricultural (optimized for Latin Americans)
  {
    code: 'H2A',
    name: 'Visa H-2A (Trabajador Agrícola Temporal)',
    criteria: [
      { key: 'nationality', value: 'MX', weight: 0.15, required: false }, // Mexico preferred but not required
      { key: 'jobType', value: 'agricultural', weight: 0.25, required: true },
      { key: 'hasJobOffer', value: true, weight: 0.35, required: true }, // Most important
      { key: 'seasonal', value: true, weight: 0.15 },
      { key: 'age', min: 18, max: 60, weight: 0.10 } // More realistic age range
    ]
  },

  // H-2B Temporary Non-Agricultural (optimized for Latin Americans)
  {
    code: 'H2B',
    name: 'Visa H-2B (Trabajador Temporal No Agrícola)',
    criteria: [
      { key: 'nationality', value: 'MX', weight: 0.10, required: false }, // Mexico preferred
      { key: 'jobType', value: 'nonagricultural', weight: 0.25, required: true },
      { key: 'hasJobOffer', value: true, weight: 0.40, required: true }, // Most critical
      { key: 'seasonal', value: true, weight: 0.15 },
      { key: 'age', min: 18, max: 60, weight: 0.10 }
    ]
  },

  // F-1 Student
  {
    code: 'F1',
    name: 'Visa F-1 (Estudiante Académico)',
    criteria: [
      { key: 'hasI20', value: true, weight: 0.28, required: true },
      { key: 'financialProof', min: 60, weight: 0.22 },
      { key: 'englishProficiency', min: 50, weight: 0.17 },
      { key: 'academicRecord', min: 50, weight: 0.18 },
      { key: 'tiesHomeCountry', min: 30, weight: 0.15 }
    ]
  },

  // J-1 Exchange Visitor
  {
    code: 'J1',
    name: 'Visa J-1 (Intercambio Académico/Cultural)',
    criteria: [
      { key: 'sponsorProgram', value: true, weight: 0.30, required: true },
      { key: 'exchangeTypeEligible', value: true, weight: 0.20 },
      { key: 'proofOfFunds', min: 40, weight: 0.15 },
      { key: 'englishProficiency', min: 45, weight: 0.17 },
      { key: 'tiesHomeCountry', min: 20, weight: 0.18 }
    ]
  },

  // B-1/B-2 Visitor (optimized for Latin Americans)
  {
    code: 'B1B2',
    name: 'Visa B-1/B-2 (Visitante de Negocios/Turismo)',
    criteria: [
      { key: 'purposeValid', value: true, weight: 0.15, required: true },
      { key: 'financialProof', min: 40, weight: 0.25 }, // Higher weight for financial proof
      { key: 'tiesHomeCountry', min: 50, weight: 0.25 }, // Critical for Latin Americans
      { key: 'visitDuration', max: 90, weight: 0.15 }, // Shorter is better
      { key: 'previousVisaRecord', value: true, weight: 0.10 }, // Good but not critical
      { key: 'returnTicket', value: true, weight: 0.10 }
    ]
  },

  // IR-1 Spouse of U.S. Citizen
  {
    code: 'IR1',
    name: 'Visa IR-1 (Cónyuge de Ciudadano Estadounidense)',
    criteria: [
      { key: 'marriedToUSCitizen', value: true, weight: 0.3, required: true },
      { key: 'proofGenuineMarriage', value: true, weight: 0.25, required: true },
      { key: 'financialSupport', min: 125, weight: 0.25 },
      { key: 'age', min: 18, weight: 0.1 },
      { key: 'jointResidencePlan', value: true, weight: 0.1 }
    ]
  },

  // Family Preference: F1, F2A, F2B
  {
    code: 'F1',
    name: 'Visa F1 (Hijo/a Soltero de Ciudadano Estadounidense)',
    criteria: [
      { key: 'relationship', value: 'child_single_citizen', weight: 0.4, required: true },
      { key: 'age', min: 21, weight: 0.25, required: true },
      { key: 'financialSupport', min: 125, weight: 0.15 },
      { key: 'proofOfRelationship', value: true, weight: 0.20 }
    ]
  },

  {
    code: 'F2A',
    name: 'Visa F2A (Cónyuge/Hijo Soltero de Residente Legal)',
    criteria: [
      { key: 'relationship', value: 'spouse_child_LPR', weight: 0.40, required: true },
      { key: 'age', max: 20, weight: 0.15 },
      { key: 'financialSupport', min: 125, weight: 0.15 },
      { key: 'proofOfRelationship', value: true, weight: 0.3 }
    ]
  },

  {
    code: 'F2B',
    name: 'Visa F2B (Hijo Soltero Adulto de Residente Legal)',
    criteria: [
      { key: 'relationship', value: 'child_adult_LPR', weight: 0.50, required: true },
      { key: 'age', min: 21, weight: 0.20 },
      { key: 'financialSupport', min: 125, weight: 0.10 },
      { key: 'proofOfRelationship', value: true, weight: 0.20 }
    ]
  },

  // K-1 Fiancé(e)
  {
    code: 'K1',
    name: 'Visa K-1 (Prometido/a de Ciudadano Estadounidense)',
    criteria: [
      { key: 'engagedToUSCitizen', value: true, weight: 0.30, required: true },
      { key: 'metInPerson', value: true, weight: 0.20, required: true },
      { key: 'intentToMarryIn90Days', value: true, weight: 0.20, required: true },
      { key: 'financialSupport', min: 100, weight: 0.15 },
      { key: 'age', min: 18, weight: 0.15 }
    ]
  },

  // E-2 Investment
  {
    code: 'E2',
    name: 'Visa E-2 (Inversionista por Tratado)',
    criteria: [
      { key: 'treatyCountry', value: true, weight: 0.20, required: true },
      { key: 'investmentUSD', min: 150000, weight: 0.35 },
      { key: 'ownershipPercent', min: 50, weight: 0.18 },
      { key: 'businessViable', value: true, weight: 0.16 },
      { key: 'jobCreation', min: 2, weight: 0.11 }
    ]
  },

  // EB-5 Investment
  {
    code: 'EB5',
    name: 'Visa EB-5 (Inmigrante Inversionista)',
    criteria: [
      { key: 'investmentUSD', min: 800000, weight: 0.50, required: true },
      { key: 'jobCreation', min: 10, weight: 0.30, required: true },
      { key: 'businessValid', value: true, weight: 0.12 },
      { key: 'sourceOfFundsValid', value: true, weight: 0.08 }
    ]
  },

  // O-1 Extraordinary Ability
  {
    code: 'O1',
    name: 'Visa O-1 (Persona con Habilidades Extraordinarias)',
    criteria: [
      { key: 'extraordinaryAbility', value: true, weight: 0.40, required: true },
      { key: 'hasJobOffer', value: true, weight: 0.30 },
      { key: 'awardRecognition', value: true, weight: 0.15 },
      { key: 'peerReview', value: true, weight: 0.15 }
    ]
  },

  // L-1 Intracompany Transfer
  {
    code: 'L1',
    name: 'Visa L-1 (Transferencia Intracompany)',
    criteria: [
      { key: 'employedByCompany', value: true, weight: 0.40, required: true },
      { key: 'workedAbroad', min: 12, weight: 0.35, required: true }, // months
      { key: 'hasJobOfferUS', value: true, weight: 0.25 }
    ]
  },

  // Refugee/TPS (Temporary Protected Status)
  {
    code: 'TPS',
    name: 'TPS (Estatus de Protección Temporal)',
    criteria: [
      { key: 'nationalityEligible', value: true, weight: 0.50, required: true },
      { key: 'currentlyInUS', value: true, weight: 0.50, required: true }
    ]
  },

  // U Visa (Victims of Crime)
  {
    code: 'U',
    name: 'Visa U (Víctimas de Crimen)',
    criteria: [
      { key: 'victimOfCrime', value: true, weight: 0.6, required: true },
      { key: 'cooperateWithAuthorities', value: true, weight: 0.4 }
    ]
  },

  // P Visa (Artists, Athletes)
  {
    code: 'P',
    name: 'Visa P (Artistas, Atletas)',
    criteria: [
      { key: 'recognizedArtistOrAthlete', value: true, weight: 0.60, required: true },
      { key: 'hasJobOffer', value: true, weight: 0.40 }
    ]
  },

  // R-1 Religious Worker
  {
    code: 'R1',
    name: 'Visa R-1 (Trabajador Religioso)',
    criteria: [
      { key: 'religiousWorker', value: true, weight: 0.70, required: true },
      { key: 'hasJobOffer', value: true, weight: 0.30 }
    ]
  }
];
