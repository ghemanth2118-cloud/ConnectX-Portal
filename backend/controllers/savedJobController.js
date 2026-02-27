const SavedJob = require('../models/SavedJob');

// @desc    Save a job
// @route   POST /api/saved-jobs
// @access  Private
exports.saveJob = async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const exists = await SavedJob.findOne({ jobseeker: req.user._id, job: jobId });
    if (exists) return res.status(404).json({ message: 'Job already saved' });
    const saved = await SavedJob.create({
      jobseeker: req.user.id,
      job: jobId
    });

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get saved jobs
// @route   GET /api/saved-jobs
// @access  Private
exports.unsaveJob = async (req, res) => {
  try {
    const savedJob = await SavedJob.findOneAndDelete({ jobseeker: req.user.id, job: req.params.jobId });
    res.status(200).json(savedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove saved job
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private
exports.getMySavedJobs = async (req, res) => {
  try {
    const savedjobs = await SavedJob.find({ jobseeker: req.user.id }).populate({
      path: 'job',
      populate: {
        path: 'company',
        select: 'name companyName companyLogo'
      }
    });
    res.status(200).json(savedjobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
