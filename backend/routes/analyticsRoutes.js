const express = require('express');
const router = express.Router();
const { getEmployerAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, getEmployerAnalytics);

module.exports = router;
