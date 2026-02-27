const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job Seeker)
exports.applyForJob = async (req, res) => {
  try {
    if (req.user.role !== "jobSeeker" && req.user.role !== "jobseeker") {
      return res.status(403).json({ message: "Not authorized to apply for a job" });
    }
    const existing = await Application.findOne({ job: req.body.jobId, applicant: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const jobToApply = await Job.findById(req.body.jobId);
    if (!jobToApply) return res.status(404).json({ message: "Job not found" });

    // Validate deadline
    if (jobToApply.deadline && new Date() > new Date(jobToApply.deadline)) {
      return res.status(400).json({ message: "The deadline for this job has passed." });
    }

    // Validate capacity
    if (jobToApply.capacity !== undefined && jobToApply.capacity <= 0) {
      return res.status(400).json({ message: "This job has reached its maximum capacity." });
    }

    // Create the application
    const application = await Application.create({
      job: req.body.jobId,
      applicant: req.user.id,
      resume: req.body.resume,
    });

    // Decrement capacity
    if (jobToApply.capacity !== undefined && jobToApply.capacity > 0) {
      jobToApply.capacity -= 1;
      await jobToApply.save();
    }

    // Notify the employer
    await Notification.create({
      recipient: jobToApply.company,
      sender: req.user.id,
      type: "application",
      message: `Someone applied to your job posting: ${jobToApply.title}`
    });

    res.status(201).json(application);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user applications
// @route   GET /api/applications/my-applications
// @access  Private
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user.id })
      .populate('job', 'title company location type')
      .sort({ createdAt: -1 });
    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applications for a job (Employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer)
exports.getApplicationsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job || job.company.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'fullName name email avatar resume');

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate('job', "title").populate('applicant', "fullName name email avatar resume");
    if (!app) return res.status(404).json({ message: 'Application not found', id: req.params.id, });
    const isOwner = app.applicant._id.toString() === req.user._id.toString() ||
      app.job.company.toString() === req.user._id.toString();
    if (!isOwner) return res.status(403).json({ message: 'Not authorized to view this application' });

    res.status(200).json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Employer)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const app = await Application.findById(req.params.id).populate('job');

    if (!app || app.job.company.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Application not found' });
    }

    app.status = status;
    await app.save();

    // Notify the job seeker
    await Notification.create({
      recipient: app.applicant,
      sender: req.user._id,
      type: "application",
      message: `Your application for ${app.job.title} has been marked as ${status}`
    });

    res.status(200).json(app);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
