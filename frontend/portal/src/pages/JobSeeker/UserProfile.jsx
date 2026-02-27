import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import { Mail, Users, FileText, MapPin, GraduationCap, Award, Target, Edit3, X, Check, BookOpen, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

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

  if (loading) {
    return (
      <DashboardLayout activeMenu="profile">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) return <DashboardLayout activeMenu="profile"><div className="text-center py-20">Profile not found</div></DashboardLayout>;

  return (
    <DashboardLayout activeMenu="profile">
      <div className="max-w-5xl mx-auto pb-10">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
              <Edit3 size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button disabled={saving} onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                <X size={18} /> Cancel
              </button>
              <button disabled={saving} onClick={handleSaveProfile} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />} Save
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
          <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-700 w-full relative"></div>

          <div className="px-8 pb-8 relative -mt-12">
            <div className="flex flex-col sm:flex-row gap-6 items-end">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shrink-0 shadow-md">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-700 uppercase">
                    {profile.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 w-full flex flex-col sm:flex-row justify-between sm:items-end gap-4 mt-4 sm:mt-0">
                <div>
                  {isEditing ? (
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="font-bold text-2xl text-slate-900 border-b border-indigo-200 focus:border-indigo-600 outline-none w-full max-w-xs bg-transparent mb-1" placeholder="Your Name" />
                  ) : (
                    <h2 className="text-2xl font-bold text-slate-900">{profile.fullName}</h2>
                  )}
                  <p className="text-indigo-600 font-medium capitalize flex items-center gap-3">
                    {profile.role === 'jobSeeker' ? 'Candidate' : 'Employer'}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Mail size={16} className="text-slate-400" /> {profile.email}
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <MapPin size={16} className="text-slate-400" />
                    {isEditing ? (
                      <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="border-b border-indigo-200 outline-none focus:border-indigo-600" placeholder="e.g. San Francisco, CA" />
                    ) : (
                      profile.location || 'Location not set'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><BookOpen size={20} className="text-indigo-600" /> About Me</h3>
              {isEditing ? (
                <textarea name="about" value={formData.about} onChange={handleInputChange} rows="4" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none" placeholder="Write a short bio about your professional background..."></textarea>
              ) : (
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{profile.about || 'No bio provided. Click edit to add an about section.'}</p>
              )}
            </div>

            {/* Skills & Certs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Target size={20} className="text-indigo-600" /> Skills</h3>
                {isEditing ? (
                  <textarea name="skills" value={formData.skills} onChange={handleInputChange} rows="3" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none text-sm" placeholder="e.g. React, Node.js, Project Management (comma separated)"></textarea>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.length > 0 ? profile.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 font-medium text-sm rounded-lg">{skill}</span>
                    )) : <span className="text-slate-500 italic text-sm">No skills added.</span>}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><Award size={20} className="text-indigo-600" /> Certifications</h3>
                {isEditing ? (
                  <textarea name="certifications" value={formData.certifications} onChange={handleInputChange} rows="3" className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none text-sm" placeholder="e.g. AWS Certified Developer, Scrum Master (comma separated)"></textarea>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications?.length > 0 ? profile.certifications.map((cert, i) => (
                      <span key={i} className="px-3 py-1 bg-green-50 border border-green-100 text-green-700 font-medium text-sm rounded-lg">{cert}</span>
                    )) : <span className="text-slate-500 italic text-sm">No certifications added.</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Following Companies List */}
            {profile.following && profile.following.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <Building2 size={20} className="text-indigo-600" /> Companies You Follow
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.following.map(company => (
                    <Link to={company.role === 'employer' ? `/company/${company._id}` : `/user/${company._id}`} key={company._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-indigo-50 overflow-hidden flex items-center justify-center shrink-0">
                        {company.profileImage ? (
                          <img src={company.profileImage} alt={company.companyName || company.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={20} className="text-indigo-600" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{company.companyName || company.fullName}</h4>
                        <p className="text-xs text-slate-500 capitalize">{company.role === 'jobSeeker' ? 'Candidate' : company.role || 'Employer'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Education */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4"><GraduationCap size={20} className="text-indigo-600" /> Education</h3>
              {isEditing ? (
                <input type="text" name="education" value={formData.education} onChange={handleInputChange} className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="e.g. Stanford University" />
              ) : (
                <p className="text-slate-700 font-medium">{profile.education || <span className="text-slate-500 italic font-normal">No education specified.</span>}</p>
              )}
            </div>

            {/* Network Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2 mb-4">
                <Users size={16} /> Network
              </h3>
              <div className="flex gap-4 items-center mb-4">
                <div className="flex-1 text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-2xl font-bold text-indigo-600">{profile.followers?.length || 0}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1 uppercase">Followers</p>
                </div>
                <div className="flex-1 text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-2xl font-bold text-indigo-600">{profile.following?.length || 0}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1 uppercase">Following</p>
                </div>
              </div>
            </div>

            {/* Resume */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2 mb-4">
                <FileText size={16} /> Resume
              </h3>
              {profile.resume ? (
                <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="block w-full text-center px-4 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
                  View Resume
                </a>
              ) : (
                <div className="text-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">No resume uploaded.</p>
                  <span className="text-xs text-slate-400">Settings &gt; Upload Resume</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;