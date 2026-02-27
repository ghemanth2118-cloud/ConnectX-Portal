import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { Briefcase, MapPin, Building2, CircleDollarSign, Calendar, Users, Bookmark, Send, Clock } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [topJobs, setTopJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_PATHS.JOBS.GET_ALL_JOBS}/${jobId}`);
      if (res.data) {
        setJob(res.data);

        // Fetch top jobs from the same company
        if (res.data.company && res.data.company._id) {
          const jobsRes = await axiosInstance.get(`${API_PATHS.JOBS.GET_ALL_JOBS}?keyword=${res.data.company.companyName}`);
          if (jobsRes.data) {
            setTopJobs(jobsRes.data.filter(j => j._id !== jobId).slice(0, 3));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching job details', error);
      toast.error('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_JOB, { jobId });
      toast.success('Successfully applied to job!');
      fetchJobDetails(); // Refresh to update possible capacity
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      await axiosInstance.post(API_PATHS.SAVED_JOBS.SAVE_JOB(jobId));
      toast.success('Job saved successfully!');
      fetchJobDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save job');
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout activeMenu="">
        <div className="text-center py-20 text-slate-500">Job not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="">
      <div className="max-w-6xl mx-auto pb-10 flex flex-col lg:flex-row gap-8">
        {/* Main Details Panel */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex justify-between items-start flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center overflow-hidden">
                  {job.company?.companyLogo ? (
                    <img src={job.company.companyLogo} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <Building2 size={24} />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                  <Link to={`/company/${job.company?._id}`} className="text-indigo-600 font-medium hover:underline mt-1">
                    {job.company?.companyName || 'Unknown Company'}
                  </Link>
                </div>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={handleSaveJob} className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center gap-2 hover:bg-slate-50 transition-colors">
                  <Bookmark size={18} /> Save
                </button>
                <button onClick={handleApply} disabled={job.isClosed || applying || job.capacity === 0} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60">
                  {applying ? <div className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> : <Send size={18} />}
                  Apply Now
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                <MapPin size={16} className="text-slate-400" />
                {job.location}
              </span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                <Briefcase size={16} className="text-slate-400" />
                {job.type}
              </span>
              {(job.salaryMin || job.salaryMax) && (
                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold flex items-center gap-1.5">
                  <CircleDollarSign size={16} className="text-green-600" />
                  ${job.salaryMin || '0'} - ${job.salaryMax || 'Any'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-indigo-50/50 rounded-xl mb-8 border border-indigo-100">
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Calendar size={12} /> Posted</p>
                <p className="font-semibold text-slate-900">{moment(job.createdAt).fromNow()}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Clock size={12} /> Deadline</p>
                <p className={`font-semibold ${job.deadline && new Date(job.deadline) < new Date() ? 'text-red-500' : 'text-slate-900'}`}>
                  {job.deadline ? moment(job.deadline).format('MMM D, YYYY') : 'None'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase mb-1 flex items-center gap-1"><Users size={12} /> Capacity / Open Seats</p>
                <p className="font-semibold text-slate-900">{job.capacity !== undefined ? `${job.capacity} remaining` : 'Unlimited'}</p>
              </div>
            </div>

            <div className="prose max-w-none text-slate-700">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Job Description</h3>
              <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>

              {job.requirements && job.requirements.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Requirements</h3>
                  <p className="whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Top Jobs */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="text-indigo-600 w-5 h-5" /> Top Jobs from Employer
            </h3>

            {topJobs.length > 0 ? (
              <div className="flex flex-col gap-4">
                {topJobs.map(tj => (
                  <Link to={`/job/${tj._id}`} key={tj._id} className="block p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                    <h4 className="font-bold text-slate-900 mb-1 leading-tight">{tj.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {tj.location}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {moment(tj.createdAt).fromNow()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                No other active jobs from this employer.
              </div>
            )}

            <Link to={`/company/${job.company?._id}`} className="mt-6 w-full block text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
              View Company Profile
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetails;