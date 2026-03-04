import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Calendar,
  Briefcase,
  Award,
  CheckCircle2,
  Camera,
  Linkedin,
  Twitter,
  Edit3,
  FileBadge,
  UploadCloud
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';

const EmployerProfilePage = () => {
  const { user, setUser } = useAuth();

  // Local state to manage whether we are in "edit" mode or "view" mode
  const [isEditing, setIsEditing] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    companyName: user?.companyName || 'Tech Innovations Inc.',
    tagline: 'Building the future of software, today.', // Not in DB yet, but keeping for visual
    industry: 'Software Development', // Not in DB yet
    location: user?.location || 'San Francisco, CA',
    website: 'https://techinnovations.example', // Not in DB yet
    employeeCount: user?.employeeCount || '0',
    hiredCount: user?.hiredCount || '0',
    foundedYear: '2015', // Not in DB yet
    description: user?.companyDescription || 'We are a fast-growing tech company focused on delivering cutting-edge AI software solutions for enterprise businesses.',
    linkedin: 'linkedin.com/company/techinnovations',
    twitter: '@TechInnovations',
    companyCertificate: user?.companyCertificate || '',
  });

  const [uploadingCert, setUploadingCert] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        companyName: formData.companyName,
        companyDescription: formData.description,
        location: formData.location,
        companyCertificate: formData.companyCertificate,
      };
      const res = await axiosInstance.put(API_PATHS.USER.UPDATE_PROFILE, payload);
      setFormData(prev => ({
        ...prev,
        ...payload,
        description: res.data.companyDescription || prev.description
      }));
      if (setUser) {
        setUser(prev => ({ ...prev, ...res.data }));
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCert(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const uploadRes = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_FILE, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData(prev => ({ ...prev, companyCertificate: uploadRes.data.fileUrl }));
      toast.success("Certificate uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload certificate");
    } finally {
      setUploadingCert(false);
    }
  };

  React.useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.JOBS.GET_JOBS_EMPLOYER);
        if (res.data) setJobs(res.data);
      } catch (error) {
        console.error("Failed to load jobs:", error);
      }
    };
    fetchJobs();
  }, []);

  // Dummy data for "Founders" or "Leadership" to make the profile look rich
  const leadershipTeam = [
    {
      name: "Sarah Jenkins",
      title: "Co-Founder & CEO",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=60"
    },
    {
      name: "David Chen",
      title: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=60"
    },
    {
      name: "Elena Rodriguez",
      title: "Head of Product",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=60"
    }
  ];

  return (
    <DashboardLayout activeMenu="company-profile">
      <div className="max-w-5xl mx-auto pb-16">

        {/* Top Actions */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${isEditing
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
          >
            {isEditing ? (
              <><CheckCircle2 size={16} /> Save Changes</>
            ) : (
              <><Edit3 size={16} /> Edit Profile</>
            )}
          </button>
        </div>

        {/* Cover Photo & Header Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 sm:h-64 md:h-80 w-full relative group">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80"
              alt="Company Office"
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
                  <Camera size={16} /> Update Cover
                </button>
              </div>
            )}
          </div>

          {/* Profile Details Container */}
          <div className="relative px-6 sm:px-10 pb-10">
            {/* Logo Avatar */}
            <div className="absolute -top-16 sm:-top-20 left-6 sm:left-10 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 group">
              <div className="w-full h-full rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden relative">
                {user?.companyLogo ? (
                  <img src={user.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={48} className="text-indigo-400" />
                )}

                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={24} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Header Content */}
            <div className="pt-20 sm:pt-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3 max-w-lg">
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full text-3xl font-bold border-b-2 border-indigo-200 focus:border-indigo-600 outline-none pb-1 bg-transparent"
                      placeholder="Company Name"
                    />
                    <input
                      type="text"
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      className="w-full text-lg text-slate-500 border-b-2 border-indigo-200 focus:border-indigo-600 outline-none pb-1 bg-transparent"
                      placeholder="Company Tagline"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{formData.companyName}</h2>
                    <p className="text-lg text-slate-500 mt-1 font-medium">{formData.tagline}</p>
                  </>
                )}

                {/* Meta Attributes */}
                <div className="flex flex-wrap items-center gap-y-3 gap-x-6 mt-6">
                  <div className="flex items-center gap-2 text-slate-600 font-medium text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <MapPin size={16} className="text-indigo-500" />
                    {isEditing ? (
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="bg-transparent outline-none w-32 border-b border-indigo-200" />
                    ) : formData.location}
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 font-medium text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <Briefcase size={16} className="text-indigo-500" />
                    {isEditing ? (
                      <input type="text" name="industry" value={formData.industry} onChange={handleInputChange} className="bg-transparent outline-none w-32 border-b border-indigo-200" />
                    ) : formData.industry}
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-sm bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Users size={16} className="text-indigo-500" />
                    <span>{formData.employeeCount} Followers</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-sm bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    <Award size={16} className="text-indigo-500" />
                    <span>{formData.hiredCount} Hired</span>
                  </div>
                </div>
              </div>

              {/* Action / Verified Badge */}
              <div className="shrink-0 pt-4 md:pt-0">
                <div className="bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm border border-blue-100">
                  <CheckCircle2 size={18} className="text-blue-500" />
                  Verified Employer
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout below header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Content Column (Left) */}
          <div className="lg:col-span-2 space-y-8">

            {/* About Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-indigo-600" />
                About Us
              </h3>
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="6"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700"
                ></textarea>
              ) : (
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {formData.description}
                </p>
              )}
            </div>

            {/* Verification & Certificates Section */}
            <div className={`bg-white rounded-3xl shadow-sm border ${formData.companyCertificate ? 'border-blue-200' : 'border-slate-200'} p-8`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileBadge size={20} className="text-blue-600" />
                  Company Verification
                </h3>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center shrink-0 border border-blue-100 text-blue-500">
                  <FileBadge size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h4 className="font-bold text-slate-900 mb-1">Official Registration Certificate</h4>
                  <p className="text-sm text-slate-500 max-w-lg mb-4">
                    Upload your official company registration certificate. This proves your company is legitimate and builds trust with job seekers. It is required to post jobs.
                  </p>

                  {isEditing ? (
                    <div>
                      <input
                        type="file"
                        id="cert-upload"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleCertificateUpload}
                      />
                      <label
                        htmlFor="cert-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 cursor-pointer shadow-sm transition-all"
                      >
                        {uploadingCert ? <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" /> : <UploadCloud size={16} />}
                        {formData.companyCertificate ? "Replace Certificate" : "Upload Document"}
                      </label>
                    </div>
                  ) : (
                    formData.companyCertificate ? (
                      <a href={formData.companyCertificate} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-all">
                        View Certificate Document
                      </a>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md border border-red-100">Action Required: No Certificate Uploaded</span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Leadership/Team Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Users size={20} className="text-indigo-600" />
                  Leadership Team
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {leadershipTeam.map((leader, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 hover:shadow-lg transition-all"
                  >
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-3"
                    />
                    <h4 className="font-bold text-slate-900">{leader.name}</h4>
                    <p className="text-xs text-indigo-600 font-semibold mt-1 uppercase tracking-wide">{leader.title}</p>
                    <div className="mt-3 flex justify-center gap-2">
                      <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm">
                        <Linkedin size={14} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Open Positions Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase size={20} className="text-indigo-600" />
                Your Job Postings
              </h3>

              <div className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map(job => (
                    <div key={job._id} className="p-5 border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            <Link to={`/job/${job._id}`}>{job.title}</Link>
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1"><Briefcase size={14} /> {job.type}</span>
                          </div>
                        </div>
                        <Link
                          to={`/job/${job._id}`}
                          className="px-5 py-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-600 hover:text-white transition-colors text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                      <Briefcase size={24} />
                    </div>
                    <p className="text-slate-500 font-medium">You haven't posted any jobs yet.</p>
                    <Link to="/post-job" className="text-indigo-600 font-bold text-sm hover:underline mt-2 inline-block">Post your first job</Link>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Column (Right) */}
          <div className="space-y-8">

            {/* Quick Facts / Vital Stats */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Quick Facts</h3>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Globe size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Website</p>
                    {isEditing ? (
                      <input type="text" name="website" value={formData.website} onChange={handleInputChange} className="w-full bg-slate-50 border-b border-indigo-200 outline-none py-1 text-sm text-slate-800" />
                    ) : (
                      <a href={formData.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline break-all">
                        {formData.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Founded</p>
                    {isEditing ? (
                      <input type="text" name="foundedYear" value={formData.foundedYear} onChange={handleInputChange} className="w-full bg-slate-50 border-b border-indigo-200 outline-none py-1 text-sm text-slate-800" />
                    ) : (
                      <p className="text-sm font-bold text-slate-800">{formData.foundedYear}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Jobs Posted</p>
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1">
                      {jobs.length} <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full ml-1">Top 5%</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-slate-900 rounded-3xl shadow-sm border border-slate-800 p-6 text-white relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
              <h3 className="text-lg font-bold mb-6 relative z-10">Connect With Us</h3>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                    <Linkedin size={20} />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input type="text" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="w-full bg-slate-800 border-none outline-none py-1 text-sm text-white rounded px-2" />
                    ) : (
                      <a href={`https://${formData.linkedin}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-blue-400 transition-colors">
                        {formData.linkedin}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400">
                    <Twitter size={20} />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <input type="text" name="twitter" value={formData.twitter} onChange={handleInputChange} className="w-full bg-slate-800 border-none outline-none py-1 text-sm text-white rounded px-2" />
                    ) : (
                      <a href={`https://twitter.com/${formData.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-sky-400 transition-colors">
                        {formData.twitter}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default EmployerProfilePage;