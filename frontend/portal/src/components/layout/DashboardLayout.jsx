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

const DashboardLayout = ({ children, activeMenu }) => {
  const { user, logout: authLogOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
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
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <Briefcase size={22} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700">
                ConnectX
              </span>
            </Link>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-auto p-2 text-slate-400 hover:text-slate-600 lg:hidden"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <div className="px-4 mb-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Main Menu</p>
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
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Icon
                    size={20}
                    className={`${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                  />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Card (Sidebar Bottom) */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || user?.fullName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
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
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for jobs, candidates..."
                className="bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-sm ml-2 w-full text-slate-700 placeholder:text-slate-400"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <NotificationsDropdown />
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            <ProfileDropdown user={user} handleLogout={handleLogout} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
