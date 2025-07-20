const express = require('express');
const { healthStatus } = require('../controllers/healthController');

const router = express.Router();

router.get('/', healthStatus);

module.exports = router;