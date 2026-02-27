import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, X, CircleAlert } from 'lucide-react';
import moment from 'moment';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.NOTIFICATIONS.GET_ALL);
      if (res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up polling or websocket here ideally
    // For now, poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await axiosInstance.put(API_PATHS.NOTIFICATIONS.MARK_READ(id));
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.put(API_PATHS.NOTIFICATIONS.MARK_ALL_READ);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-full relative transition-colors ${isOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm ring-2 ring-red-500/20 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors relative group cursor-pointer ${!notification.read ? 'bg-indigo-50/30' : ''
                    }`}
                  onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                >
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                  )}

                  <div className="flex gap-3 items-start">
                    {/* Icon based on type */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${notification.type === 'follow' ? 'bg-purple-100 text-purple-600' :
                        notification.type === 'application' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-blue-100 text-blue-600'
                      }`}>
                      {notification.sender?.profileImage ? (
                        <img src={notification.sender.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <CircleAlert size={14} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                        {notification.message}
                      </p>
                      <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 mt-1">
                        <Clock size={10} /> {moment(notification.createdAt).fromNow()}
                      </span>
                    </div>

                    {/* Action button */}
                    {!notification.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        className="opacity-0 group-hover:opacity-100 absolute right-4 top-4 p-1 rounded-full text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell size={20} className="text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">When you get notifications, they'll show up here.</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 text-center bg-slate-50/50">
              <span className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
                View all
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
