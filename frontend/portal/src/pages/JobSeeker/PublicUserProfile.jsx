import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import { User, Building2, MapPin, Users, Mail, UserPlus, UserMinus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

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

  if (!profile) return <DashboardLayout activeMenu=""><div className="text-center py-20">User not found</div></DashboardLayout>;

  return (
    <DashboardLayout activeMenu="">
      <div className="max-w-4xl mx-auto pb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Cover Header */}
          <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600 w-full"></div>

          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 sm:-mt-16 mb-6 gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-400" />
                )}
              </div>

              <div className="flex gap-3">
                {currentUser && currentUser._id !== profile._id && (
                  <button
                    onClick={toggleFollow}
                    disabled={followProcessing}
                    className={`px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-70 ${isFollowing ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {followProcessing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {!followProcessing && (isFollowing ? <UserMinus size={18} /> : <UserPlus size={18} />)}
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">{profile.fullName}</h1>
              <p className="text-indigo-600 font-medium capitalize mt-1 flex items-center gap-2">
                {profile.role === 'jobSeeker' ? 'Candidate' : 'Employer'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="md:col-span-2 space-y-6">
                {/* About / Bio */}
                {profile.about && (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2"><FileText size={18} className="text-indigo-600" /> About</h3>
                    <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{profile.about}</p>
                  </div>
                )}

                {/* Skills & Certs */}
                {(profile.skills?.length > 0 || profile.certifications?.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.skills?.length > 0 && (
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill, i) => <span key={i} className="px-3 py-1 bg-white text-slate-700 border border-slate-200 rounded-lg text-sm">{skill}</span>)}
                        </div>
                      </div>
                    )}
                    {profile.certifications?.length > 0 && (
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">Certifications</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.certifications.map((cert, i) => <span key={i} className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 font-medium rounded-lg text-sm">{cert}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">Contact Info</h3>
                  <div className="space-y-4">
                    {profile.email && (
                      <div className="flex items-center gap-3 text-slate-700">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0"><Mail size={16} className="text-indigo-600" /></div>
                        <span className="text-sm font-medium">{profile.email}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-3 text-slate-700">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0"><MapPin size={16} className="text-indigo-600" /></div>
                        <span className="text-sm font-medium">{profile.location}</span>
                      </div>
                    )}
                    {profile.companyName && (
                      <div className="flex items-center gap-3 text-slate-700">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0"><Building2 size={16} className="text-indigo-600" /></div>
                        <span className="text-sm font-medium">{profile.companyName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Network Summary */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">Network</h3>
                  <div className="flex gap-4 text-center">
                    <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-2xl font-bold text-indigo-600">{profile.followers?.length || 0}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Followers</p>
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-2xl font-bold text-indigo-600">{profile.following?.length || 0}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">Following</p>
                    </div>
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

export default PublicUserProfile;
