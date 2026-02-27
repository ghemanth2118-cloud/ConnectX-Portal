import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Search, ChevronUp, Users, Edit, XOctagon, Trash2, CheckCircle } from 'lucide-react';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ManageJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);
      if (res.data) {
        setJobs(res.data);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching employer jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All Status"
      ? true
      : statusFilter === "Active" ? !job.isClosed : job.isClosed;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(API_PATHS.JOBS.DELETE_JOB(jobId));
      setJobs(jobs.filter(j => j._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Failed to delete job");
    }
  };

  const handleToggleClose = async (jobId, currentStatus) => {
    try {
      await axiosInstance.put(API_PATHS.JOBS.TOGGLE_CLOSE(jobId));
      setJobs(jobs.map(j => j._id === jobId ? { ...j, isClosed: !currentStatus } : j));
      toast.success(`Job marked as ${currentStatus ? 'Active' : 'Closed'}`);
    } catch (error) {
      console.error("Error toggling job status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-6xl mx-auto pb-10">

        {/* Header */}
        <div className="mb-8 pl-1">
          <h1 className="text-3xl font-bold text-slate-900">Job Management</h1>
          <p className="text-slate-500 mt-1">Manage your job postings and track applications</p>
        </div>

        {/* Control Bar */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-6 sm:p-8 relative overflow-hidden">

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* Dropdown */}
            <div className="w-full sm:w-48 relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none transition-all appearance-none text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronUp size={16} className="text-slate-400 rotate-180" />
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 font-medium mb-4">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>

          {/* Table Area */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-slate-50">
                  <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider rounded-l-2xl">
                    <span className="flex items-center gap-1">JOB TITLE <ChevronUp size={14} className="text-indigo-400" /></span>
                  </th>
                  <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">STATUS <ChevronUp size={14} className="text-slate-300" /></span>
                  </th>
                  <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">APPLICANTS <ChevronUp size={14} className="text-slate-300" /></span>
                  </th>
                  <th className="py-4 px-6 text-[13px] font-bold text-slate-500 uppercase tracking-wider rounded-r-2xl">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-5 px-6">
                        <Link to={`/applicants?jobId=${job._id}`} className="block group/title">
                          <p className="text-[15px] font-bold text-slate-900 group-hover/title:text-indigo-600 transition-colors">{job.title}</p>
                          <p className="text-[13px] font-medium text-slate-500 mt-0.5">{user?.name || 'Company Name'}</p>
                        </Link>
                      </td>
                      <td className="py-5 px-6">
                        {job.isClosed ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            Closed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <Link to={`/applicants?jobId=${job._id}`} className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl w-max">
                          <Users size={16} />
                          <span>{job.applications ? job.applications.length : (job.applicantCount || 0)}</span>
                          <span className="text-xs font-medium ml-1">View</span>
                        </Link>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4 text-sm font-bold">
                          <button
                            onClick={() => navigate(`/post-job?edit=${job._id}`)}
                            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            <Edit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleToggleClose(job._id, job.isClosed)}
                            className={`flex items-center gap-1.5 transition-colors ${job.isClosed
                              ? 'text-emerald-600 hover:text-emerald-800'
                              : 'text-orange-600 hover:text-orange-800'
                              }`}
                          >
                            {job.isClosed ? <CheckCircle size={16} /> : <XOctagon size={16} />}
                            {job.isClosed ? 'Reopen' : 'Close'}
                          </button>
                          <button
                            onClick={() => handleDelete(job._id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-500 font-medium">
                      No jobs found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageJobs;