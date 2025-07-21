const { validateVisaRequest } = require('../src/middleware/validator');
const normalizeDegreeLevel = require('../src/utils/normalizeDegreeLevel');

describe('Validation Middleware Tests', () => {
  
  // ============================================================================
  // DEGREE LEVEL NORMALIZATION TESTS
  // ============================================================================
  
  describe('normalizeDegreeLevel Function', () => {
    
    it('should normalize Spanish degree names correctly', () => {
      const spanishMappings = {
        'ninguna': 'none',
        'sin estudios': 'none',
        'primaria': 'elementary', 
        'secundaria': 'middle_school',
        'preparatoria': 'high_school',
        'técnico': 'associate',
        'licenciatura': 'bachelor',
        'maestría': 'master',
        'doctorado': 'doctorate'
      };

      Object.entries(spanishMappings).forEach(([spanish, english]) => {
        expect(normalizeDegreeLevel(spanish)).toBe(english);
      });
    });

    it('should handle case insensitive input', () => {
      const testCases = [
        'LICENCIATURA', 'Maestría', 'doctorado', 'BACHELOR', 'Master'
      ];

      testCases.forEach(testCase => {
        const result = normalizeDegreeLevel(testCase);
        expect(result).not.toBeNull();
        expect(typeof result).toBe('string');
      });
    });

    it('should handle whitespace variations', () => {
      const testCases = [
        ' bachelor ', 'high school', 'high_school', ' maestría '
      ];

      testCases.forEach(testCase => {
        const result = normalizeDegreeLevel(testCase);
        expect(result).not.toBeNull();
      });
    });

    it('should return null for invalid degree levels', () => {
      const invalidDegrees = [
        'invalid_degree', 'xyz', 'some_random_text', '', null, undefined
      ];

      invalidDegrees.forEach(invalid => {
        const result = normalizeDegreeLevel(invalid);
        expect(result).toBeNull();
      });
    });
  });

  // ============================================================================
  // VALIDATION SCHEMA TESTS
  // ============================================================================
  
  describe('Joi Validation Schema', () => {
    
    // Create mock request and response objects for middleware testing
    const createMockReq = (body) => ({ body });
    const createMockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    const createMockNext = () => jest.fn();

    it('should accept valid complete request', () => {
      const validBody = {
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
          jobTitle: 'engineer',
          jobType: 'specialty',
          hasJobOffer: true,
          occupationType: 'specialty',
          salary: 75000,
          seasonal: false
        },
        familyTies: {
          marriedToUSCitizen: false,
          proofGenuineMarriage: false
        },
        preferences: {
          hasI20: false,
          treatyCountry: true
        }
      };

      const req = createMockReq(validBody);
      const res = createMockRes();
      const next = createMockNext();

      validateVisaRequest(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject missing personalInfo', () => {
      const invalidBody = {
        employment: { jobTitle: 'engineer' }
      };

      const req = createMockReq(invalidBody);
      const res = createMockRes();
      const next = createMockNext();

      validateVisaRequest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('should validate nationality format', () => {
      const testCases = [
        { nationality: 'MX', shouldPass: true },
        { nationality: 'US', shouldPass: true }, 
        { nationality: 'MEX', shouldPass: false }, // Too long
        { nationality: 'M', shouldPass: false },   // Too short
        { nationality: 123, shouldPass: false },   // Not string
        { nationality: '', shouldPass: false }     // Empty
      ];

      testCases.forEach(testCase => {
        const body = {
          personalInfo: {
            nationality: testCase.nationality,
            age: 30,
            degreeLevel: 'bachelor'
          }
        };

        const req = createMockReq(body);
        const res = createMockRes();
        const next = createMockNext();

        validateVisaRequest(req, res, next);

        if (testCase.shouldPass) {
          expect(next).toHaveBeenCalled();
        } else {
          expect(res.status).toHaveBeenCalledWith(400);
        }

        // Reset mocks
        jest.clearAllMocks();
      });
    });

    it('should validate age ranges', () => {
      const testCases = [
        { age: 18, shouldPass: true },  // Minimum age
        { age: 35, shouldPass: true },  // Normal age
        { age: 99, shouldPass: true },  // Maximum age
        { age: 17, shouldPass: false }, // Too young
        { age: 100, shouldPass: false }, // Too old
        { age: -5, shouldPass: false },  // Negative
        { age: 'thirty', shouldPass: false } // Not number
      ];

      testCases.forEach(testCase => {
        const body = {
          personalInfo: {
            nationality: 'MX',
            age: testCase.age,
            degreeLevel: 'bachelor'
          }
        };

        const req = createMockReq(body);
        const res = createMockRes();
        const next = createMockNext();

        validateVisaRequest(req, res, next);

        if (testCase.shouldPass) {
          expect(next).toHaveBeenCalled();
        } else {
          expect(res.status).toHaveBeenCalledWith(400);
        }

        jest.clearAllMocks();
      });
    });

    it('should validate degree levels', () => {
      const validDegrees = [
        'none', 'elementary', 'middle_school', 'high_school', 
        'associate', 'bachelor', 'master', 'doctorate'
      ];

      const invalidDegrees = [
        'invalid', 'undergraduate', 'phd', 'college', ''
      ];

      // Test valid degrees
      validDegrees.forEach(degree => {
        const body = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: degree
          }
        };

        const req = createMockReq(body);
        const res = createMockRes();
        const next = createMockNext();

        validateVisaRequest(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      });

      // Test invalid degrees
      invalidDegrees.forEach(degree => {
        const body = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: degree
          }
        };

        const req = createMockReq(body);
        const res = createMockRes();
        const next = createMockNext();

        validateVisaRequest(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        jest.clearAllMocks();
      });
    });

    it('should validate jobType enum values', () => {
      const validJobTypes = ['agricultural', 'nonagricultural', 'specialty'];
      const invalidJobTypes = ['professional', 'technical', 'service', 'invalid'];

      // Test valid job types
      validJobTypes.forEach(jobType => {
        const body = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: 'bachelor'
          },
          employment: {
            jobType: jobType
          }
        };

        const req = createMockReq(body);
        const res = createMockRes();
        const next = createMockNext();

        validateVisaRequest(req, res, next);
        expect(next).toHaveBeenCalled();
        jest.clearAllMocks();
      });

      // Test invalid job types
      invalidJobTypes.forEach(jobType => {
        const body = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: 'bachelor'
          },
          employment: {
            jobType: jobType
          }
        };

        const req = createMockReq(body);
        const res = createMockRes();
        const next = createMockNext();

        validateVisaRequest(req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        jest.clearAllMocks();
      });
    });

    it('should validate percentage ranges (0-100)', () => {
      const testCases = [
        { value: 0, shouldPass: true },
        { value: 50, shouldPass: true },
        { value: 100, shouldPass: true },
        { value: -5, shouldPass: false },
        { value: 150, shouldPass: false }
      ];

      const percentageFields = ['englishProficiency', 'financialProof', 'academicRecord', 'tiesHomeCountry'];

      percentageFields.forEach(field => {
        testCases.forEach(testCase => {
          const body = {
            personalInfo: {
              nationality: 'MX',
              age: 30,
              degreeLevel: 'bachelor',
              [field]: testCase.value
            }
          };

          const req = createMockReq(body);
          const res = createMockRes();
          const next = createMockNext();

          validateVisaRequest(req, res, next);

          if (testCase.shouldPass) {
            expect(next).toHaveBeenCalled();
          } else {
            expect(res.status).toHaveBeenCalledWith(400);
          }

          jest.clearAllMocks();
        });
      });
    });

    it('should handle optional fields correctly', () => {
      // Minimal valid request with only required fields
      const minimalBody = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'bachelor'
        }
      };

      const req = createMockReq(minimalBody);
      const res = createMockRes();
      const next = createMockNext();

      validateVisaRequest(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // DEGREE NORMALIZATION INTEGRATION TESTS
  // ============================================================================
  
  describe('Degree Normalization Integration', () => {
    
    const createMockReq = (body) => ({ body });
    const createMockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    const createMockNext = () => jest.fn();

    it('should normalize Spanish degree levels before validation', () => {
      const body = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'licenciatura' // Spanish input
        }
      };

      const req = createMockReq(body);
      const res = createMockRes();
      const next = createMockNext();

      validateVisaRequest(req, res, next);

      // Should normalize to 'bachelor' and pass validation
      expect(req.body.personalInfo.degreeLevel).toBe('bachelor');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid degree levels even after normalization attempt', () => {
      const body = {
        personalInfo: {
          nationality: 'MX',
          age: 30,
          degreeLevel: 'invalid_spanish_degree'
        }
      };

      const req = createMockReq(body);
      const res = createMockRes();
      const next = createMockNext();

      validateVisaRequest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle mixed case Spanish degree inputs', () => {
      const testCases = [
        'LICENCIATURA', 'Maestría', 'doctorado', 'Preparatoria'
      ];

      testCases.forEach(degreeLevel => {
        const body = {
          personalInfo: {
            nationality: 'MX',
            age: 30,
            degreeLevel: degreeLevel
          }
        };

        const req = createMockReq(body);
        const res = createMockRes();
        const next = createMockNext();

        validateVisaRequest(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        jest.clearAllMocks();
      });
    });
  });

  // ============================================================================
  // ERROR MESSAGE QUALITY TESTS  
  // ============================================================================
  
  describe('Error Message Quality', () => {
    
    const createMockReq = (body) => ({ body });
    const createMockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn();
      return res;
    };
    const createMockNext = () => jest.fn();

    it('should provide detailed error information', () => {
      const invalidBody = {
        personalInfo: {
          nationality: 'INVALID', // Invalid nationality
          age: -5, // Invalid age  
          degreeLevel: 'invalid' // Invalid degree
        }
      };

      const req = createMockReq(invalidBody);
      const res = createMockRes();
      const next = createMockNext();

      validateVisaRequest(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();

      const errorResponse = res.json.mock.calls[0][0];
      expect(errorResponse).toHaveProperty('success', false);
      expect(errorResponse).toHaveProperty('message');
      expect(errorResponse).toHaveProperty('errors');
      expect(Array.isArray(errorResponse.errors)).toBe(true);
      expect(errorResponse.errors.length).toBeGreaterThan(0);
    });

    it('should include field information in error details', () => {
      const invalidBody = {
        personalInfo: {
          nationality: 'MX',
          age: 150, // Invalid age
          degreeLevel: 'bachelor'
        }
      };

      const req = createMockReq(invalidBody);
      const res = createMockRes();
      const next = createMockNext();

      validateVisaRequest(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const errorResponse = res.json.mock.calls[0][0];
      
      // Should have error details with field information
      expect(errorResponse.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.any(String),
            field: expect.any(String)
          })
        ])
      );
    });
  });
});