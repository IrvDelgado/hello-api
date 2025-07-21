const scoringService = require('../src/services/scoringService');
const { calculateReadinessScore, getScoreCategory, getNextSteps } = require('../src/models/scoringCriteria');

describe('Scoring Service Tests', () => {
  
  // ============================================================================
  // SCORING SERVICE INTEGRATION TESTS
  // ============================================================================
  
  describe('calculateVisaEligibility Integration', () => {
    
    it('should return properly structured results', async () => {
      const userData = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'bachelor',
          englishProficiency: 80,
          financialProof: 70,
          academicRecord: 85,
          tiesHomeCountry: 60,
          priorUSExperience: true
        },
        employment: {
          jobTitle: 'engineer',
          jobType: 'specialty',
          hasJobOffer: true,
          salary: 70000
        },
        familyTies: {},
        preferences: {
          treatyCountry: true
        }
      };

      const result = await scoringService.calculateVisaEligibility(userData);

      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('eligibleVisas');
      expect(result).toHaveProperty('allVisas');
      
      expect(typeof result.overallScore).toBe('number');
      expect(Array.isArray(result.eligibleVisas)).toBe(true);
      expect(Array.isArray(result.allVisas)).toBe(true);
      
      // Eligible visas should have score >= 50
      result.eligibleVisas.forEach(visa => {
        expect(visa.score).toBeGreaterThanOrEqual(50);
      });
      
      // All visas should be sorted by score (highest first)
      for (let i = 0; i < result.allVisas.length - 1; i++) {
        expect(result.allVisas[i].score).toBeGreaterThanOrEqual(result.allVisas[i + 1].score);
      }
    });

    it('should handle empty user data gracefully', async () => {
      const emptyData = {
        personalInfo: {},
        employment: {},
        familyTies: {},
        preferences: {}
      };

      const result = await scoringService.calculateVisaEligibility(emptyData);

      expect(result).toHaveProperty('overallScore');
      expect(result.overallScore).toBe(0); // Should be 0 for empty data
      expect(result.eligibleVisas).toHaveLength(0); // No eligible visas
      expect(result.allVisas.length).toBeGreaterThan(0); // Should have all visa types
    });

    it('should calculate different scores for different profiles', async () => {
      const strongProfile = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'master',
          englishProficiency: 95,
          financialProof: 90,
          academicRecord: 95,
          tiesHomeCountry: 80,
          priorUSExperience: true
        },
        employment: {
          jobTitle: 'software engineer',
          jobType: 'specialty',
          hasJobOffer: true,
          salary: 120000
        }
      };

      const weakProfile = {
        personalInfo: {
          nationality: 'BR',
          age: 19,
          degreeLevel: 'high_school',
          englishProficiency: 20,
          financialProof: 10,
          academicRecord: 30,
          tiesHomeCountry: 15
        },
        employment: {
          jobTitle: 'cashier',
          hasJobOffer: false,
          salary: 15000
        }
      };

      const strongResult = await scoringService.calculateVisaEligibility(strongProfile);
      const weakResult = await scoringService.calculateVisaEligibility(weakProfile);

      expect(strongResult.overallScore).toBeGreaterThan(weakResult.overallScore + 30);
      expect(strongResult.eligibleVisas.length).toBeGreaterThan(weakResult.eligibleVisas.length);
    });
  });

  // ============================================================================
  // INDIVIDUAL SCORING FUNCTION TESTS
  // ============================================================================
  
  describe('calculateReadinessScore Function', () => {
    
    it('should handle required field validation correctly', () => {
      const userData = {
        personalInfo: { nationality: 'US' }, // Wrong nationality for TN visa
        employment: { jobTitle: 'engineer' }
      };

      const tnCriteria = [
        { key: 'nationality', value: 'MX', weight: 0.30, required: true },
        { key: 'profession', check: 'NAFTA_LIST', weight: 0.70 }
      ];

      const result = calculateReadinessScore(userData, tnCriteria);

      expect(result.percentage).toBe(0); // Should fail due to required field
      expect(result.requiredFailed).toBe(true);
    });

    it('should calculate graduated scores for salary ranges', () => {
      const testCases = [
        { salary: 80000, expectedMin: 95 }, // High salary
        { salary: 50000, expectedMin: 70 }, // Good salary  
        { salary: 25000, expectedMin: 40 }, // Acceptable salary
        { salary: 10000, expectedMax: 30 }  // Low salary
      ];

      testCases.forEach(testCase => {
        const userData = {
          employment: { salary: testCase.salary }
        };

        const criteria = [
          { key: 'salary', min: 40000, weight: 1.0 }
        ];

        const result = calculateReadinessScore(userData, criteria);
        
        if (testCase.expectedMin) {
          expect(result.percentage).toBeGreaterThanOrEqual(testCase.expectedMin);
        }
        if (testCase.expectedMax) {
          expect(result.percentage).toBeLessThanOrEqual(testCase.expectedMax);
        }
      });
    });

    it('should handle NAFTA profession matching', () => {
      const userData = {
        employment: { jobTitle: 'software engineer' }
      };

      const criteria = [
        { check: 'NAFTA_LIST', weight: 1.0 }
      ];

      const result = calculateReadinessScore(userData, criteria);

      expect(result.percentage).toBe(100); // Should match engineer
      expect(result.details[0].achieved).toBe(100);
    });

    it('should handle Spanish profession names', () => {
      const spanishProfessions = [
        'ingeniero', 'contador', 'abogado', 'medico', 'arquitecto'
      ];

      spanishProfessions.forEach(profession => {
        const userData = {
          employment: { jobTitle: profession }
        };

        const criteria = [
          { check: 'NAFTA_LIST', weight: 1.0 }
        ];

        const result = calculateReadinessScore(userData, criteria);

        expect(result.percentage).toBe(100); // Should recognize Spanish professions
      });
    });
  });

  // ============================================================================
  // SCORE CATEGORY TESTS
  // ============================================================================
  
  describe('getScoreCategory Function', () => {
    
    it('should categorize scores correctly', () => {
      const testCases = [
        { score: 95, expected: 'Muy preparado' },
        { score: 85, expected: 'Bien preparado' },
        { score: 60, expected: 'Preparación moderada' },
        { score: 40, expected: 'Preparación baja' },
        { score: 20, expected: 'No preparado' },
        { score: 0, expected: 'No preparado' }
      ];

      testCases.forEach(testCase => {
        const category = getScoreCategory(testCase.score);
        expect(category).toBe(testCase.expected);
      });
    });
  });

  // ============================================================================
  // NEXT STEPS RECOMMENDATION TESTS
  // ============================================================================
  
  describe('getNextSteps Function', () => {
    
    it('should provide specific steps for TN visa', () => {
      const tnVisaType = { code: 'TN', name: 'Visa TN' };
      const highScoreObj = { percentage: 85, details: [] };
      const lowScoreObj = { percentage: 40, details: [] };

      const highSteps = getNextSteps(tnVisaType, highScoreObj);
      const lowSteps = getNextSteps(tnVisaType, lowScoreObj);

      expect(Array.isArray(highSteps)).toBe(true);
      expect(Array.isArray(lowSteps)).toBe(true);
      expect(highSteps.length).toBeGreaterThan(0);
      expect(lowSteps.length).toBeGreaterThan(0);

      // High score should have different advice than low score
      const highAdvice = highSteps.join(' ');
      const lowAdvice = lowSteps.join(' ');
      expect(highAdvice).not.toBe(lowAdvice);

      // Should include TN-specific advice
      const tnAdvice = highSteps.concat(lowSteps).join(' ').toLowerCase();
      expect(tnAdvice).toContain('nafta');
    });

    it('should provide improvement suggestions for low-scoring criteria', () => {
      const visaType = { code: 'H1B', name: 'H-1B Visa' };
      const scoreObj = {
        percentage: 45,
        details: [
          { key: 'englishProficiency', achieved: 30, weight: 0.2 },
          { key: 'financialProof', achieved: 40, weight: 0.3 },
          { key: 'academicRecord', achieved: 80, weight: 0.3 }
        ]
      };

      const steps = getNextSteps(visaType, scoreObj);

      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);

      // Should include improvement suggestions
      const stepsText = steps.join(' ').toLowerCase();
      expect(stepsText).toContain('mejora'); // Should have improvement suggestions
      expect(stepsText).toContain('inglés'); // Should mention English improvement
    });

    it('should limit steps to reasonable number', () => {
      const visaType = { code: 'B1B2', name: 'Tourist Visa' };
      const scoreObj = {
        percentage: 30,
        details: Array(20).fill({ key: 'test', achieved: 20, weight: 0.05 }) // Many low scores
      };

      const steps = getNextSteps(visaType, scoreObj);

      expect(steps.length).toBeLessThanOrEqual(8); // Should limit to max 8 steps
    });

    it('should provide visa-specific advice for different visa types', () => {
      const visaTypes = [
        { code: 'H1B', name: 'H-1B' },
        { code: 'TN', name: 'TN' },
        { code: 'B1B2', name: 'Tourist' },
        { code: 'F1', name: 'Student' }
      ];

      const scoreObj = { percentage: 60, details: [] };

      visaTypes.forEach(visaType => {
        const steps = getNextSteps(visaType, scoreObj);
        
        expect(Array.isArray(steps)).toBe(true);
        expect(steps.length).toBeGreaterThan(0);
        
        // Each visa type should have unique advice
        const stepsText = steps.join(' ').toLowerCase();
        switch (visaType.code) {
          case 'H1B':
            expect(stepsText).toContain('especialización');
            break;
          case 'F1':
            expect(stepsText).toContain('universidad' || 'institución');
            break;
          case 'B1B2':
            expect(stepsText).toContain('itinerario' || 'vínculos');
            break;
        }
      });
    });
  });

  // ============================================================================
  // EDGE CASES AND ERROR HANDLING
  // ============================================================================
  
  describe('Edge Cases and Error Handling', () => {
    
    it('should handle missing data gracefully', async () => {
      const incompleteData = {
        personalInfo: { nationality: 'MX' }
        // Missing employment, familyTies, preferences
      };

      const result = await scoringService.calculateVisaEligibility(incompleteData);

      expect(result).toHaveProperty('overallScore');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(result.allVisas)).toBe(true);
    });

    it('should handle extreme values gracefully', async () => {
      const extremeData = {
        personalInfo: {
          nationality: 'MX',
          age: 999, // Extreme age
          englishProficiency: 999, // Over 100%
          financialProof: -100 // Negative value
        },
        employment: {
          salary: 999999999 // Extreme salary
        }
      };

      const result = await scoringService.calculateVisaEligibility(extremeData);

      expect(result).toHaveProperty('overallScore');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should handle invalid data types gracefully', async () => {
      const invalidData = {
        personalInfo: {
          nationality: 'MX',
          age: 'thirty', // String instead of number
          englishProficiency: null,
          priorUSExperience: 'yes' // String instead of boolean
        },
        employment: {
          hasJobOffer: 1, // Number instead of boolean
          salary: 'high' // String instead of number
        }
      };

      // Should not throw an error
      expect(async () => {
        await scoringService.calculateVisaEligibility(invalidData);
      }).not.toThrow();
    });
  });
});