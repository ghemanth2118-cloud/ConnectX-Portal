import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  MapPin,
  PlusCircle,
  CalendarPlus,
  LayoutDashboard
} from "lucide-react";
import moment from "moment";
import { Link } from 'react-router-dom';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    jobs: [],
    recentApplicants: []
  });
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplicants: 0,
    hired: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Backend returns jobs along with their nested applications
      const response = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);

      if (response.status === 200) {
        const jobs = response.data;

        let activeJobsCount = 0;
        let totalAppsCount = 0;
        let hiredCount = 0;
        let allApps = [];

        jobs.forEach(job => {
          if (!job.isClosed) activeJobsCount++;
          if (job.applications) {
            totalAppsCount += job.applications.length;
            job.applications.forEach(app => {
              if (app.status === 'hired') hiredCount++;
              allApps.push({ ...app, jobTitle: job.title });
            });
          }
        });

        // Sort applications by creation date descending
        allApps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setStats({
          activeJobs: activeJobsCount,
          totalApplicants: totalAppsCount,
          hired: user?.hiredCount || hiredCount || 0,
          followers: user?.employeeCount || user?.followers?.length || 0,
        });

        setDashboardData({
          jobs: jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          recentApplicants: allApps.slice(0, 5) // Show top 5 recent
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="employer-dashboard">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="employer-dashboard">
      <div className="pb-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your jobs today.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Active Jobs Card */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-blue-100 font-medium mb-1">Active Jobs</p>
                <h3 className="text-4xl font-bold">{stats.activeJobs}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Total Applicants Card */}
          <div className="bg-emerald-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-emerald-100 font-medium mb-1">Total Applicants</p>
                <h3 className="text-4xl font-bold">{stats.totalApplicants}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Hired Card */}
          <div className="bg-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-purple-100 font-medium mb-1">Hired</p>
                <h3 className="text-4xl font-bold">{stats.hired}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Followers Card */}
          <div className="bg-amber-500 rounded-2xl p-6 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-amber-100 font-medium mb-1">Followers</p>
                <h3 className="text-4xl font-bold">{stats.followers}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/post-job" className="bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-2xl p-5 flex items-center gap-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <PlusCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">Post a New Job</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create a new job listing</p>
              </div>
            </Link>

            <Link to="/manage-jobs" className="bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 rounded-2xl p-5 flex items-center gap-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Manage Jobs</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">View and edit your listings</p>
              </div>
            </Link>

            <Link to="/events" className="bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-slate-200 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-800 rounded-2xl p-5 flex items-center gap-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:bg-purple-600 dark:group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <CalendarPlus size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">Create Event</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Host a new platform event</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Job Posts</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your latest job postings</p>
              </div>
              <Link to="/manage-jobs" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.jobs.length > 0 ? (
                dashboardData.jobs.slice(0, 3).map(job => (
                  <Link to={`/applicants?jobId=${job._id}`} key={job._id} className="block w-full">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          <Briefcase size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{job.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                            <span>•</span>
                            <span>{moment(job.createdAt).format('MMM Do YYYY')}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${job.isClosed ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'}`}>
                        {job.isClosed ? 'Closed' : 'Active'}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No jobs posted yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Applications</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Latest candidate applications</p>
              </div>
              <Link to="/manage-jobs" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                View all
              </Link>
            </div>

            <div className="space-y-4">
              {dashboardData.recentApplicants.length > 0 ? (
                dashboardData.recentApplicants.map((app, index) => (
                  <Link to={`/applicants?jobId=${app.job}`} key={index} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      {app.applicant?.profileImage ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                          <img src={app.applicant.profileImage} alt={app.applicant.fullName || 'Candidate'} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 font-bold flex items-center justify-center shrink-0 uppercase">
                          {app.applicant?.fullName?.charAt(0) || 'C'}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{app.applicant?.fullName || 'Candidate'}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{app.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                      <Clock size={12} />
                      <span>{moment(app.createdAt).fromNow()}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No applications received yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EmployerDashboard