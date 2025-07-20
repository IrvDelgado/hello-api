const request = require('supertest');
const app = require('../app'); // Asegúrate que exportas el app en app.js

describe('POST /api/v1/visa/eligibility', () => {
  
  it('should respond with eligibility results for valid input', async () => {
    const response = await request(app)
      .post('/api/v1/visa/eligibility')
      .send({
        personalInfo: {
          nationality: 'MX',
          age: 28,
          degreeLevel: 'bachelor',
          englishProficiency: 80
        }
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('overallScore');
  });

  it('should respond with 400 for empty body', async () => {
    const response = await request(app)
      .post('/api/v1/visa/eligibility')
      .send({});
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should respond with 400 if personalInfo is missing', async () => {
    const response = await request(app)
      .post('/api/v1/visa/eligibility')
      .send({
        employment: { hasJobOffer: true }
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should respond with 400 if nationality is invalid length', async () => {
    const response = await request(app)
      .post('/api/v1/visa/eligibility')
      .send({
        personalInfo: {
          nationality: 'MEX', // invalid length, should be 2 chars
          age: 28,
          degreeLevel: 'bachelor'
        }
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });


  it('should respond with 400 if degreeLevel is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/visa/eligibility')
      .send({
        personalInfo: {
          nationality: 'MX',
          age: 28,
          degreeLevel: 'elementary' // invalid enum value
        }
      });
    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // --- Lógica de negocio ---
it('should return high score for perfect matching data', async () => {
const perfectData = {
  personalInfo: {
    nationality: 'MX',
    age: 30,
    degreeLevel: 'bachelor',
    englishProficiency: 100,
    financialProof: 100,
    academicRecord: 100,
    tiesHomeCountry: 100,
    priorUSExperience: true,
    financialSupport: 200,
    visitDuration: 90,
    returnTicket: true,
    previousVisaRecord: true
  },
  employment: {
    jobTitle: 'engineer',  // <-- debe estar aquí para que el scoring funcione
    jobType: 'specialty',
    hasJobOffer: true,
    occupationType: 'specialty',
    salary: 60000,
    seasonal: false
  }
};


  const response = await request(app)
    .post('/api/v1/visa/eligibility')
    .send(perfectData);

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.data.overallScore).toBeGreaterThanOrEqual(90);
  expect(response.body.data.eligibleVisas.length).toBeGreaterThan(0);
});


it('should return low score for minimal matching data', async () => {
    const lowData =  {
    personalInfo: {
        nationality: 'BR',  // Brasil, no NAFTA y no EE.UU.
        age: 20,
        degreeLevel: 'high_school',
        englishProficiency: 10,
        financialProof: 0,
        academicRecord: 0,
        tiesHomeCountry: 0
    },
    employment: {
        jobTitle: 'cashier',  // No está en la lista NAFTA
        hasJobOffer: false
    }
    };

    const response = await request(app)
      .post('/api/v1/visa/eligibility')
      .send(lowData);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.overallScore).toBeLessThan(30);
    expect(response.body.data.eligibleVisas.length).toBe(0);
  });

  it('should return medium score for partially matching data', async () => {
    const mediumData = {
    personalInfo: {
        nationality: 'MX',
        age: 28,
        degreeLevel: 'associate',
        englishProficiency: 50,
        financialProof: 50,
        academicRecord: 40,
        tiesHomeCountry: 30
    },
    employment: {
        jobTitle: 'technician', // posiblemente en NAFTA_LIST o similar
        hasJobOffer: false
    }
    };

    const response = await request(app)
      .post('/api/v1/visa/eligibility')
      .send(mediumData);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.overallScore).toBeGreaterThanOrEqual(30);
    expect(response.body.data.overallScore).toBeLessThan(70);
  });


  // --- Rutas adicionales ---
  it('GET /api/v1/health should return status ok', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
  });

});
