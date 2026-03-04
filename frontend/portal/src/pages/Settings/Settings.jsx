import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Lock, Eye, Shield, HelpCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('edit_profile');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const tabs = [
    { id: 'edit_profile', label: 'Edit profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy and security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'supervision', label: 'Supervision', icon: Shield },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  // Initialize Dark Mode on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = (enableDark) => {
    if (enableDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        about: formData.get('about'),
      };
      const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, data);

      // Keep existing token and merge updated profile data
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      // 1. Upload the image file to the local storage via multer endpoint
      const uploadRes = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = uploadRes.data.imageUrl;

      // 2. Set the image url string to the user profile table
      const profileRes = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, { avatar: imageUrl });

      const updatedUser = { ...user, ...profileRes.data };
      setUser(updatedUser);
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <DashboardLayout activeMenu="">
      <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] flex shadow-sm transition-colors duration-300">

        {/* Sidebar */}
        <div className="w-1/3 md:w-1/4 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shrink-0 transition-colors duration-300">
          <div className="p-6 pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h2>
          </div>
          <nav className="flex flex-col py-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'border-l-2 border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white'
                    : 'border-l-2 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Icon size={18} className={activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'} />
                  <span className="hidden md:block">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 md:p-12 dark:bg-slate-900 transition-colors duration-300">
          {activeTab === 'edit_profile' && (
            <div className="max-w-xl animate-in fade-in transition-colors">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 shadow-inner">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800">
                      {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.name || user?.fullName || 'User'}</h3>
                  <div className="relative mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploadingImage}
                    />
                    <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-2">
                      {isUploadingImage && <Loader className="w-4 h-4 animate-spin" />}
                      Change profile photo
                    </button>
                  </div>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleUpdateProfile}>
                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Name</label>
                  <input type="text" name="name" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none transition-colors" defaultValue={user?.name || user?.fullName || ''} />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Help people discover your account by using the name you're known by: either your full name, nickname, or business name.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Bio</label>
                  <textarea name="about" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-500 outline-none min-h-[100px] transition-colors" defaultValue={user?.about || user?.companyDescription || ''} placeholder="Write a short bio about yourself..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Email</label>
                  <input type="email" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed transition-colors" defaultValue={user?.email || ''} readOnly />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" disabled={isUpdating} className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2">
                    {isUpdating && <Loader className="w-4 h-4 animate-spin" />}
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-xl animate-in fade-in">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Bell className="text-indigo-600 dark:text-indigo-400" /> Notification Preferences</h3>

              <div className="space-y-6">
                {[
                  { title: "Email Notifications", desc: "Receive email updates about your account activity." },
                  { title: "Push Notifications", desc: "Get push notifications on your device." },
                  { title: "Job Alerts", desc: "Daily digest of jobs matching your profile." },
                  { title: "Messages", desc: "When employers or candidates send you a direct message." }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={i % 2 === 0} />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="max-w-xl animate-in fade-in">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Lock className="text-indigo-600 dark:text-indigo-400" /> Privacy & Security</h3>

              <div className="space-y-6">
                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Account Privacy</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">When your account is public, your profile and posts can be seen by anyone, on or off JobHunt.</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-indigo-600 dark:text-indigo-500 rounded-md border-gray-300 dark:border-gray-600 focus:ring-indigo-600 dark:focus:ring-indigo-500 bg-white dark:bg-slate-700" />
                    <span className="font-medium text-slate-700 dark:text-slate-300">Private Account</span>
                  </label>
                </div>

                <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Change Password</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">It's a good idea to use a strong password that you're not using elsewhere.</p>
                  <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm shadow-sm">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="max-w-xl animate-in fade-in">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><Eye className="text-indigo-600 dark:text-indigo-400" /> Appearance</h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => toggleDarkMode(false)}
                  className={`p-6 bg-white dark:bg-slate-800/80 border-2 rounded-xl flex flex-col items-center gap-3 relative overflow-hidden transition-all ${!isDarkMode ? 'border-indigo-600 dark:border-indigo-500 shadow-md scale-[1.02]' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 scale-100'
                    }`}
                >
                  {!isDarkMode && <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shadow-sm">✓</div>}
                  <div className="w-16 h-12 bg-slate-100 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center">
                    <div className="w-8 h-2 bg-slate-300 dark:bg-slate-800 rounded-full"></div>
                  </div>
                  <span className={`font-bold block mt-2 ${!isDarkMode ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>Light Mode</span>
                </button>

                <button
                  onClick={() => toggleDarkMode(true)}
                  className={`p-6 bg-slate-900 border-2 rounded-xl flex flex-col items-center gap-3 relative overflow-hidden transition-all ${isDarkMode ? 'border-indigo-500 shadow-md shadow-indigo-500/10 scale-[1.02]' : 'border-transparent hover:border-slate-700 scale-100'
                    }`}
                >
                  {isDarkMode && <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs shadow-sm">✓</div>}
                  <div className="w-16 h-12 bg-slate-800 rounded-md border border-slate-700 shadow-inner flex items-center justify-center">
                    <div className="w-8 h-2 bg-slate-600 rounded-full"></div>
                  </div>
                  <span className={`font-bold block mt-2 ${isDarkMode ? 'text-indigo-400' : 'text-white'}`}>Dark Mode</span>
                </button>
              </div>
            </div>
          )}

          {!['edit_profile', 'notifications', 'privacy', 'appearance'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 animate-in fade-in transition-colors">
              <HelpCircle size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p className="text-sm">These settings are currently in development.</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Settings;
