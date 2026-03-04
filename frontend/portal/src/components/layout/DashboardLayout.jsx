import React from 'react'
import { useState, useEffect } from 'react'
import {
  Briefcase,
  Building2,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  ChevronRight
} from "lucide-react"
import { EMPLOYER_MENU, JOB_SEEKER_MENU } from '../../Utils/data'
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from '../../context/AuthContext'
import ProfileDropdown from './ProfileDropdown'
import NotificationsDropdown from './NotificationsDropdown'
import axiosInstance from '../../Utils/axiosinstance'
import { API_PATHS } from '../../Utils/apiPaths'

const DashboardLayout = ({ children, activeMenu }) => {
  const { user, logout: authLogOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axiosInstance.get(`${API_PATHS.JOBS.GET_ALL_JOBS}?keyword=${encodeURIComponent(searchQuery)}`);
        const jobs = res.data.jobs || res.data || [];
        setSuggestions(jobs.slice(0, 5)); // show top 5 matches
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // debounce typing
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = async () => {
    try {
      await authLogOut();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/logo.svg" alt="Nexus Logo" className="w-10 h-10 object-contain group-hover:scale-110 transition-transform drop-shadow-sm" />
              <span className="text-2xl font-black tracking-tight bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Nexus
              </span>
            </Link>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-auto p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <div className="px-4 mb-4">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Main Menu</p>
            </div>
            {(user?.role === 'employer' ? EMPLOYER_MENU : JOB_SEEKER_MENU).map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id || location.pathname.includes(item.id);

              return (
                <Link
                  key={item.id}
                  to={`/${item.id}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Icon
                    size={20}
                    className={`${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
                  />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card (Sidebar Bottom) */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 transition-colors duration-300">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold overflow-hidden shadow-inner">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-medium"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="relative hidden md:block z-50">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 w-96 group focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-500/50 transition-all border border-transparent dark:border-slate-700">
                <Search size={18} className="text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search for jobs, candidates..."
                  className="bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-sm ml-2 w-full text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </form>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && searchQuery.trim() && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                  {suggestions.map(job => (
                    <div
                      key={job._id}
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/job/${job._id}`);
                      }}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{job.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-1">{job.company?.companyName || 'Company'}</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  ))}
                  <div
                    onClick={handleSearchSubmit}
                    className="px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold cursor-pointer text-center transition-colors"
                  >
                    See all results for "{searchQuery}"
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <NotificationsDropdown />
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            <ProfileDropdown user={user} handleLogout={handleLogout} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 dark:bg-slate-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto h-full text-slate-900 dark:text-slate-100">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
