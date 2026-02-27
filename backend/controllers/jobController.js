const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');
const { isObjectIdOrHexString } = require('mongoose');

exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can post jobs.' });
    }

    // Explicitly destructure to include capacity and deadline
    const { title, description, requirements, location, category, type, salaryMin, salaryMax, capacity, deadline } = req.body;

    const job = await Job.create({
      title, description, requirements, location, category, type, salaryMin, salaryMax,
      capacity: capacity || 0,
      deadline: deadline || null,
      company: req.user.id
    });

    // Notify all followers
    try {
      const employer = await User.findById(req.user.id);
      if (employer && employer.followers && employer.followers.length > 0) {
        const Notification = require('../models/Notification');
        const notificationsToCreate = employer.followers.map(followerId => ({
          recipient: followerId,
          sender: employer._id,
          type: 'job_posted',
          message: `${employer.companyName || employer.fullName} has posted a new job: ${job.title}`,
        }));
        await Notification.insertMany(notificationsToCreate);
      }
    } catch (notifErr) {
      console.error("Failed to send job creation notifications:", notifErr);
    }

    // Hook: Generate a dummy application automatically to simulate portal activity
    try {
      // Find any job seeker to be the dummy applicant
      const dummySeeker = await User.findOne({ role: { $in: ['jobSeeker', 'jobseeker'] } });
      if (dummySeeker) {
        await Application.create({
          job: job._id,
          applicant: dummySeeker._id,
          resume: dummySeeker.resume || "dummy_resume_link.pdf",
          status: "Applied"
        });

        // Ensure the job's application array is updated if it exists
        if (job.applications) {
          job.applications.push(dummySeeker._id);
          await job.save();
        }

        // Decrement capacity since we added a dummy applicant
        if (job.capacity !== undefined && job.capacity > 0) {
          job.capacity -= 1;
          await job.save();
        }
      }
    } catch (dummyErr) {
      console.error("Error creating dummy application, proceeding anyway:", dummyErr);
    }

    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getJobs = async (req, res) => {
  const {
    keyword,
    location,
    category,
    type,
    minSalary,
    maxSalary,
    userId,
  } = req.query;
  const query = {
    isClosed: false,
    ...(keyword && { title: { $regex: keyword, $options: 'i' } }),
    ...(location && { location: { $regex: location, $options: 'i' } }),
    ...(category && { category }),
    ...(type && { type }),
  };
  if (minSalary || maxSalary) {
    query.$and = [];
    if (minSalary) {
      query.$and.push({ salaryMax: { $gte: minSalary } });
    }
    if (maxSalary) {
      query.$and.push({ salaryMin: { $lte: maxSalary } });
    }
    if (query.$and.length === 0) {
      delete query.$and;
    }
  }
  try {
    const jobs = await Job.find(query).populate('company', 'companyName companyLogo');
    let savedJobIds = [];
    if (userId) {
      savedJobIds = await SavedJob.find({ user: userId }).map(job => job.job.toString());
    }
    const applications = await Application.find({ applicant: userId }).select('job status');
    const appliedJobStatusMap = new Map();
    applications.forEach(application => {
      appliedJobStatusMap.set(application.job.toString(), application.status);
    });

    const jobWithExtras = jobs.map(job => {
      const jobIdStr = job._id.toString();
      return {
        ...job._doc,
        isSaved: savedJobIds.includes(jobIdStr),
        applicationStatus: appliedJobStatusMap.get(jobIdStr) || null,
      }
    })
    res.status(200).json(jobWithExtras);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getJobsEmployer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { role } = req.user;
    if (role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can post jobs.' });
    }
    const jobs = await Job.find({ company: userId })
      .populate('company', 'companyName companyLogo')
      .lean();
    const jobsWithApplications = await Promise.all(
      jobs.map(async job => {
        const applications = await Application.find({ job: job._id }).populate('applicant', 'fullName profileImage email');
        return {
          ...job,
          applications,
        };
      })
    );
    res.json(jobsWithApplications);
    // res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Assuming userId is passed in query for checking application status
    const job = await Job.findById(id).populate('company', 'companyName companyLogo');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    let applicationStatus = null;
    if (userId) {
      const application = await Application.findOne({ job: id, applicant: userId }).select('status');
      if (application) {
        applicationStatus = application.status;
      }
    }
    res.json({ ...job.toObject(), applicationStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
// exports.getJobById = async (req, res) => {
//   try {
//     const job = await Job.findById(req.params.id).populate('company', 'fullName email profileImage');
//     if (!job) {
//       return res.status(404).json({ message: 'Job not found' });
//     }
//     res.status(200).json(job);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // @desc    Create a job
// // @route   POST /api/jobs
// // @access  Private (Employer)
// exports.createJob = async (req, res) => {
//   try {
//     if (req.user.role !== 'employer') {
//       return res.status(403).json({ message: 'Access denied. Only employers can post jobs.' });
//     }

//     const { title, description, requirements, location, category, type, salaryMin, salaryMax } = req.body;

//     const job = await Job.create({
//       title,
//       description,
//       requirements,
//       location,
//       category,
//       type,
//       salaryMin,
//       salaryMax,
//       company: req.user.id
//     });

//     res.status(201).json(job);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };

// // @desc    Update a job
// // @route   PUT /api/jobs/:id
// // @access  Private (Employer)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.company.toString() !== req.user._id) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }
    Object.assign(job, req.body);
    const updated = await job.save();
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// // @desc    Delete a job
// // @route   DELETE /api/jobs/:id
// // @access  Private (Employer)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }
    await job.deleteOne();
    res.status(200).json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.toggleCloseJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.company.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized to close this job' });
    }
    job.isClosed = !job.isClosed;
    await job.save();
    res.status(200).json({ message: 'Job closed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};