const express = require('express');
const router = express.Router();
const { applyForJob, getMyApplications, getApplicationsForJob, getApplicationById, updateStatus } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, applyForJob);
router.get('/my-applications', protect, getMyApplications);
router.get('/job/:jobId', protect, getApplicationsForJob);
router.get("/:id", protect, getApplicationById)
router.put("/:id/status", protect, updateStatus)
module.exports = router;
