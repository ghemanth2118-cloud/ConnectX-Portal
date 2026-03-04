import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CATEGORIES, JOB_TYPES } from '../../Utils/data';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, AlignLeft, Send, CheckCircle2, Eye, Edit2, Building2, CircleDollarSign, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const JobPostingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    category: CATEGORIES[0].value,
    type: JOB_TYPES[0].value,
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    deadline: "",
    capacity: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Job Title is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";

    if (formData.salaryMin && formData.salaryMax && Number(formData.salaryMin) > Number(formData.salaryMax)) {
      newErrors.salaryMax = "Maximum salary must be greater than minimum salary";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(API_PATHS.JOBS.POST_JOB, formData);
      if (response.status === 201 || response.status === 200) {
        toast.success("Job posted successfully!");
        setSuccess(true);
        setTimeout(() => {
          navigate("/manage-jobs");
        }, 2000);
      }
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error(error.response?.data?.message || "Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (success) {
    return (
      <DashboardLayout activeMenu="post-jobs">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Job Posted Successfully!</h2>
          <p className="text-slate-500 mb-6">Your job listing is now live and visible to candidates.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Verification Blocker
  const isProfileComplete = user?.companyName && user?.companyDescription && user?.companyLogo && user?.companyCertificate;

  if (!isProfileComplete) {
    return (
      <DashboardLayout activeMenu="post-jobs">
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center px-4">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200">
            <AlertTriangle className="w-12 h-12 text-amber-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Company Verification Required</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            To ensure trust and safety for all Job Seekers, you must complete your company profile and upload your <b>Official Registration Certificate</b> before posting any jobs.
          </p>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full mb-8 text-left shadow-inner">
            <h3 className="font-bold text-slate-900 mb-4 tracking-wide text-sm uppercase">Missing Information:</h3>
            <ul className="space-y-3">
              <li className={`flex items-center gap-3 font-semibold ${user?.companyName ? 'text-emerald-600' : 'text-slate-500'}`}>
                {user?.companyName ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 ml-0.5" />}
                Company Name
              </li>
              <li className={`flex items-center gap-3 font-semibold ${user?.companyDescription ? 'text-emerald-600' : 'text-slate-500'}`}>
                {user?.companyDescription ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 ml-0.5" />}
                Company Description
              </li>
              <li className={`flex items-center gap-3 font-semibold ${user?.companyLogo ? 'text-emerald-600' : 'text-slate-500'}`}>
                {user?.companyLogo ? <CheckCircle2 size={18} /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300 ml-0.5" />}
                Company Logo
              </li>
              <li className={`flex items-center gap-3 font-semibold ${user?.companyCertificate ? 'text-emerald-600' : 'text-red-500'}`}>
                {user?.companyCertificate ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} />}
                Registration Certificate (Document)
              </li>
            </ul>
          </div>

          <Link
            to="/employer-profile"
            className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105"
          >
            Complete Profile Now <ArrowRight size={18} />
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="post-jobs">
      <div className="max-w-4xl mx-auto pb-10">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
            <p className="text-slate-500 mt-1">Fill out the form below to create your job posting.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            {isPreview ? <><Edit2 size={16} /> Edit Form</> : <><Eye size={16} /> Preview</>}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isPreview ? (
            <div className="p-8">
              <div className="mb-8 pb-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl font-bold text-indigo-600 border border-indigo-100">
                    {user?.companyLogo ? <img src={user.companyLogo} className="w-full h-full object-cover rounded-2xl" alt="Company Logo" /> : <Building2 size={24} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{formData.title || 'Job Title'}</h2>
                    <p className="text-indigo-600 font-medium mt-1">{user?.companyName || 'Your Company Name'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                    <MapPin size={16} className="text-slate-400" />
                    {formData.location || 'Location'}
                  </span>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1.5">
                    <Briefcase size={16} className="text-slate-400" />
                    {JOB_TYPES.find(t => t.value === formData.type)?.label || 'Job Type'}
                  </span>
                  {(formData.salaryMin || formData.salaryMax) && (
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-bold flex items-center gap-1.5 border border-green-200">
                      <CircleDollarSign size={16} className="text-green-600" />
                      ${formData.salaryMin || '0'} - ${formData.salaryMax || 'Any'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Job Description</h3>
                <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">{formData.description || 'Description will appear here...'}</p>
              </div>

              {formData.requirements && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Requirements</h3>
                  <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">{formData.requirements}</p>
                </div>
              )}

              <div className="mt-10 pt-6 flex items-center justify-end gap-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={18} /> Keep Editing
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>{isSubmitting ? "Posting..." : "Publish Job Post"}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Basic Info Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Job Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g. Senior Frontend Developer"
                      className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.title ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"} focus:ring-4 outline-none transition-all`}
                    />
                    {errors.title && <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Location *</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. New York, NY or Remote"
                        className={`w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border ${errors.location ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"} focus:ring-4 outline-none transition-all`}
                      />
                    </div>
                    {errors.location && <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Job Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {JOB_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Salary Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full font-bold text-sm">$</span>
                  Salary Range (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Minimum Salary</label>
                    <input
                      type="number"
                      name="salaryMin"
                      value={formData.salaryMin}
                      onChange={handleInputChange}
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Maximum Salary</label>
                    <input
                      type="number"
                      name="salaryMax"
                      value={formData.salaryMax}
                      onChange={handleInputChange}
                      placeholder="e.g. 80000"
                      className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.salaryMax ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"} focus:ring-4 outline-none transition-all`}
                    />
                    {errors.salaryMax && <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.salaryMax}</p>}
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Deadline & Capacity Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full font-bold text-sm">#</span>
                  Hiring Metrics (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Application Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Open Seats (Capacity)</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      placeholder="e.g. 5"
                      min="1"
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Details Section */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <AlignLeft className="w-5 h-5 text-indigo-600" />
                  Job Details
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Job Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Describe the role, responsibilities, and expectations..."
                      className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.description ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"} focus:ring-4 outline-none transition-all resize-none`}
                    ></textarea>
                    {errors.description && <p className="text-red-500 text-xs font-medium ml-1 mt-1">{errors.description}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Requirements (Optional)</label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="List the skills, experience, and qualifications needed..."
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/employer-dashboard')}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>{isSubmitting ? "Posting..." : "Post Job"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobPostingForm;