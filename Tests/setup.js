/**
 * Jest Test Setup
 * Common configuration and utilities for all tests
 */

// Global test timeout
jest.setTimeout(10000);

// Mock console methods for cleaner test output
const originalConsole = { ...console };

beforeEach(() => {
  // Suppress console.log during tests unless explicitly testing it
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console methods after each test
  console.log.mockRestore?.();
  console.warn.mockRestore?.();
  console.info.mockRestore?.();
});

// Global test utilities
global.createMockReq = (body, params = {}, query = {}) => ({
  body,
  params,
  query,
  t: jest.fn((key) => key) // Mock i18n translation function
});

global.createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

global.createMockNext = () => jest.fn();

// Custom matchers
expect.extend({
  toBeValidVisaScore(received) {
    const pass = typeof received === 'number' && received >= 0 && received <= 100;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid visa score`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid visa score (0-100)`,
        pass: false,
      };
    }
  },

  toBeValidVisaType(received) {
    const validTypes = [
      'TN', 'H1B', 'H2A', 'H2B', 'F1', 'J1', 'B1B2', 
      'IR1', 'F1', 'F2A', 'F2B', 'K1', 'E2', 'EB5', 
      'O1', 'L1', 'TPS', 'U', 'P', 'R1'
    ];
    
    const pass = validTypes.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid visa type`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid visa type`,
        pass: false,
      };
    }
  },

  toHaveValidApiResponse(received) {
    const hasRequiredProps = received.hasOwnProperty('success') && 
                           received.hasOwnProperty('data');
    const hasValidSuccess = typeof received.success === 'boolean';
    
    const pass = hasRequiredProps && hasValidSuccess;
    if (pass) {
      return {
        message: () => `expected response not to have valid API structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected response to have valid API structure with 'success' and 'data' properties`,
        pass: false,
      };
    }
  }
});

// Test data factories
global.createTestUserData = (overrides = {}) => ({
  personalInfo: {
    nationality: 'MX',
    age: 30,
    degreeLevel: 'bachelor',
    englishProficiency: 70,
    financialProof: 60,
    academicRecord: 75,
    tiesHomeCountry: 50,
    ...overrides.personalInfo
  },
  employment: {
    jobTitle: 'engineer',
    jobType: 'specialty',
    hasJobOffer: true,
    salary: 50000,
    ...overrides.employment
  },
  familyTies: {
    marriedToUSCitizen: false,
    proofGenuineMarriage: false,
    ...overrides.familyTies
  },
  preferences: {
    purposeValid: true,
    treatyCountry: true,
    ...overrides.preferences
  }
});

console.log('🧪 Test environment initialized with enhanced utilities');