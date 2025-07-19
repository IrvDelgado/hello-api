
# 🇲🇽 Visa Eligibility Calculator API

A production-ready RESTful API for rapid U.S. visa eligibility scoring, focused on Latin America. Fully stateless, fast, and designed for Spanish-speaking users and partners in Mexico and across the region.

## 🌎 Overview

This API provides instant eligibility scoring for all major U.S. visa types—including TN, H-1B, H-2, F-1 Student, family, investment, and humanitarian categories.
It leverages a transparent, algorithmic, weighted heuristic model over the latest documented requirements.

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/visa-calculator-api.git
cd visa-calculator-api
npm install
```

To run the server:

```bash
npm start
# or with hot reload
npm run dev
```


## 📖 Endpoints

| Method | Endpoint | Description |
| :-- | :-- | :-- |
| POST | `/api/v1/visa/eligibility` | Main scoring endpoint |
| GET | `/api/v1/visa/types` | List all supported visa types |
| GET | `/api/v1/health` | Healthcheck/status |

_All endpoints accept and respond with JSON._

### 🎯 `POST /api/v1/visa/eligibility`

Compute eligibility/readiness score for all major U.S. visa types relevant to Latin Americans in a single API call.

**Request body example:**

```json
{
  "personalInfo": {
    "nationality": "MX",
    "age": 28,
    "educationLevel": "bachelor"
  },
  "employment": {
    "hasJobOffer": true,
    "jobTitle": "engineer",
    "yearsExperience": 5
  },
  "familyTies": {
    "hasUsCitizens": false,
    "hasGreenCardHolders": false
  },
  "preferences": {
    "language": "es",
    "visaTypes": ["TN", "H1B", "F1"]
  }
}
```

**Response example:**

```json
{
  "success": true,
  "message": "Cálculo de elegibilidad exitoso",
  "data": {
    "overallScore": 92,
    "eligibleVisas": [
      {
        "type": "TN",
        "name": "Visa TN (Profesional USMCA/NAFTA)",
        "score": 95,
        "category": "Muy preparado",
        "requirements": [
          { "key": "nationality", "achieved": 100, "weight": 0.3 },
          { "key": "profession", "achieved": 100, "weight": 0.22 },
          { "key": "degreeLevel", "achieved": 100, "weight": 0.18 },
          { "key": "hasJobOffer", "achieved": 100, "weight": 0.2 },
          { "key": "englishProficiency", "achieved": 70, "weight": 0.1 }
        ],
        "nextSteps": [
          "Contacta un empleador en EE.UU.",
          "Prepara tus documentos académicos",
          "Cita y documentación consular"
        ]
      }
    ]
  }
}
```


## 🔎 How Does the Algorithm Work?

- **Weighted Heuristics**: Each visa type defines a set of criteria (ex: nationality, education, job offer, language, etc), each with a different weight for scoring.
- **Eligibility Check**: Criteria may require exact values (e.g. `nationality: MX`), minimums (`salary >= $40,000`), set membership (profession is NAFTA), or true/false.
- **Category Selection**: The API simulates actual U.S. government logic, notifies if core (“required:true”) requirements fail, and returns a transparent score breakdown per visa type.
- **Localization**: Results and relevant guidance are automatically delivered in Spanish, unless overridden by `preferences.language: 'en'`.
- **No PII Retained by Default**: Critical for compliance and user trust; designed to be extended for analytics/data collection if enabled.


## 🏆 Supported Visa Types

- **Work:** TN, H-1B, H-2A, H-2B, E-2, L-1, O-1, P-1
- **Study:** F-1, J-1
- **Family:** IR1, K-1, F1, F2A, F2B, F3, F4
- **Investment:** EB-5, E-2
- **Visitor:** B-1/B-2
- **Protection/Special:** TPS, humanitarian (U/T visas), R-1 (religious), etc.

See [`src/models/visaTypes.js`](src/models/visaTypes.js) for complete detail.

## 📑 Example: TN Professional (Mexico)

**Required Inputs:**

- Nationality: `"MX"`
- Profession: Any NAFTA/USMCA-listed profession
- Degree: At least bachelor
- Job offer: Must have one
- English: Preferred at B1 (intermediate) or higher

**Calculation:**
If all criteria met, score of 95-100, category: *Muy preparado*;
If job offer missing, score falls to ~70.

## 📄 Parameters Reference

| Parameter | Description | Example |
| :-- | :-- | :-- |
| nationality | ISO country code (e.g. "MX" for Mexico) | "MX" |
| age | User’s age | 25 |
| degreeLevel | "high_school", "associate", "bachelor", "master", "doctorate" | "bachelor" |
| jobTitle | For work visas, normalized profession name | "civil engineer" |
| hasJobOffer | Does user have a valid U.S. job offer? (boolean) | true |
| financialProof | Score 0-100 (sufficient funds for study/visit/etc) | 70 |
| academicRecord | Score 0-100 (academic performance/credentials) | 80 |
| englishProficiency | Score or level (0-100) | 85 |
| tiesHomeCountry | Score (0-100, intent to return) | 60 |
| maritalStatus | "single", "married", "divorced", etc. | "single" |
| familyTies | U.S. citizen/resident relatives info |  |

## 🌐 Localization / i18n

- Errors, guidance, and categories are Spanish-first (default).
- Add `?lang=en` query or `preferences.language: "en"` in your request for English responses.
- Add/extend translations in `/src/locales/en.json` and `/src/locales/es.json`.


## ❗ Error Handling

- `400 Bad Request` for validation/format errors
- `500 Internal Server Error` for server issues
- Error object always returns:

```json
{ "success": false, "message": "Solicitud inválida.", "errors": [ ... ] }
```


## ⚡ Security \& Performance

- Rate-limited: 100 requests per 15 min/IP (configurable)
- CORS enabled for easy integration
- No user tracking or storage by default


## 🛠️ Extending

- Add new visas: new object in `src/models/visaTypes.js`
- Update business logic: `src/models/scoringCriteria.js`
- Add tracking/analytics as needed


## 🧩 Example Project Structure

```
src/
├── controllers/
│   └── visaController.js
├── middleware/
│   ├── errorHandler.js
│   ├── i18n.js
│   └── rateLimiter.js
├── models/
│   ├── visaTypes.js
│   └── scoringCriteria.js
├── routes/
│   ├── index.js
│   └── visaRoutes.js
├── services/
│   └── scoringService.js
├── utils/
│   └── responseFormatter.js
├── locales/
│   ├── en.json
│   └── es.json
app.js
```


## 🤝 Contributing

1. Fork \& PRs welcome for new visas, countries, or features.
2. Logic lives in `src/services/scoringService.js` and models.
3. Please practice clean JS/ESLint conventions.

## 📄 License

MIT License.

**Agradecimientos:**
¡Gracias por contribuir a un sistema migratorio más claro y accesible!
Para sugerencias o soporte, abre un Issue o Pull Request.

*(For technical discussion or roadmap, see the project wiki or open a GitHub Discussion.)*

