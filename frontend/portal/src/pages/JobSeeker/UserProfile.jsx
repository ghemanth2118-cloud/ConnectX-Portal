import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import { Mail, Users, FileText, MapPin, GraduationCap, Award, Target, Edit3, X, Check, BookOpen, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    about: '',
    education: '',
    skills: '',
    certifications: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const fetchProfile = async () => {
    if (!currentUser?._id) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.USER.GET_PROFILE(currentUser._id));
      setProfile(res.data);
      setFormData({
        name: res.data.fullName || '',
        location: res.data.location || '',
        about: res.data.about || '',
        education: res.data.education || '',
        skills: res.data.skills?.join(', ') || '',
        certifications: res.data.certifications?.join(', ') || ''
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        about: formData.about,
        education: formData.education,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
        certifications: formData.certifications.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      await axiosInstance.put(API_PATHS.USER.UPDATE_PROFILE, payload);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload the file
      const uploadRes = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_FILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const fileUrl = uploadRes.data.fileUrl;

      // 2. Update user profile with new resume URL
      await axiosInstance.put(API_PATHS.USER.UPDATE_PROFILE, { resume: fileUrl });

      toast.success("Resume uploaded successfully!");
      fetchProfile(); // Refresh profile to get updated resume link
    } catch (error) {
      console.error("Resume upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="profile">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return <DashboardLayout activeMenu="profile"><div className="text-center py-20 text-slate-500 font-medium">Profile not found</div></DashboardLayout>;

  return (
    <DashboardLayout activeMenu="profile">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto pb-10 px-4 sm:px-0"
      >
        <div className="mb-8 flex justify-between items-center bg-white/50 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100">
          <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">Your Profile</h1>
          {!isEditing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-bold rounded-xl hover:shadow-md transition-all border border-indigo-100"
            >
              <Edit3 size={18} /> Edit Profile
            </motion.button>
          ) : (
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={saving}
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              >
                <X size={18} /> Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={saving}
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-70"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />} Save Changes
              </motion.button>
            </div>
          )}
        </div>

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-8"
        >
          <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          </div>

          <div className="px-8 pb-8 relative -mt-16">
            <div className="flex flex-col sm:flex-row gap-6 items-end">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shrink-0 shadow-xl"
              >
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-4xl font-black text-indigo-700 uppercase">
                    {profile.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </motion.div>

              <div className="flex-1 w-full flex flex-col sm:flex-row justify-between sm:items-end gap-4 mt-4 sm:mt-0">
                <div className="flex-1">
                  {isEditing ? (
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="font-extrabold text-3xl text-slate-900 border-b-2 border-indigo-300 focus:border-indigo-600 outline-none w-full max-w-sm bg-transparent mb-2 pb-1 transition-colors" placeholder="Your Name" />
                  ) : (
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{profile.fullName}</h2>
                  )}
                  <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm border border-indigo-100">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    {profile.role === 'jobSeeker' ? 'Candidate' : 'Employer'}
                  </div>
                </div>

                <div className="flex flex-col gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm"><Mail size={16} className="text-indigo-500" /></div> {profile.email}
                  </span>
                  <span className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm"><MapPin size={16} className="text-indigo-500" /></div>
                    {isEditing ? (
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="border-b-2 border-indigo-200 outline-none focus:border-indigo-600 bg-transparent px-1 min-w-[150px]" placeholder="e.g. San Francisco, CA" />
                    ) : (
                      profile.location || <span className="text-slate-400 italic font-normal">Location not set</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300"
            >
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-xl"><BookOpen size={22} className="text-indigo-600" /></div> About Me
              </h3>
              {isEditing ? (
                <textarea name="about" value={formData.about} onChange={handleInputChange} rows="5" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none transition-all text-slate-700 font-medium" placeholder="Write a short bio about your professional background..."></textarea>
              ) : (
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap font-medium text-[15px]">{profile.about || <span className="text-slate-400 italic">No bio provided. Click edit to add an about section.</span>}</p>
              )}
            </motion.div>

            {/* Skills & Certs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300"
              >
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-xl"><Target size={22} className="text-purple-600" /></div> Skills
                </h3>
                {isEditing ? (
                  <textarea name="skills" value={formData.skills} onChange={handleInputChange} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 resize-none text-sm transition-all" placeholder="e.g. React, Node.js, Project Management (comma separated)"></textarea>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                      <span key={i} className="px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-colors shadow-sm">{skill}</span>
                    )) : <span className="text-slate-400 italic text-sm font-medium">No skills added.</span>}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300"
              >
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 rounded-xl"><Award size={22} className="text-emerald-600" /></div> Certifications
                </h3>
                {isEditing ? (
                  <textarea name="certifications" value={formData.certifications} onChange={handleInputChange} rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none text-sm transition-all" placeholder="e.g. AWS Certified Developer, Scrum Master (comma separated)"></textarea>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {profile.certifications?.length > 0 ? profile.certifications.map((cert, i) => (
                      <span key={i} className="px-4 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold text-sm rounded-xl shadow-sm">{cert}</span>
                    )) : <span className="text-slate-400 italic text-sm font-medium">No certifications added.</span>}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Following Companies List */}
            {profile.following && profile.following.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8"
              >
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl"><Building2 size={22} className="text-blue-600" /></div> Following
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.following.map(company => (
                    <Link to={company.role === 'employer' ? `/company/${company._id}` : `/user/${company._id}`} key={company._id} className="group">
                      <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-blue-100 transition-colors">
                          {company.profileImage ? (
                            <img src={company.profileImage} alt={company.companyName || company.fullName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <Building2 size={24} className="text-slate-400" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{company.companyName || company.fullName}</h4>
                          <p className="text-xs font-semibold text-slate-500 capitalize mt-0.5">{company.role === 'jobSeeker' ? 'Candidate' : company.role || 'Employer'}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-8">
            {/* Education */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300"
            >
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-50 rounded-xl"><GraduationCap size={22} className="text-amber-600" /></div> Education
              </h3>
              {isEditing ? (
                <input type="text" name="education" value={formData.education} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium" placeholder="e.g. Stanford University" />
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-700 font-semibold">{profile.education || <span className="text-slate-400 italic font-medium">No education specified.</span>}</p>
                </div>
              )}
            </motion.div>

            {/* Network Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8"
            >
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6">
                <Users size={16} /> Network
              </h3>
              <div className="flex gap-4 items-center">
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50/50 to-indigo-100/50 rounded-2xl p-5 border border-indigo-100 shadow-inner">
                  <p className="text-4xl font-black text-indigo-700 mb-1">{profile.followers?.length || 0}</p>
                  <p className="text-xs font-bold text-indigo-900/60 uppercase tracking-widest">Followers</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-purple-50/50 to-purple-100/50 rounded-2xl p-5 border border-purple-100 shadow-inner">
                  <p className="text-4xl font-black text-purple-700 mb-1">{profile.following?.length || 0}</p>
                  <p className="text-xs font-bold text-purple-900/60 uppercase tracking-widest">Following</p>
                </div>
              </div>
            </motion.div>

            {/* Resume */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} /> Resume Document
                </h3>
              </div>

              {profile.resume ? (
                <div className="space-y-4">
                  <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="group block w-full text-center px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-slate-900/20 transition-all duration-300">
                    <span className="flex items-center justify-center gap-2">View Current Resume</span>
                  </a>
                  <div className="text-center">
                    <input
                      type="file"
                      id="resume-upload-change"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                    />
                    <label
                      htmlFor="resume-upload-change"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
                    >
                      {uploadingResume ? (
                        <><div className="w-3.5 h-3.5 border-2 border-indigo-400 rounded-full animate-spin border-t-transparent" /> Uploading...</>
                      ) : (
                        <><Edit3 size={14} /> Update Resume</>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="resume-upload-new"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                  />
                  <label htmlFor="resume-upload-new" className="block cursor-pointer">
                    <div className={`text-center p-8 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border-2 border-dashed ${uploadingResume ? 'border-indigo-300' : 'border-slate-200 hover:border-indigo-300'} transition-all duration-300`}>
                      {uploadingResume ? (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <div className="w-6 h-6 border-2 border-indigo-500 rounded-full animate-spin border-t-transparent" />
                          </div>
                          <p className="text-sm font-bold text-indigo-700 mb-1">Uploading your resume...</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                            <FileText size={20} className="text-indigo-500" />
                          </div>
                          <p className="text-sm font-bold text-slate-700 mb-1">Upload your resume here</p>
                          <p className="text-xs font-medium text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default UserProfile;