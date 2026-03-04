import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { Briefcase, User as UserIcon, MapPin, Building2, Search as SearchIcon, Filter, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const LOCATIONS = ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai"];
const INDUSTRIES = ["Frontend Developer", "Backend Developer", "Data Science", "FullStack Developer", "Nextjs Developer"];
const SALARIES = ["0 - 40k", "42k to 1lakh", "1lakh to 5lakh"];

const CATEGORIES = ["All Jobs", "Software / Tech", "Electronics (ECE)", "Mechanical (MECH)", "Civil", "Management", "Design", "Marketing", "Data Science"];

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'users'
  const [activeCategory, setActiveCategory] = useState("All Jobs");
  const [savingJobIds, setSavingJobIds] = useState(new Set());

  const [locationFilter, setLocationFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchResults();
  }, [query]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Fetch Jobs
      const jobsUrl = query
        ? `${API_PATHS.JOBS.GET_ALL_JOBS}?keyword=${encodeURIComponent(query)}`
        : API_PATHS.JOBS.GET_ALL_JOBS;
      const jobsRes = await axiosInstance.get(jobsUrl);
      if (jobsRes.status === 200) {
        setJobs(jobsRes.data.jobs || jobsRes.data); // Adjust depending on backend response format
      }

      // Fetch Users
      if (query) {
        const usersRes = await axiosInstance.get(`${API_PATHS.USER.SEARCH}?keyword=${encodeURIComponent(query)}`);
        if (usersRes.status === 200) {
          setUsers(usersRes.data);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    // Basic text search mockup filters
    const title = (job.title || "").toLowerCase();
    const loc = (job.location || "").toLowerCase();

    // Sidebar Filters
    if (industryFilter && !title.includes(industryFilter.split(" ")[0].toLowerCase())) return false;
    if (locationFilter && !loc.includes(locationFilter.toLowerCase())) return false;

    // Category filter
    if (activeCategory !== "All Jobs") {
      const catMatches = {
        "Software / Tech": ["software", "tech", "developer", "cse", "it", "data", "web", "react", "node"],
        "Electronics (ECE)": ["electronics", "ece", "circuit", "hardware", "embedded"],
        "Mechanical (MECH)": ["mechanical", "mech", "design", "auto", "manufacturing"],
        "Civil": ["civil", "construction", "site", "structural"],
        "Management": ["manager", "management", "lead", "product", "project"],
        "Design": ["design", "ui", "ux", "graphic"],
        "Marketing": ["marketing", "seo", "sales", "content"],
        "Data Science": ["data", "science", "analytics", "machine learning", "ai"]
      };

      const keywords = catMatches[activeCategory] || [];
      const isMatch = keywords.some(kw => title.includes(kw)) || job.category === activeCategory;
      if (!isMatch) return false;
    }

    return true;
  });

  const scrollCategories = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      setSavingJobIds(prev => new Set(prev).add(jobId));

      const jobIndex = jobs.findIndex(j => j._id === jobId);
      const job = jobs[jobIndex];
      const isCurrentlySaved = job.isSaved;

      const endpoint = isCurrentlySaved
        ? API_PATHS.SAVED_JOBS.UNSAVE_JOB(jobId)
        : API_PATHS.SAVED_JOBS.SAVE_JOB(jobId);

      const res = isCurrentlySaved
        ? await axiosInstance.delete(endpoint)
        : await axiosInstance.post(endpoint);

      if (res.status === 200 || res.status === 201) {
        setJobs(prevJobs => prevJobs.map(j =>
          j._id === jobId ? { ...j, isSaved: !isCurrentlySaved } : j
        ));
        toast.success(isCurrentlySaved ? "Job removed from saved items" : "Job saved for later!");
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("Failed to update saved job status");
    } finally {
      setSavingJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  return (
    <DashboardLayout activeMenu="">
      <div className="pb-10 max-w-7xl mx-auto px-4 md:px-8">

        {/* Amazon-Style Horizontal Category Nav */}
        <div className="bg-slate-900 border-b border-slate-800 -mx-4 md:-mx-8 px-4 md:px-8 mb-6 py-2 shadow-sm sticky top-0 z-20">
          <div className="relative flex items-center group">
            {/* Left Scroll Arrow */}
            <button
              onClick={() => scrollCategories('left')}
              className="absolute left-0 z-10 p-1.5 bg-linear-to-r from-slate-900 via-slate-900 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Scrollable Categories List */}
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 scroll-smooth w-full px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-sm text-sm font-medium transition-all ${activeCategory === category
                    ? 'bg-white text-slate-900 border-2 border-transparent'
                    : 'text-slate-200 border-2 border-transparent hover:border-slate-500'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Right Scroll Arrow */}
            <button
              onClick={() => scrollCategories('right')}
              className="absolute right-0 z-10 p-1.5 bg-linear-to-l from-slate-900 via-slate-900 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {query ? `Search Results for "${query}"` : activeCategory === "All Jobs" ? "Recommended For You" : `${activeCategory} Jobs`}
          </h1>
          <p className="text-slate-500 text-sm">
            {query
              ? `Found ${filteredJobs.length} jobs and ${users.length} users.`
              : `Showing ${filteredJobs.length} jobs based on your preferences.`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'jobs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Jobs ({filteredJobs.length})
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
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'jobs' && (
              <div className="flex flex-col md:flex-row gap-6 items-start">

                {/* Sidebar */}
                <div className="w-full md:w-1/4 bg-white p-6 rounded-2xl h-fit border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">Filter Jobs</h2>

                  <div className="mb-6">
                    <h3 className="font-bold text-slate-800 mb-3 text-lg">Location</h3>
                    <div className="space-y-2.5">
                      {LOCATIONS.map(loc => (
                        <label key={loc} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="location"
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600"
                            checked={locationFilter === loc}
                            onChange={() => setLocationFilter(loc)}
                          />
                          <span className="text-slate-700 font-medium group-hover:text-purple-600 transition-colors">{loc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-slate-800 mb-3 text-lg">Industry</h3>
                    <div className="space-y-2.5">
                      {INDUSTRIES.map(ind => (
                        <label key={ind} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="industry"
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600"
                            checked={industryFilter === ind}
                            onChange={() => setIndustryFilter(ind)}
                          />
                          <span className="text-slate-700 font-medium group-hover:text-purple-600 transition-colors">{ind}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-slate-800 mb-3 text-lg">Salary</h3>
                    <div className="space-y-2.5">
                      {SALARIES.map(sal => (
                        <label key={sal} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="salary"
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-600"
                            checked={salaryFilter === sal}
                            onChange={() => setSalaryFilter(sal)}
                          />
                          <span className="text-slate-700 font-medium group-hover:text-purple-600 transition-colors">{sal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => { setLocationFilter(''); setIndustryFilter(''); setSalaryFilter(''); }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors mt-2"
                  >
                    Clear Filters
                  </button>
                </div>

                {/* Main Grid */}
                <div className="w-full md:w-3/4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredJobs.length > 0 ? (
                      filteredJobs.map(job => (
                        <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-xl hover:border-purple-200 transition-all flex flex-col h-full group">

                          {/* Top Row: Time & Bookmark */}
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs text-slate-400 font-medium">
                              {moment(job.createdAt).fromNow()}
                            </span>
                            <button
                              onClick={() => handleSaveJob(job._id)}
                              disabled={savingJobIds.has(job._id)}
                              className={`${job.isSaved ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'} transition-colors disabled:opacity-50`}
                            >
                              <Bookmark size={20} className={job.isSaved ? "fill-current" : ""} />
                            </button>
                          </div>

                          {/* Company Row */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                              {job.company?.companyLogo ? (
                                <img src={job.company.companyLogo} alt={job.company.companyName} className="w-full h-full object-cover" />
                              ) : (
                                <Building2 className="text-purple-500" size={20} />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">{job.company?.companyName || 'Company Name'}</h4>
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5"><MapPin size={10} /> {job.location || 'India'}</p>
                            </div>
                          </div>

                          {/* Job Title & Desc */}
                          <h3 className="text-lg font-extrabold text-slate-900 mb-2 line-clamp-1">{job.title}</h3>
                          <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                            {job.description || `We need a ${job.title}, who can work efficiently and deliver high-quality code.`}
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-lg border border-blue-100">{job.capacity || 2} positions</span>
                            <span className="px-3 py-1 bg-red-50 text-red-500 text-[11px] font-bold rounded-lg border border-red-100">{job.jobType || "Full Time"}</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-lg border border-purple-100">{job.salary ? `${job.salary}LPA` : "Not Disclosed"}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3">
                            <Link to={`/job/${job._id}`} className="flex-1 py-2.5 px-2 text-center border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors text-sm">
                              Details
                            </Link>
                            <button
                              onClick={() => handleSaveJob(job._id)}
                              disabled={savingJobIds.has(job._id)}
                              className={`flex-1 py-2.5 px-2 text-center text-white font-bold rounded-xl transition-all text-sm shadow-md ${job.isSaved
                                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                : 'bg-slate-800 hover:bg-slate-900 shadow-slate-200'
                                } disabled:opacity-70`}
                            >
                              {savingJobIds.has(job._id) ? 'Wait...' : job.isSaved ? 'Saved' : 'Save For Later'}
                            </button>
                          </div>

                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No Jobs Found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search query.</p>
                      </div>
                    )}
                  </div>
                </div>
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
                          <p className="text-sm text-slate-500 mt-1 capitalize">{user.role === 'jobSeeker' ? 'Candidate' : 'Recruiter'}</p>
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
                    <p className="text-slate-500 text-sm">We couldn't find any candidates or recruiters matching "{query}".</p>
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
