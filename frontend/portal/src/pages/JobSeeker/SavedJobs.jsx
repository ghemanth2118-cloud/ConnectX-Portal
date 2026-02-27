import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { Bookmark, MapPin, Building2, Briefcase, Clock, Trash2 } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.SAVED_JOBS.GET_SAVED_JOBS);
      setSavedJobs(res.data || []);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to load saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await axiosInstance.delete(`${API_PATHS.SAVED_JOBS.UNSAVE_JOB}/${jobId}`);
      toast.success("Job removed from saved list.");
      setSavedJobs(savedJobs.filter(sj => sj.job._id !== jobId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove saved job.");
    }
  };

  return (
    <DashboardLayout activeMenu="saved-jobs">
      <div className="max-w-4xl mx-auto pb-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="text-indigo-600" /> Saved Jobs
          </h1>
          <p className="text-slate-500 mt-1">Review and manage the jobs you've flagged for later.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="space-y-4">
            {savedJobs.map(sj => (
              <div key={sj._id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      <Link to={`/job/${sj.job._id}`}>{sj.job.title}</Link>
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><Building2 size={16} /> {sj.job.company?.companyName || 'Company'}</span>
                      <span className="flex items-center gap-1"><MapPin size={16} /> {sj.job.location}</span>
                      <span className="flex items-center gap-1"><Clock size={16} /> Saved {moment(sj.createdAt).fromNow()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <button onClick={() => handleUnsave(sj.job._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                    <Trash2 size={20} />
                  </button>
                  <Link to={`/job/${sj.job._id}`} className="px-5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-xl transition-colors">
                    View Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Bookmark className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Saved Jobs</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              You haven't saved any jobs yet. When you see a job you like, click the 'Save' button to easily find it later.
            </p>
            <Link to="/search" className="inline-block mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
              Find Jobs
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedJobs;