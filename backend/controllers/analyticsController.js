const Job = require('../models/Job');
const Application = require('../models/Application');



const getTrend = (current, previous) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return Math.round((current - previous) / previous * 100);
}
// @desc    Get Employer Analytics
// @route   GET /api/analytics
// @access  Private (Employer)
exports.getEmployerAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const companyId = req.user.id;

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    const prev7Days = new Date(last7Days);
    prev7Days.setDate(last7Days.getDate() - 7);
    // Find all jobs by this employer

    const totalActiveJobs = await Job.countDocuments({
      company: companyId,
      isClosed: false
    });
    const jobs = await Job.find({ company: companyId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    const totalApplications = await Application.countDocuments({
      job: { $in: jobIds }
    });

    const totalHired = await Application.countDocuments({
      job: { $in: jobIds },
      status: 'Accepted' // or 'Hired' depending on enum
    });

    const activeJobsprev7 = await Job.countDocuments({
      company: companyId,
      createdAt: { $gte: prev7Days, $lte: last7Days }
    });

    const activeJobTrend = getTrend(totalActiveJobs, activeJobsprev7);

    const applicationsLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      createdAt: { $gte: prev7Days, $lte: last7Days }
    });

    const applicationsTrend = getTrend(applicationsLast7, activeJobsprev7);

    const hiredLast7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: 'Accepted',
      createdAt: { $gte: prev7Days, $lte: last7Days }
    });
    const hiredPrev7 = await Application.countDocuments({
      job: { $in: jobIds },
      status: 'Accepted',
      createdAt: { $gte: prev7Days, $lte: last7Days }
    });

    const hiredTrend = getTrend(totalHired, hiredLast7);

    const recentJobs = await Job.find({ company: companyId }).sort({ createdAt: -1 }).limit(5).select('title createdAt');

    const recentApplications = await Application.find({ job: { $in: jobIds } }).sort({ createdAt: -1 }).limit(5).populate('applicant', 'name email avatar').populate('job', 'title');
    res.status(200).json({
      totalActiveJobs,
      totalApplications,
      totalHired,
      trends: {
        activeJobs: activeJobTrend,
        totalApplicants: applicationsTrend,
        totalHired: hiredTrend
      },
      data: {
        recentJobs,
        recentApplications
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
