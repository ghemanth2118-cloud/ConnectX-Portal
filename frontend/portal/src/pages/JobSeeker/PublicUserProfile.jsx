import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import { User, Building2, MapPin, Users, Mail, UserPlus, UserMinus, FileText, Target, Award, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const PublicUserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followProcessing, setFollowProcessing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id, currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.USER.GET_PROFILE(id));
      if (res.data) {
        setProfile(res.data);
        if (currentUser) {
          // Check if current user is in their followers array
          const following = res.data.followers?.some(f =>
            (typeof f === 'string' ? f : f._id) === currentUser._id
          );
          setIsFollowing(following);
        }
      }
    } catch (error) {
      console.error('Error fetching profile', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async () => {
    if (!currentUser) {
      toast.error("Please login to follow users");
      navigate('/login');
      return;
    }

    setFollowProcessing(true);
    try {
      if (isFollowing) {
        await axiosInstance.post(API_PATHS.USER.UNFOLLOW(id));
        setIsFollowing(false);
        setProfile(prev => ({ ...prev, followers: prev.followers.filter(f => (f._id || f) !== currentUser._id) }));
        toast.success(`Unfollowed ${profile.fullName}`);
      } else {
        await axiosInstance.post(API_PATHS.USER.FOLLOW(id));
        setIsFollowing(true);
        setProfile(prev => ({ ...prev, followers: [...(prev.followers || []), currentUser._id] }));
        toast.success(`Following ${profile.fullName}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    } finally {
      setFollowProcessing(false);
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

  if (!profile) return <DashboardLayout activeMenu=""><div className="text-center py-20 text-slate-500 font-medium">User not found</div></DashboardLayout>;

  return (
    <DashboardLayout activeMenu="">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto pb-10 px-4 sm:px-0"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-8"
        >
          {/* Cover Header */}
          <div className="h-40 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          </div>

          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-20 mb-6 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl"
              >
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl font-black text-indigo-700 uppercase">
                    {profile.fullName?.charAt(0) || 'U'}
                  </div>
                )}
              </motion.div>

              <div className="flex gap-3 mt-4 sm:mt-0">
                {currentUser && currentUser._id !== profile._id && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFollow}
                    disabled={followProcessing}
                    className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-70 ${isFollowing ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/30'}`}
                  >
                    {followProcessing ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : null}
                    {!followProcessing && (isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />)}
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </motion.button>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{profile.fullName}</h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 rounded-full bg-indigo-50 text-indigo-600 font-semibold text-sm border border-indigo-100">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {profile.role === 'jobSeeker' ? 'Candidate' : 'Employer'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <div className="md:col-span-2 space-y-8">
                {/* About / Bio */}
                {profile.about && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-slate-50/70 rounded-3xl p-8 border border-slate-100 hover:shadow-md transition-shadow duration-300"
                  >
                    <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-xl"><FileText size={22} className="text-indigo-600" /></div> About
                    </h3>
                    <p className="whitespace-pre-wrap text-slate-600 leading-relaxed font-medium text-[15px]">{profile.about}</p>
                  </motion.div>
                )}

                {/* Skills & Certs */}
                {(profile.skills?.length > 0 || profile.certifications?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {profile.skills?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-slate-50/70 rounded-3xl p-8 border border-slate-100 hover:shadow-md transition-shadow duration-300"
                      >
                        <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-xl"><Target size={22} className="text-purple-600" /></div> Skills
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          {profile.skills.map((skill, i) => <span key={i} className="px-4 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold shadow-sm">{skill}</span>)}
                        </div>
                      </motion.div>
                    )}
                    {profile.certifications?.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-slate-50/70 rounded-3xl p-8 border border-slate-100 hover:shadow-md transition-shadow duration-300"
                      >
                        <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 rounded-xl"><Award size={22} className="text-emerald-600" /></div> Certifications
                        </h3>
                        <div className="flex flex-wrap gap-2.5">
                          {profile.certifications.map((cert, i) => <span key={i} className="px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold rounded-xl text-sm shadow-sm">{cert}</span>)}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-8">
                {/* Contact Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-slate-50/70 rounded-3xl p-8 border border-slate-100 hover:shadow-md transition-shadow duration-300"
                >
                  <h3 className="text-xl font-extrabold text-slate-900 border-b-2 border-slate-200/60 pb-4 mb-6">Contact Info</h3>
                  <div className="space-y-5">
                    {profile.email && (
                      <div className="flex items-center gap-4 text-slate-700">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100"><Mail size={18} className="text-indigo-500" /></div>
                        <span className="text-[15px] font-semibold">{profile.email}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-4 text-slate-700">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100"><MapPin size={18} className="text-indigo-500" /></div>
                        <span className="text-[15px] font-semibold">{profile.location}</span>
                      </div>
                    )}
                    {profile.companyName && (
                      <div className="flex items-center gap-4 text-slate-700">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100"><Building2 size={18} className="text-indigo-500" /></div>
                        <span className="text-[15px] font-semibold">{profile.companyName}</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Network Summary */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-slate-50/70 rounded-3xl p-8 border border-slate-100 hover:shadow-md transition-shadow duration-300"
                >
                  <h3 className="text-xl font-extrabold text-slate-900 border-b-2 border-slate-200/60 pb-4 mb-6">Network</h3>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50/50 to-blue-100/50 rounded-2xl p-4 border border-blue-100 shadow-inner">
                      <p className="text-3xl font-black text-blue-700 mb-1">{profile.followers?.length || 0}</p>
                      <p className="text-[10px] font-bold text-blue-900/60 uppercase tracking-widest">Followers</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-purple-50/50 to-purple-100/50 rounded-2xl p-4 border border-purple-100 shadow-inner">
                      <p className="text-3xl font-black text-purple-700 mb-1">{profile.following?.length || 0}</p>
                      <p className="text-[10px] font-bold text-purple-900/60 uppercase tracking-widest">Following</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default PublicUserProfile;
