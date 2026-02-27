const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  deleteJob,
  updateJob,
  toggleCloseJob,
  getJobsEmployer
} = require('../controllers/jobController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createJob)
  .get(getJobs);

router.get('/employer', protect, getJobsEmployer);

router.route('/:id')
  .get(getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

router.put('/:id/toggle-close', protect, toggleCloseJob);

module.exports = router;
