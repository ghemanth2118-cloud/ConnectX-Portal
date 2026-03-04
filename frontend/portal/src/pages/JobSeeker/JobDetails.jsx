import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, MapPin, Building2, CircleDollarSign, Calendar, Users, Bookmark, Send, Clock, X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [topJobs, setTopJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  // Apply Modal State
  const [showModal, setShowModal] = useState(false);
  const [resumeType, setResumeType] = useState('new'); // 'profile' or 'new'
  const [resumeFile, setResumeFile] = useState(null);
  const [profileResumeUrl, setProfileResumeUrl] = useState(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);

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

  const handleOpenModal = async () => {
    if (user?._id) {
      setApplying(true);
      try {
        const res = await axiosInstance.get(API_PATHS.USER.GET_PROFILE(user._id));
        if (res.data && res.data.resume) {
          // Instant Apply Flow
          await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_JOB, {
            jobId,
            resume: res.data.resume
          });
          toast.success('Successfully applied to job using your Profile Resume!');
          fetchJobDetails(); // Refresh to update possible capacity
        } else {
          // Fallback to Modal for New Resume Upload
          setResumeType('new');
          setShowModal(true);
        }
      } catch (err) {
        console.error("Error during application process:", err);
        // Error could be from get profile OR from apply_job (e.g. already applied)
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Failed to apply. Please try again.");
          setShowModal(true); // show modal as fallback just in case
        }
      } finally {
        setApplying(false);
      }
    } else {
      toast.error("Please login to apply.");
    }
  };

  const handleConfirmApply = async () => {
    if (resumeType === 'new' && !resumeFile) {
      toast.error("Please select a resume file to upload.");
      return;
    }

    setApplying(true);
    try {
      let finalResumeUrl = profileResumeUrl;

      if (resumeType === 'new' && resumeFile) {
        // Upload the new resume
        const formData = new FormData();
        formData.append('file', resumeFile);
        const uploadRes = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_FILE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalResumeUrl = uploadRes.data.fileUrl;
      }

      await axiosInstance.post(API_PATHS.APPLICATIONS.APPLY_JOB, {
        jobId,
        resume: finalResumeUrl
      });

      toast.success('Successfully applied to job!');
      setShowModal(false);
      setResumeFile(null); // Reset for future applications
      fetchJobDetails(); // Refresh to update possible capacity
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setResumeFile(file);
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
                <button onClick={handleOpenModal} disabled={job.isClosed || job.capacity === 0 || applying} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 min-w-36 justify-center">
                  {applying ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Send size={18} />
                      Apply Now
                    </>
                  )}
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

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 truncate pr-4">Apply for {job.title}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                disabled={applying}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto min-h-0">
              <p className="text-sm text-slate-600 mb-6 font-medium">Please provide a resume for this application. You can use your saved profile resume or upload a new one.</p>

              {fetchingProfile ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Option: Upload New Resume */}
                  <div className={`block relative rounded-2xl border-2 transition-all ${resumeType === 'new' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300'}`}>
                    <label className="flex items-center justify-between p-4 cursor-pointer">
                      <input type="radio" name="resumeType" value="new" checked={resumeType === 'new'} onChange={() => setResumeType('new')} className="sr-only" />
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${resumeType === 'new' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                          <UploadCloud size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">Upload New Resume</h4>
                          <p className="text-xs text-slate-500">PDF, DOC, DOCX up to 5MB</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${resumeType === 'new' ? 'border-indigo-600' : 'border-slate-300'}`}>
                        {resumeType === 'new' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                      </div>
                    </label>
                    <div className="px-4 pb-4">
                      <input
                        type="file"
                        id="new-resume-upload"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="new-resume-upload"
                        className="block text-center py-6 px-4 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl cursor-pointer bg-white transition-colors"
                      >
                        {resumeFile ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle2 size={24} className="text-emerald-500 mb-2" />
                            <span className="text-sm font-bold text-slate-900 truncate max-w-xs">{resumeFile.name}</span>
                            <span className="text-xs text-slate-500 mt-1">Ready to upload</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-slate-500">
                            <UploadCloud size={24} className="mb-2 opacity-50 text-indigo-500" />
                            <span className="text-sm font-semibold">Click to select file</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                disabled={applying}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={applying || fetchingProfile || (resumeType === 'new' && !resumeFile) || (resumeType === 'profile' && !profileResumeUrl)}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {applying ? <div className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" /> : <Send size={16} />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default JobDetails;