import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Users,
  MapPin,
  Briefcase,
  Mail,
  Clock,
  CheckCircle2,
  XOctagon,
  Clock4,
  FileText,
  ExternalLink,
  ChevronLeft,
  User
} from 'lucide-react';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import toast from 'react-hot-toast';
import moment from 'moment';

const ApplicationViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    if (jobId) {
      fetchApplications();
    } else {
      toast.error("No Job ID provided");
      navigate('/manage-jobs');
    }
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.APPLICATIONS.GET_ALL_APPLICATIONS(jobId));
      if (res.data) {
        setApplications(res.data);
        if (res.data.length > 0) {
          setSelectedApp(res.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications for this job");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedApp) return;
    try {
      const res = await axiosInstance.put(API_PATHS.APPLICATIONS.UPDATE_STATUS(selectedApp._id), { status });
      if (res.status === 200 || res.status === 201) {
        toast.success(`Application marked as ${status}`);

        // Update local state
        setApplications(apps => apps.map(app =>
          app._id === selectedApp._id ? { ...app, status } : app
        ));
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Helper placeholder data since the backend User model might not have rich dummy data yet
  const dummySkills = ["React", "Node.js", "MongoDB", "Tailwind CSS", "JavaScript ES6+", "Git"];

  return (
    <DashboardLayout activeMenu="manage-jobs">
      <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col pb-6">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 shrink-0 mt-4">
          <button
            onClick={() => navigate('/manage-jobs')}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Application Viewer</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
              Reviewing {applications.length} candidates
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Applications Yet</h3>
            <p className="text-slate-500 mt-1 max-w-sm text-center">There are currently no candidates for this job posting. Check back later!</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

            {/* Left Sidebar: Application List */}
            <div className="w-full lg:w-96 shrink-0 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Candidates</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {applications.map((app) => (
                  <button
                    key={app._id}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border ${selectedApp?._id === app._id
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                        {app.applicant?.avatar ? (
                          <img src={app.applicant.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold">
                            {(app.applicant?.fullName || app.applicant?.name)?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold truncate ${selectedApp?._id === app._id ? 'text-indigo-900' : 'text-slate-900'}`}>
                          {app.applicant?.fullName || app.applicant?.name || 'Unknown Candidate'}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                          Applied {moment(app.createdAt).fromNow()}
                        </p>
                      </div>
                      {/* Status Indicator Dot */}
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${app.status === 'Applied' ? 'bg-blue-400' :
                        app.status === 'Interview' ? 'bg-orange-400' :
                          app.status === 'Offered' ? 'bg-emerald-400' :
                            app.status === 'Accepted' ? 'bg-green-500' :
                              app.status === 'Rejected' ? 'bg-red-500' : 'bg-slate-300'
                        }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Main Content: Detailed View */}
            {selectedApp && (
              <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-0">
                {/* Header Banner */}
                <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600 relative shrink-0">
                  <div className="absolute -bottom-12 left-8 flex items-end gap-5">
                    <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100">
                      <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                        {selectedApp.applicant?.avatar ? (
                          <img src={selectedApp.applicant.avatar} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-slate-400">{(selectedApp.applicant?.fullName || selectedApp.applicant?.name)?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Top Right */}
                  <div className="absolute top-6 right-6 flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus('Accepted')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={16} /> Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Interview')}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-sm shadow-orange-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Clock4 size={16} /> Interview
                    </button>
                    <button
                      onClick={() => handleUpdateStatus('Rejected')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm shadow-slate-900/20 transition-all flex items-center gap-1.5 border border-white/10"
                    >
                      <XOctagon size={16} /> Reject
                    </button>
                  </div>
                </div>

                {/* Main Content Scrollable Area */}
                <div className="flex-1 overflow-y-auto w-full">
                  <div className="px-8 pt-16 pb-12 w-full max-w-4xl">

                    {/* Basic Info Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-6 border-b border-slate-100">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900">{selectedApp.applicant?.fullName || selectedApp.applicant?.name || 'Unknown Candidate'}</h2>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-slate-600">
                          <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                            <Mail size={14} /> {selectedApp.applicant?.email || 'No email provided'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-400" /> Remote / Unknown
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-slate-400" /> Applied {moment(selectedApp.createdAt).format('MMMM Do YYYY')}
                          </span>
                        </div>
                      </div>

                      {/* Current Status Badge */}
                      <div className="mt-4 sm:mt-0 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Current Status</p>
                        <p className={`text-sm font-bold ${selectedApp.status === 'Applied' ? 'text-blue-600' :
                          selectedApp.status === 'Interview' ? 'text-orange-600' :
                            selectedApp.status === 'Offered' ? 'text-emerald-600' :
                              selectedApp.status === 'Accepted' ? 'text-green-600' :
                                selectedApp.status === 'Rejected' ? 'text-slate-600' : 'text-slate-900'
                          }`}>
                          {selectedApp.status}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                      {/* Left Column (About & Experience) */}
                      <div className="md:col-span-2 space-y-8">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <User size={20} className="text-indigo-600" /> About Candidate
                          </h3>
                          <p className="text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner shadow-slate-100/50">
                            {selectedApp.applicant?.description ||
                              "I am a highly motivated professional with a passion for building scalable and efficient solutions. I thrive in collaborative environments and am always eager to learn new technologies and frameworks. With a background in tackling complex technical challenges, I am excited about the opportunity to contribute to innovative projects and drive impactful results."}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Briefcase size={20} className="text-indigo-600" /> Skills & Expertise
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {dummySkills.map((skill, i) => (
                              <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column (Resume & Actions) */}
                      <div className="space-y-6">
                        {/* Resume Card */}
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative overflow-hidden group">
                          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-100 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
                          <h3 className="font-bold text-slate-900 mb-2 relative z-10 flex items-center gap-2">
                            <FileText size={18} className="text-indigo-600" /> Resume Document
                          </h3>
                          <p className="text-sm text-slate-500 mb-6 relative z-10">Review the candidate's uploaded resume for full details.</p>

                          <a
                            href={selectedApp.resume && selectedApp.resume !== "dummy_resume_link.pdf" ? selectedApp.resume : "https://resume.io/examples/programmer"}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors relative z-10 shadow-sm shadow-indigo-200"
                          >
                            <ExternalLink size={16} /> Open Resume
                          </a>
                        </div>

                        {/* Public Profile Link */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200">
                          <h3 className="font-bold text-slate-900 mb-2">Full Profile</h3>
                          <p className="text-sm text-slate-500 mb-4">View the candidate's complete ConnectX profile.</p>
                          <button
                            onClick={() => window.open(`/user/${selectedApp.applicant?._id}`, '_blank')}
                            className="w-full py-2.5 bg-white border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 rounded-xl font-bold transition-all"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationViewer;