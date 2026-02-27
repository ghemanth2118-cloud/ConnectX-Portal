import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { Briefcase, User as UserIcon, MapPin, Building2, Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'users'

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Fetch Jobs
      const jobsRes = await axiosInstance.get(`${API_PATHS.JOBS.GET_ALL_JOBS}?keyword=${encodeURIComponent(query)}`);
      if (jobsRes.status === 200) {
        setJobs(jobsRes.data);
      }

      // Fetch Users
      const usersRes = await axiosInstance.get(`${API_PATHS.USER.SEARCH}?keyword=${encodeURIComponent(query)}`);
      if (usersRes.status === 200) {
        setUsers(usersRes.data);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout activeMenu="">
      <div className="pb-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <SearchIcon className="w-6 h-6 text-indigo-600" />
            Search Results for "{query}"
          </h1>
          <p className="text-slate-500 mt-1">Found {jobs.length} jobs and {users.length} users.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'jobs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Users ({users.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                {jobs.length > 0 ? (
                  jobs.map(job => (
                    <div key={job._id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                            <Briefcase size={24} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                              <span className="flex items-center gap-1"><Building2 size={16} /> {job.company?.companyName || 'Company'}</span>
                            </div>
                          </div>
                        </div>
                        <Link to={`/job/${job._id}`} className="px-6 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium rounded-xl transition-colors shrink-0 text-center">
                          View Job
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                    <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Jobs Found</h3>
                    <p className="text-slate-500 text-sm">We couldn't find any jobs matching "{query}".</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-4">
                {users.length > 0 ? (
                  users.map(user => (
                    <Link to={`/user/${user._id}`} key={user._id} className="block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        {user.profileImage ? (
                          <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-slate-200">
                            <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center shrink-0 uppercase">
                            {user.fullName?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.fullName}</h3>
                          <p className="text-sm text-slate-500 mt-1 capitalize">{user.role === 'jobSeeker' ? 'Candidate' : 'Employer'}</p>
                          {user.companyName && (
                            <p className="text-sm font-medium text-slate-700 mt-1">
                              <Building2 size={14} className="inline mr-1 text-slate-400" />
                              {user.companyName}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                    <UserIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No Users Found</h3>
                    <p className="text-slate-500 text-sm">We couldn't find any candidates or employers matching "{query}".</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Search;
