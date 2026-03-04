import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Search,
  Building2,
  Bookmark,
  Filter
} from "lucide-react";

const CATEGORIES = ["All Jobs", "Software / Tech", "Electronics (ECE)", "Mechanical (MECH)", "Civil", "Management", "Design", "Marketing", "Data Science"];
import moment from "moment";
import { Link } from 'react-router-dom';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

const JobseekerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    recentApplications: [],
    savedJobs: [],
  });
  const [stats, setStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    followingCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Jobs");
  const [allJobsList, setAllJobsList] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch applications
      const appsRes = await axiosInstance.get(API_PATHS.APPLICATIONS.GET_MY_APPLICATIONS);
      const applications = appsRes.data || [];

      // Fetch saved jobs
      const savedRes = await axiosInstance.get(API_PATHS.SAVED_JOBS.GET_SAVED_JOBS);
      const savedJobs = savedRes.data || [];

      // Fetch user profile to get following count
      const profileRes = await axiosInstance.get(API_PATHS.USER.GET_PROFILE(user._id));
      const followingCount = profileRes.data?.following?.length || 0;

      // Fetch top jobs and extract companies
      const jobsRes = await axiosInstance.get(API_PATHS.JOBS.GET_ALL_JOBS);
      const allJobs = jobsRes.data?.jobs || jobsRes.data || [];
      setAllJobsList(allJobs);

      const topJobs = [...allJobs]
        .filter(j => !j.isClosed && j.capacity > 0)
        .sort((a, b) => b.capacity - a.capacity)
        .slice(0, 4);

      const uniqueCompanies = [];
      const companyIds = new Set();
      allJobs.forEach(j => {
        if (j.company && !companyIds.has(j.company._id)) {
          companyIds.add(j.company._id);
          uniqueCompanies.push(j.company);
        }
      });
      const topCompanies = uniqueCompanies.slice(0, 4);

      setStats({
        appliedJobs: applications.length,
        savedJobs: savedJobs.length,
        followingCount: followingCount
      });

      setDashboardData({
        recentApplications: applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
        savedJobs: savedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
        topJobs,
        topCompanies
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const filteredJobs = allJobsList.filter(job => {
    if (activeCategory === "All Jobs") return true;
    if (job.category && job.category === activeCategory) return true;

    const title = (job.title || "").toLowerCase();

    if (activeCategory === "Software / Tech") return title.includes("software") || title.includes("tech") || title.includes("developer") || title.includes("cse") || title.includes("it") || title.includes("data") || title.includes("web");
    if (activeCategory === "Electronics (ECE)") return title.includes("ece") || title.includes("electronics") || title.includes("hardware") || title.includes("circuit") || title.includes("embedded");
    if (activeCategory === "Mechanical (MECH)") return title.includes("mech") || title.includes("mechanical") || title.includes("automobile") || title.includes("design engineer");
    if (activeCategory === "Civil") return title.includes("civil") || title.includes("construction") || title.includes("site") || title.includes("architect");
    if (activeCategory === "Management") return title.includes("manager") || title.includes("product") || title.includes("business") || title.includes("hr") || title.includes("management");
    if (activeCategory === "Design") return title.includes("design") || title.includes("ui") || title.includes("ux") || title.includes("graphic");
    if (activeCategory === "Marketing") return title.includes("marketing") || title.includes("seo") || title.includes("sales") || title.includes("content");
    if (activeCategory === "Data Science") return title.includes("data") || title.includes("science") || title.includes("analytics") || title.includes("machine learning");

    return false;
  });

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="dashboard">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="dashboard">
      <div className="pb-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(" ")[0] || user?.fullName?.split(" ")[0] || "Job Seeker"}!
            </h1>
            <p className="text-slate-500 mt-1">Here is a quick overview of your job search progress.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Applied Jobs Card */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-blue-100 font-medium mb-1">Applied Jobs</p>
                <h3 className="text-4xl font-bold">{stats.appliedJobs}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100 mt-4 relative z-10">
              <span className="flex items-center gap-1 font-bold"><TrendingUp size={14} /> Tracking applications</span>
            </div>
          </div>

          {/* Saved Jobs Card */}
          <div className="bg-emerald-500 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-emerald-100 font-medium mb-1">Saved Jobs</p>
                <h3 className="text-4xl font-bold">{stats.savedJobs}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-100 mt-4 relative z-10">
              <span className="flex items-center gap-1 font-bold">Saved for later</span>
            </div>
          </div>

          {/* Following Companies Card */}
          <div className="bg-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-purple-100 font-medium mb-1">Following</p>
                <h3 className="text-4xl font-bold">{stats.followingCount}</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-100 mt-4 relative z-10">
              <span className="flex items-center gap-1 font-bold">Companies & Recruiters</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/search" className="bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-2xl p-5 flex items-center gap-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Search size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Find a Job</h4>
                <p className="text-sm text-slate-500">Search for new opportunities</p>
              </div>
            </Link>

            <Link to="/saved-jobs" className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-2xl p-5 flex items-center gap-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Bookmark size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">View Saved Jobs</h4>
                <p className="text-sm text-slate-500">Review jobs you've saved</p>
              </div>
            </Link>

            <Link to="/profile" className="bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-2xl p-5 flex items-center gap-4 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">Update Profile</h4>
                <p className="text-sm text-slate-500">Improve your visibility</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Lists Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Applications List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Applications</h3>
                <p className="text-sm text-slate-500">Your latest job applications</p>
              </div>
            </div>

            <div className="space-y-4">
              {dashboardData.recentApplications.length > 0 ? (
                dashboardData.recentApplications.map(app => (
                  <div key={app._id} className="flex flex-col gap-2 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900">{app.job?.title || "Job Title"}</h4>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${app.status === 'Applied' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        app.status === 'Interview' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                          app.status === 'Offered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            app.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5"><Building2 size={12} /> {app.job?.company?.companyName || "Company"}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm py-4 text-center">No applications found.</p>
              )}
            </div>
          </div>

          {/* Top Jobs List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Briefcase className="text-indigo-600" size={20} /> Top Available Jobs</h3>
                <p className="text-sm text-slate-500">Jobs with the most seats remaining</p>
              </div>
              <Link to="/search" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View all</Link>
            </div>

            <div className="space-y-4">
              {dashboardData.topJobs?.length > 0 ? (
                dashboardData.topJobs.map(job => (
                  <Link to={`/job/${job._id}`} key={job._id} className="block p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><Building2 size={12} /> {job.company?.companyName || 'Company'}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 tracking-wide inline-block whitespace-nowrap">
                          {job.capacity} Seats Left
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">No open jobs available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Companies */}
        <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building2 className="text-purple-600" size={20} /> Featured Recruiters</h3>
            <p className="text-sm text-slate-500">Discover top companies actively hiring</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {dashboardData.topCompanies?.length > 0 ? (
              dashboardData.topCompanies.map(comp => (
                <Link to={`/company/${comp._id}`} key={comp._id} className="block p-5 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all text-center group">
                  <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100 overflow-hidden">
                    {comp.companyLogo ? (
                      <img src={comp.companyLogo} alt={comp.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="text-slate-400" size={24} />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">{comp.companyName}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center justify-center gap-1"><MapPin size={10} /> {comp.location || 'Global'}</p>
                </Link>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center col-span-full">No featured companies right now.</p>
            )}
          </div>
        </div>

        {/* All Jobs with Categories Section */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Briefcase className="text-indigo-600" size={24} /> Explore All Jobs</h3>
              <p className="text-sm text-slate-500 mt-1">Browse and filter jobs by category</p>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2 text-slate-500 font-medium border-r border-slate-200 mr-2 shrink-0">
              <Filter size={18} />
              <span>Filter:</span>
            </div>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.slice(0, 12).map(job => (
                <Link to={`/job/${job._id}`} key={job._id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Briefcase size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{job.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 line-clamp-1"><Building2 size={14} className="shrink-0" /> {job.company?.companyName || 'Company'}</p>
                    </div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-slate-500 shrink-0 truncate w-2/3"><MapPin size={14} className="shrink-0" /> {job.location}</span>
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg shrink-0">View</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">No Jobs Found</h3>
                <p className="text-slate-500 text-sm">No jobs matching this category right now.</p>
              </div>
            )}
          </div>
          {filteredJobs.length > 12 && (
            <div className="text-center mt-8">
              <Link to="/search" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 font-bold rounded-xl transition-all hover:bg-indigo-50">
                View All {filteredJobs.length} Jobs
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default JobseekerDashboard