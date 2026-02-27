import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar, MapPin, Users, Plus, Star, X, Loader } from 'lucide-react';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import toast from 'react-hot-toast';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    organizer: "",
    price: "",
    imageFile: null
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_PATHS.EVENTS.GET_EVENTS);
      if (res.data?.success && res.data.data.length > 0) {
        setEvents(res.data.data);
      } else {
        setEvents([]); // Clean state if no events
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
      // Optional fallback for demonstration purposes if DB is empty/failing on fresh starts
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imageFile") {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location || !formData.organizer) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    let uploadedImageUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60';

    try {
      if (formData.imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.imageFile);
        try {
          // Avoid the interceptor appending missing tokens if user is somehow logged out
          const uploadRes = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedImageUrl = uploadRes.data.imageUrl;
        } catch (uploadErr) {
          console.error("Image upload failed", uploadErr);
          toast.error("Image upload failed, using default.");
        }
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        organizer: formData.organizer,
        price: Number(formData.price) || 0,
        imageUrl: uploadedImageUrl
      };

      const res = await axiosInstance.post(API_PATHS.EVENTS.CREATE_EVENT, payload);
      if (res.data.success) {
        toast.success("Event created successfully!");
        setEvents(prev => [...prev, res.data.data]);
        setIsModalOpen(false);
        setFormData({ title: "", description: "", date: "", location: "", organizer: "", price: "", imageFile: null });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout activeMenu="events">
      <div className="flex flex-col gap-6 relative pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discover Events</h1>
            <p className="text-slate-500 mt-1">Find networking opportunities, career fairs, and webinars.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shadow-indigo-200"
          >
            <Plus size={18} />
            <span>Create Event</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event._id || Math.random()} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex flex-col">
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-yellow-500 transition-colors shadow-xs">
                      <Star size={18} />
                    </button>
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium text-slate-700 shadow-xs">
                      <Calendar size={14} className="text-indigo-600" />
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 flex-1">{event.title}</h3>
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg text-sm shrink-0">
                        {event.price && event.price > 0 ? `$${event.price}` : 'Free'}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-2">{event.description}</p>

                    <div className="mt-4 pt-4 border-t border-slate-100 flex-1 flex flex-col justify-end gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate">Organized by <span className="font-medium text-slate-700">{event.organizer}</span></span>
                      </div>
                    </div>

                    <a href={`/events/${event._id}`} className="mt-5 w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl transition-colors text-center block">
                      View Details
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Events Found</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Looks like there are no upcoming events at the moment. Create one to get started!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Create New Event</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full">
              <form onSubmit={handleCreateEvent} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Tech Career Fair 2026"
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Virtual or City, NY"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Organizer *</label>
                    <input
                      type="text"
                      name="organizer"
                      value={formData.organizer}
                      onChange={handleInputChange}
                      placeholder="e.g. ConnectX"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Ticket Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g. 0 for Free"
                      min="0"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Event Cover Image (Optional)</label>
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold file:px-4 file:py-1 file:rounded-lg file:mr-4 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Provide details about the event..."
                    className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none"
                    required
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 disabled:opacity-70 text-sm"
                  >
                    {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : null}
                    <span>{isSubmitting ? "Creating..." : "Create Event"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Events;
