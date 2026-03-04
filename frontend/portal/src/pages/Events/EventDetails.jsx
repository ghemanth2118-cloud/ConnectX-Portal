import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { Calendar, MapPin, Users, ArrowLeft, Heart, CreditCard, Share2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.EVENTS.GET_EVENT_BY_ID(id));
      if (res.data.success) {
        setEvent(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    toast.success(`Successfully enrolled in ${event.title}!`);
    // In a real app, this would hit a payment gateway or enrollment endpoint
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from Wishlist" : "Added to Wishlist");
  };

  const handleDeleteEvent = async () => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        setIsDeleting(true);
        const res = await axiosInstance.delete(API_PATHS.EVENTS.DELETE_EVENT(id));
        if (res.data.success) {
          toast.success("Event deleted successfully");
          navigate('/events');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete event');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="events">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout activeMenu="events">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-slate-800">Event Not Found</h2>
          <button onClick={() => navigate('/events')} className="mt-4 text-indigo-600 hover:underline">
            Back to Events
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="events">
      <div className="max-w-6xl mx-auto pb-16">
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Events</span>
        </button>

        {/* Hero Banner Section */}
        <div className="w-full h-64 md:h-96 rounded-3xl overflow-hidden relative shadow-lg shadow-slate-200">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-transparent to-transparent"></div>

          {/* Floating Price Tag */}
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg flex items-center gap-1">
            <span className="font-bold text-xl text-indigo-700">
              {event.price && event.price > 0 ? `$${event.price}` : 'Free'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">{event.title}</h1>

              <div className="flex flex-wrap items-center gap-4 md:gap-8 text-slate-600 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</p>
                    <p className="font-medium text-slate-800">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</p>
                    <p className="font-medium text-slate-800">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">About this Event</h3>
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-slate-600 text-lg">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sticky top-8 shadow-xl shadow-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Event Organization</h3>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Organized by</p>
                  <p className="text-base font-bold text-slate-900">{event.organizer}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleEnroll}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold transition-all shadow-md shadow-indigo-200"
                >
                  <CreditCard size={20} />
                  <span>Enroll & Pay Now</span>
                </button>

                <button
                  onClick={toggleWishlist}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold border-2 transition-all ${isWishlisted
                    ? "border-pink-200 bg-pink-50 text-pink-600 hover:bg-pink-100"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                  <span>{isWishlisted ? "Saved to Wishlist" : "Add to Wishlist"}</span>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <button className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                  <Share2 size={18} />
                  <span>Share Event</span>
                </button>
              </div>

              {user && event.creator && user._id === event.creator && (
                <div className="mt-6 pt-6 border-t border-red-100">
                  <button
                    onClick={handleDeleteEvent}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 w-full text-red-500 hover:text-red-600 hover:bg-red-50 py-3 rounded-xl font-medium transition-colors border border-red-100 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                    <span>{isDeleting ? "Deleting..." : "Delete Event"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventDetails;
