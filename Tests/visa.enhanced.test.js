const request = require('supertest');
const app = require('../app');

describe('Enhanced Visa Eligibility API Tests', () => {
  
  // ============================================================================
  // VALIDATION TESTS - Testing all edge cases and validation rules
  // ============================================================================
  
  describe('Input Validation', () => {
    
    it('should accept complete valid data structure', async () => {
      const validData = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'bachelor',
          englishProficiency: 80,
          financialProof: 70,
          academicRecord: 85,
          tiesHomeCountry: 60,
          priorUSExperience: true,
          financialSupport: 25000,
          visitDuration: 90,
          returnTicket: true,
          previousVisaRecord: false
        },
        employment: {
          jobTitle: 'software engineer',
          jobType: 'specialty',
          hasJobOffer: true,
          occupationType: 'specialty',
          salary: 75000,
          seasonal: false
        },
        familyTies: {
          marriedToUSCitizen: false,
          proofGenuineMarriage: false,
          proofOfRelationship: false,
          engagedToUSCitizen: false,
          metInPerson: false,
          intentToMarryIn90Days: false,
          jointResidencePlan: false
        },
        preferences: {
          hasI20: false,
          sponsorProgram: false,
          exchangeTypeEligible: false,
          purposeValid: true,
          treatyCountry: true,
          investmentUSD: 0,
          ownershipPercent: 0,
          businessViable: false,
          businessValid: false,
          sourceOfFundsValid: false,
          jobCreation: 0
        }
      };

      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(validData);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overallScore');
      expect(response.body.data).toHaveProperty('eligibleVisas');
      expect(response.body.data).toHaveProperty('allVisas');
    });

    it('should reject invalid nationality codes', async () => {
      const invalidData = {
        personalInfo: {
          nationality: 'INVALID',
          age: 30,
          degreeLevel: 'bachelor'
        }
      };

      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid age ranges', async () => {
      const testCases = [
        { age: 17, description: 'too young' },
        { age: 100, description: 'too old' },
        { age: -5, description: 'negative age' },
        { age: 'thirty', description: 'non-numeric age' }
      ];

      for (const testCase of testCases) {
        const invalidData = {
          personalInfo: {
            nationality: 'MX',
            age: testCase.age,
            degreeLevel: 'bachelor'
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(invalidData);

        expect(response.statusCode).toBe(400);
        expect(response.body.success).toBe(false);
      }
    });

    it('should reject invalid degree levels', async () => {
      const invalidData = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'invalid_degree'
        }
      };

      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid jobType values', async () => {
      const invalidData = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'bachelor'
        },
        employment: {
          jobType: 'invalid_job_type'
        }
      };

      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept valid jobType values', async () => {
      const validJobTypes = ['agricultural', 'nonagricultural', 'specialty'];
      
      for (const jobType of validJobTypes) {
        const validData = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: 'bachelor'
          },
          employment: {
            jobType: jobType,
            jobTitle: 'engineer'
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(validData);

        expect(response.statusCode).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it('should handle percentage values correctly (0-100)', async () => {
      const testData = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'bachelor',
          englishProficiency: 101, // Invalid - over 100
          financialProof: -5 // Invalid - negative
        }
      };

      // The API should either reject invalid percentages or clamp them
      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(testData);

      // Should either be rejected (400) or accepted with clamped values (200)
      expect([200, 400]).toContain(response.statusCode);
    });
  });

  // ============================================================================
  // NAFTA PROFESSION MATCHING TESTS
  // ============================================================================
  
  describe('NAFTA Profession Recognition', () => {
    
    it('should recognize standard English NAFTA professions', async () => {
      const naftaProfessions = [
        'engineer', 'accountant', 'lawyer', 'physician', 'architect',
        'scientist', 'mathematician', 'economist', 'psychologist'
      ];

      for (const profession of naftaProfessions) {
        const data = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: 'bachelor',
            englishProficiency: 80,
            financialProof: 70,
            academicRecord: 85,
            tiesHomeCountry: 60
          },
          employment: {
            jobTitle: profession,
            jobType: 'specialty',
            hasJobOffer: true,
            salary: 60000
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(data);

        expect(response.statusCode).toBe(200);
        
        // Should find TN visa with high score due to NAFTA profession
        const tnVisa = response.body.data.allVisas.find(v => v.type === 'TN');
        expect(tnVisa).toBeDefined();
        expect(tnVisa.score).toBeGreaterThan(50); // Should score well for NAFTA professions
      }
    });

    it('should recognize Spanish profession names', async () => {
      const spanishProfessions = [
        'ingeniero', 'contador', 'abogado', 'medico', 'arquitecto',
        'cientifico', 'matematico', 'economista', 'psicologo'
      ];

      for (const profession of spanishProfessions) {
        const data = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: 'bachelor',
            englishProficiency: 80,
            financialProof: 70,
            academicRecord: 85,
            tiesHomeCountry: 60
          },
          employment: {
            jobTitle: profession,
            jobType: 'specialty',
            hasJobOffer: true,
            salary: 60000
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(data);

        expect(response.statusCode).toBe(200);
        
        // Should recognize Spanish professions as NAFTA-eligible
        const tnVisa = response.body.data.allVisas.find(v => v.type === 'TN');
        expect(tnVisa).toBeDefined();
        expect(tnVisa.score).toBeGreaterThan(50);
      }
    });

    it('should handle profession variations and abbreviations', async () => {
      const professionVariations = [
        'software engineer', 'civil engineer', 'software developer',
        'md', 'dr', 'cpa', 'attorney', 'registered nurse', 'rn'
      ];

      for (const profession of professionVariations) {
        const data = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: 'bachelor',
            englishProficiency: 80
          },
          employment: {
            jobTitle: profession,
            jobType: 'specialty',
            hasJobOffer: true,
            salary: 60000
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(data);

        expect(response.statusCode).toBe(200);
        // Variations should be recognized
        const tnVisa = response.body.data.allVisas.find(v => v.type === 'TN');
        expect(tnVisa).toBeDefined();
      }
    });

    it('should not recognize non-NAFTA professions', async () => {
      const nonNaftaProfessions = [
        'cashier', 'retail worker', 'construction worker', 
        'security guard', 'janitor', 'waiter'
      ];

      for (const profession of nonNaftaProfessions) {
        const data = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: 'bachelor'
          },
          employment: {
            jobTitle: profession,
            jobType: 'nonagricultural',
            hasJobOffer: false,
            salary: 30000
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(data);

        expect(response.statusCode).toBe(200);
        
        // TN visa should have very low or 0 score for non-NAFTA professions
        const tnVisa = response.body.data.allVisas.find(v => v.type === 'TN');
        if (tnVisa) {
          expect(tnVisa.score).toBeLessThan(20);
        }
      }
    });
  });

  // ============================================================================
  // SCORING ALGORITHM TESTS
  // ============================================================================
  
  describe('Enhanced Scoring Algorithms', () => {
    
    it('should calculate graduated salary scores correctly', async () => {
      const salaryTestCases = [
        { salary: 10000, expectedRange: [10, 30] }, // Low salary
        { salary: 25000, expectedRange: [40, 70] }, // Acceptable
        { salary: 50000, expectedRange: [70, 90] }, // Good
        { salary: 80000, expectedRange: [90, 100] } // Excellent
      ];

      for (const testCase of salaryTestCases) {
        const data = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: 'bachelor',
            englishProficiency: 70
          },
          employment: {
            jobTitle: 'engineer',
            jobType: 'specialty',
            hasJobOffer: true,
            salary: testCase.salary
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(data);

        expect(response.statusCode).toBe(200);
        
        // Find a visa that uses salary in scoring (like H-1B)
        const h1bVisa = response.body.data.allVisas.find(v => v.type === 'H1B');
        if (h1bVisa && h1bVisa.requirements) {
          const salaryRequirement = h1bVisa.requirements.find(r => r.key === 'salary');
          if (salaryRequirement) {
            expect(salaryRequirement.achieved).toBeGreaterThanOrEqual(testCase.expectedRange[0]);
            expect(salaryRequirement.achieved).toBeLessThanOrEqual(testCase.expectedRange[1]);
          }
        }
      }
    });

    it('should calculate age-based scores correctly', async () => {
      const ageTestCases = [
        { age: 20, expectedRange: [60, 80] }, // Young but acceptable
        { age: 32, expectedRange: [90, 100] }, // Optimal age
        { age: 55, expectedRange: [60, 80] }, // Older but acceptable
        { age: 65, expectedRange: [30, 50] }  // Senior age
      ];

      for (const testCase of ageTestCases) {
        const data = {
          personalInfo: {
            nationality: 'MX',
            age: testCase.age,
            degreeLevel: 'bachelor'
          },
          employment: {
            jobType: 'agricultural',
            hasJobOffer: true
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(data);

        expect(response.statusCode).toBe(200);
        
        // Check age scoring in H-2A visa
        const h2aVisa = response.body.data.allVisas.find(v => v.type === 'H2A');
        if (h2aVisa && h2aVisa.requirements) {
          const ageRequirement = h2aVisa.requirements.find(r => r.key === 'age');
          if (ageRequirement) {
            expect(ageRequirement.achieved).toBeGreaterThanOrEqual(testCase.expectedRange[0]);
            expect(ageRequirement.achieved).toBeLessThanOrEqual(testCase.expectedRange[1]);
          }
        }
      }
    });

    it('should handle visit duration scoring for tourist visas', async () => {
      const durationTestCases = [
        { duration: 15, expectedHigh: true },  // Short visit - good
        { duration: 60, expectedHigh: true },  // Medium visit - ok
        { duration: 120, expectedHigh: false }, // Long visit - suspicious
        { duration: 300, expectedHigh: false }  // Very long - red flag
      ];

      for (const testCase of durationTestCases) {
        const data = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: 'bachelor',
            visitDuration: testCase.duration,
            financialProof: 60,
            tiesHomeCountry: 70,
            returnTicket: true
          },
          preferences: {
            purposeValid: true
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(data);

        expect(response.statusCode).toBe(200);
        
        // Check B-1/B-2 visa scoring
        const b1b2Visa = response.body.data.allVisas.find(v => v.type === 'B1B2');
        if (b1b2Visa) {
          if (testCase.expectedHigh) {
            expect(b1b2Visa.score).toBeGreaterThan(40);
          } else {
            expect(b1b2Visa.score).toBeLessThan(60);
          }
        }
      }
    });
  });

  // ============================================================================
  // VISA-SPECIFIC LOGIC TESTS
  // ============================================================================
  
  describe('Visa-Specific Logic', () => {
    
    it('should prioritize TN visa for Mexican NAFTA professionals', async () => {
      const data = {
        personalInfo: {
          nationality: 'MX', // Mexican nationality
          age: 30,
          degreeLevel: 'bachelor',
          englishProficiency: 80,
          priorUSExperience: false
        },
        employment: {
          jobTitle: 'engineer', // NAFTA profession
          jobType: 'specialty',
          hasJobOffer: true,
          salary: 70000
        }
      };

      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(data);

      expect(response.statusCode).toBe(200);
      
      const tnVisa = response.body.data.allVisas.find(v => v.type === 'TN');
      expect(tnVisa).toBeDefined();
      expect(tnVisa.score).toBeGreaterThan(70); // Should score very high
      
      // TN should be among eligible visas
      const eligibleTN = response.body.data.eligibleVisas.find(v => v.type === 'TN');
      expect(eligibleTN).toBeDefined();
    });

    it('should favor H-2A visa for agricultural workers', async () => {
      const data = {
        personalInfo: {
          nationality: 'MX',
          age: 28,
          degreeLevel: 'high_school'
        },
        employment: {
          jobTitle: 'farm worker',
          jobType: 'agricultural', // Agricultural work
          hasJobOffer: true,
          seasonal: true, // Seasonal work
          salary: 25000
        }
      };

      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(data);

      expect(response.statusCode).toBe(200);
      
      const h2aVisa = response.body.data.allVisas.find(v => v.type === 'H2A');
      expect(h2aVisa).toBeDefined();
      expect(h2aVisa.score).toBeGreaterThan(60); // Should score well
    });

    it('should require strong ties for B-1/B-2 tourist visas', async () => {
      const weakTiesData = {
        personalInfo: {
          nationality: 'CO',
          age: 25,
          degreeLevel: 'bachelor',
          financialProof: 30, // Low financial proof
          tiesHomeCountry: 20, // Weak ties
          visitDuration: 45,
          returnTicket: true
        },
        preferences: {
          purposeValid: true
        }
      };

      const strongTiesData = {
        ...weakTiesData,
        personalInfo: {
          ...weakTiesData.personalInfo,
          financialProof: 80, // Strong financial proof
          tiesHomeCountry: 90  // Strong ties
        }
      };

      // Test weak ties
      const weakResponse = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(weakTiesData);

      // Test strong ties
      const strongResponse = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(strongTiesData);

      expect(weakResponse.statusCode).toBe(200);
      expect(strongResponse.statusCode).toBe(200);

      const weakB1B2 = weakResponse.body.data.allVisas.find(v => v.type === 'B1B2');
      const strongB1B2 = strongResponse.body.data.allVisas.find(v => v.type === 'B1B2');

      expect(strongB1B2.score).toBeGreaterThan(weakB1B2.score + 20); // Significantly higher
    });

    it('should require high education for H-1B specialty worker visa', async () => {
      const lowEducationData = {
        personalInfo: {
          nationality: 'AR',
          age: 30,
          degreeLevel: 'high_school', // Low education
          englishProficiency: 80
        },
        employment: {
          jobTitle: 'engineer',
          jobType: 'specialty',
          hasJobOffer: true,
          occupationType: 'specialty',
          salary: 80000
        }
      };

      const highEducationData = {
        ...lowEducationData,
        personalInfo: {
          ...lowEducationData.personalInfo,
          degreeLevel: 'master' // High education
        }
      };

      const lowEduResponse = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(lowEducationData);

      const highEduResponse = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(highEducationData);

      expect(lowEduResponse.statusCode).toBe(200);
      expect(highEduResponse.statusCode).toBe(200);

      const lowH1B = lowEduResponse.body.data.allVisas.find(v => v.type === 'H1B');
      const highH1B = highEduResponse.body.data.allVisas.find(v => v.type === 'H1B');

      // H-1B requires bachelor's degree minimum
      expect(lowH1B.score).toBe(0); // Should fail required field
      expect(highH1B.score).toBeGreaterThan(70); // Should score well
    });
  });

  // ============================================================================
  // NATIONALITY VARIATIONS TESTS
  // ============================================================================
  
  describe('Nationality-Based Scoring', () => {
    
    it('should give advantages to USMCA countries for relevant visas', async () => {
      const usmcaCountries = ['MX', 'CA'];
      const otherCountries = ['BR', 'AR', 'CO'];

      for (const nationality of usmcaCountries.concat(otherCountries)) {
        const data = {
          personalInfo: {
            nationality: nationality,
            age: 30,
            degreeLevel: 'bachelor',
            englishProficiency: 75
          },
          employment: {
            jobTitle: 'engineer',
            jobType: 'specialty',
            hasJobOffer: true,
            salary: 65000
          }
        };

        const response = await request(app)
          .post('/api/v1/visa/eligibility')
          .send(data);

        expect(response.statusCode).toBe(200);

        const tnVisa = response.body.data.allVisas.find(v => v.type === 'TN');
        
        if (usmcaCountries.includes(nationality)) {
          // USMCA countries should have high TN scores
          expect(tnVisa.score).toBeGreaterThan(70);
        } else {
          // Non-USMCA countries should have 0 TN score (required field fails)
          expect(tnVisa.score).toBe(0);
        }
      }
    });
  });

  // ============================================================================
  // ERROR HANDLING AND EDGE CASES
  // ============================================================================
  
  describe('Error Handling and Edge Cases', () => {
    
    it('should handle missing optional fields gracefully', async () => {
      const minimalData = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'bachelor'
        }
      };

      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(minimalData);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overallScore');
    });

    it('should handle null and undefined values in optional fields', async () => {
      const dataWithNulls = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'bachelor',
          englishProficiency: null,
          financialProof: undefined,
          priorUSExperience: null
        },
        employment: {
          jobTitle: null,
          hasJobOffer: false,
          salary: undefined
        }
      };

      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(dataWithNulls);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should provide meaningful error messages for validation failures', async () => {
      const invalidData = {
        personalInfo: {
          nationality: 'INVALID',
          age: -5,
          degreeLevel: 'invalid_degree'
        }
      };

      const response = await request(app)
        .post('/api/v1/visa/eligibility')
        .send(invalidData);

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
});