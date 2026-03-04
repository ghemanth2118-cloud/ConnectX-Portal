import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = ({ user, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full hover:bg-slate-50 transition-colors group focus:ring-2 focus:ring-indigo-100 border border-transparent hover:border-slate-200"
      >
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm shadow-indigo-200">
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <span className="text-sm font-medium text-slate-700 hidden sm:block">
          {user?.name?.split(' ')[0] || 'Profile'}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 transform transition-all origin-top-right animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-3 border-b border-slate-50">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.name || 'User Name'}</p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || 'user@example.com'}</p>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(user?.role === "employer" ? "/company-profile" : "/profile");
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center gap-3 transition-colors"
            >
              <User size={18} className="text-slate-400 group-hover:text-indigo-500" />
              <span>My Profile</span>
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/settings');
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center gap-3 transition-colors"
            >
              <Settings size={18} className="text-slate-400 group-hover:text-indigo-500" />
              <span>Settings</span>
            </button>
          </div>

          <div className="border-t border-slate-50 pt-2 pb-1">
            <button
              onClick={() => {
                setIsOpen(false);
                if (handleLogout) handleLogout();
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <LogOut size={18} className="text-red-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;