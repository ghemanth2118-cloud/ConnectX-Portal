import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Users,
  Briefcase,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail
} from 'lucide-react';
import moment from 'moment';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const CompanyProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);

      // Get company info
      const res = await axiosInstance.get(API_PATHS.USER.GET_PROFILE(id));
      const companyData = res.data;
      setCompany(companyData);
      setFollowerCount(companyData.followers?.length || 0);

      // Check if current user follows this company
      if (user && companyData.followers) {
        setIsFollowing(companyData.followers.some(f => f._id === user._id || f === user._id));
      }

      // Fetch jobs posted by this company
      // Depending on API, maybe we have to fetch all jobs and filter or an endpoint exists. 
      // Assuming GET_ALL_JOBS with query params or we just filter client side for now.
      const jobsRes = await axiosInstance.get(API_PATHS.JOBS.GET_ALL_JOBS);
      if (jobsRes.data) {
        // jobsRes.data.jobs usually based on backend, here assuming jobsRes.data is array of jobs or jobsRes.data.jobs
        const allJobs = Array.isArray(jobsRes.data) ? jobsRes.data : jobsRes.data.jobs || [];
        const companyJobs = allJobs.filter(j =>
          (j.company && j.company._id === id) ||
          (j.company === id)
        );
        setJobs(companyJobs);
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCompanyData();
    }
  }, [id, user]);

  const handleFollowToggle = async () => {
    if (!user) {
      toast.error('Please login to follow this company.');
      return;
    }

    try {
      if (isFollowing) {
        await axiosInstance.post(API_PATHS.USER.UNFOLLOW(id));
        setFollowerCount(prev => prev - 1);
        setIsFollowing(false);
        toast.success(`Unfollowed ${company?.companyName}`);
      } else {
        await axiosInstance.post(API_PATHS.USER.FOLLOW(id));
        setFollowerCount(prev => prev + 1);
        setIsFollowing(true);
        toast.success(`Following ${company?.companyName}`);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error(error.response?.data?.message || 'Failed to update follow status');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="search">
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout activeMenu="search">
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Company Not Found</h2>
          <p className="text-slate-500 mt-2 mb-6">The company profile you are looking for does not exist.</p>
          <Link to="/search" className="text-indigo-600 hover:text-indigo-700 font-medium">← Back to Search</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="search">
      <div className="max-w-4xl mx-auto pb-12">
        {/* Back Button */}
        <Link to="/search" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium">
          <ArrowLeft size={16} /> Back
        </Link>

        {/* Header Profile Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden mb-8">
          {/* Abstract background shape */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            {/* Company Logo */}
            <div className="w-24 h-24 rounded-2xl shrink-0 overflow-hidden bg-white border border-slate-100 shadow-sm flex items-center justify-center">
              {company.companyLogo || company.profileImage ? (
                <img
                  src={company.companyLogo || company.profileImage}
                  alt={company.companyName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 size={40} className="text-indigo-300" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                    {company.companyName || company.fullName}
                  </h1>
                  <div className="flex items-center gap-4 mt-3 text-slate-500 text-sm">
                    <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> Remote / HQ</span>
                    <span className="flex items-center gap-1.5"><Users size={16} className="text-slate-400" /> {followerCount} Followers</span>
                    <span className="flex items-center gap-1.5"><CalendarDays size={16} className="text-slate-400" /> Joined {moment(company.createdAt).format("YYYY")}</span>
                  </div>
                </div>

                {/* Actions */}
                {user && user._id !== id && (
                  <button
                    onClick={handleFollowToggle}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${isFollowing
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md border border-transparent'
                      }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">About the Company</h3>
                <p className="text-slate-600 leading-relaxed max-w-2xl">
                  {company.companyDescription || "This company has not provided a description yet."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Briefcase className="text-indigo-600" /> Open Positions ({jobs.filter(j => !j.isClosed).length})
        </h2>

        <div className="space-y-4">
          {jobs.filter(j => !j.isClosed).length > 0 ? (
            jobs.filter(j => !j.isClosed).map(job => (
              <div key={job._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      <Link to={`/job/${job._id}`}>{job.title}</Link>
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                      {job.salaryMin && job.salaryMax && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-slate-700">${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</span>
                        </>
                      )}
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
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
              <p className="text-slate-500">No open positions available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyProfile;
