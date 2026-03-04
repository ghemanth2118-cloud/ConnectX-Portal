import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  EyeOff,
  Eye,
  Loader,
  Briefcase,
  CheckCircle,
  ArrowRight,
  UserPlus,
  Upload,
} from "lucide-react"
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword, validateAvatar } from '../../Utils/helper';
import axiosInstance from '../../Utils/axiosinstance';
import { API_PATHS } from '../../Utils/apiPaths';
import { GoogleLogin } from '@react-oauth/google';

const SignUp = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    role: "jobSeeker", // jobSeeker or employer
    fullName: "",
    email: "",
    password: "",
    profileImage: null
  });

  const [formState, setFormState] = useState({
    loading: false,
    success: false,
    showPassword: false,
    errors: {}
  })

  // Google OAuth state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);

  // Validation function
  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full Name is required";

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    const avatarError = validateAvatar(formData.profileImage);
    if (avatarError) errors.profileImage = avatarError;

    setFormState(prev => ({ ...prev, errors: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (formState.errors[name]) {
      setFormState(prev => ({ ...prev, errors: { ...prev.errors, [name]: "" } }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateAvatar(file);
      if (error) {
        toast.error(error);
        return;
      }
      setFormData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      let avatarUrl = '';

      if (formData.profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.profileImage);

        try {
          // Do not use interceptor for the upload during signup since we don't have a token.
          // Fallback to basic axios or just rely on axiosInstance knowing it shouldn't fail if no token is needed.
          const uploadRes = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          avatarUrl = uploadRes.data.imageUrl;
        } catch (uploadError) {
          console.error("Image upload failed", uploadError);
          toast.error("Failed to upload image. Trying to register without avatar...");
        }
      }

      // Prepare payload
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        avatar: avatarUrl
      };

      const response = await register(payload);

      if (response.success) {
        setFormState(prev => ({ ...prev, loading: false, success: true }));
        // Toast is handled in AuthContext, but we can add specific message if needed

        // Redirect logic
        setTimeout(() => {
          navigate(response.user.role === 'employer' ? '/employer-dashboard' : '/find-job');
        }, 1500);
      } else {
        setFormState(prev => ({ ...prev, loading: false }));
        // Error toast handled in AuthContext mostly, but if we want to show generic error
      }

    } catch (error) {
      setFormState(prev => ({ ...prev, loading: false }));
      console.error("Signup submit error", error);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setFormState(prev => ({ ...prev, loading: true }));
    try {
      const response = await googleLogin(credentialResponse.credential);

      if (response.needRole) {
        setFormState(prev => ({ ...prev, loading: false }));
        setGoogleCredential(credentialResponse.credential);
        setShowRoleModal(true);
      } else if (response.success) {
        setFormState(prev => ({ ...prev, loading: false, success: true }));
        setTimeout(() => {
          navigate(response.user?.role === 'employer' ? '/employer-dashboard' : '/dashboard');
        }, 1500);
      } else {
        setFormState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error(error);
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  const finalizeGoogleAuth = async (role) => {
    try {
      setShowRoleModal(false);
      setFormState(prev => ({ ...prev, loading: true }));
      const response = await googleLogin(googleCredential, role);
      if (response.success) {
        setFormState(prev => ({ ...prev, loading: false, success: true }));
        setTimeout(() => {
          navigate(response.user?.role === 'employer' ? '/employer-dashboard' : '/dashboard');
        }, 1500);
      } else {
        setFormState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error(error);
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  const shakeVariant = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    animate: (hasError) => hasError ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } : {}
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-urbanist relative overflow-hidden">
      {/* Decorative Background - Purple/Pink Theme */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-pink-200 rounded-full blur-[100px] opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-purple-200/50 w-full max-w-lg relative z-10 border border-gray-100 my-10"
      >
        <AnimatePresence mode="wait">
          {!formState.success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/20 mb-6">
                  <UserPlus className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Create Account
                </h2>
                <p className="text-gray-500">
                  Join thousands of professionals today
                </p>
              </div>

              <form className='space-y-6' onSubmit={handleSubmit}>
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Full Name *</label>
                  <motion.div className="relative group" variants={shakeVariant} animate="animate" custom={!!formState.errors.fullName}>
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-5 h-5 ${formState.errors.fullName ? "text-red-500" : "text-gray-400 group-focus-within:text-purple-500"}`} />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border ${formState.errors.fullName ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"} focus:ring-4 outline-none transition-all font-medium`}
                      placeholder="Enter your full name"
                    />
                  </motion.div>
                  {formState.errors.fullName && (
                    <p className="text-red-500 text-xs font-medium ml-1 mt-1">{formState.errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email Address *</label>
                  <motion.div className="relative group" variants={shakeVariant} animate="animate" custom={!!formState.errors.email}>
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-5 h-5 ${formState.errors.email ? "text-red-500" : "text-gray-400 group-focus-within:text-purple-500"}`} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border ${formState.errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"} focus:ring-4 outline-none transition-all font-medium`}
                      placeholder="Enter your email"
                    />
                  </motion.div>
                  {formState.errors.email && (
                    <p className="text-red-500 text-xs font-medium ml-1 mt-1">{formState.errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password *</label>
                  <motion.div className="relative group" variants={shakeVariant} animate="animate" custom={!!formState.errors.password}>
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-5 h-5 ${formState.errors.password ? "text-red-500" : "text-gray-400 group-focus-within:text-purple-500"}`} />
                    <input
                      type={formState.showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 rounded-xl border ${formState.errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"} focus:ring-4 outline-none transition-all font-medium`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {formState.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </motion.div>
                  {formState.errors.password && (
                    <p className="text-red-500 text-xs font-medium ml-1 mt-1">{formState.errors.password}</p>
                  )}
                </div>

                {/* Profile Picture (Optional - currently UI only until backend supports upload on register or separate endpoint) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Profile Picture (Optional)</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                      {formData.profileImage ? (
                        <img src={URL.createObjectURL(formData.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full h-16 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors hover:border-purple-400 group">
                        <div className="flex items-center space-x-2">
                          <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                          <span className="text-sm text-gray-500 group-hover:text-gray-700 font-medium">Upload Photo</span>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                      <p className="text-xs text-gray-400 mt-1.5 ml-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>
                  {formState.errors.profileImage && (
                    <p className="text-red-500 text-xs font-medium ml-1 mt-1">{formState.errors.profileImage}</p>
                  )}
                </div>

                {/* Role Selection - Cards */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">I am a *</label>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, role: "jobSeeker" }))}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col items-center space-y-3 ${formData.role === "jobSeeker"
                        ? "border-purple-600 bg-purple-50/50"
                        : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className={`p-3 rounded-full ${formData.role === "jobSeeker" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`block font-bold text-base ${formData.role === "jobSeeker" ? "text-purple-900" : "text-gray-900"}`}>Job Seeker</span>
                        <span className="text-xs text-gray-500 mt-1 block">Looking for opportunities</span>
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, role: "employer" }))}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col items-center space-y-3 ${formData.role === "employer"
                        ? "border-purple-600 bg-purple-50/50"
                        : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                        }`}
                    >
                      <div className={`p-3 rounded-full ${formData.role === "employer" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`block font-bold text-base ${formData.role === "employer" ? "text-purple-900" : "text-gray-900"}`}>Recruiter</span>
                        <span className="text-xs text-gray-500 mt-1 block">Hiring talent</span>
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={formState.loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center justify-center transition-all duration-300 mt-6"
                >
                  {formState.loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </motion.button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm font-medium leading-6">
                    <span className="bg-white px-6 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Sign Up failed')}
                    useOneTap
                    shape="pill"
                  />
                </div>

                <div className="text-center pt-2">
                  <p className="text-gray-600 font-medium">
                    Already have an account?{" "}
                    <Link to="/login" className="bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold hover:opacity-80 transition-opacity">
                      Log In
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="py-12 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={3} />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {formData.fullName.split(" ")[0]}!
              </h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                Account Created Successfully.
              </p>

              <Link
                to="/login"
                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Go to Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Google Role Selection Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Select Your Role</h3>
              <p className="text-gray-500 text-center mb-8">How do you want to use JobHunt?</p>

              <div className="space-y-4">
                <button
                  onClick={() => finalizeGoogleAuth('jobSeeker')}
                  className="w-full flex items-center p-4 border-2 border-purple-100 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-bold text-gray-900">Job Seeker</p>
                    <p className="text-xs text-gray-500">I want to find a job</p>
                  </div>
                </button>

                <button
                  onClick={() => finalizeGoogleAuth('employer')}
                  className="w-full flex items-center p-4 border-2 border-pink-100 rounded-2xl hover:border-pink-500 hover:bg-pink-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-bold text-gray-900">Recruiter</p>
                    <p className="text-xs text-gray-500">I want to hire talent</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowRoleModal(false)}
                className="mt-6 w-full text-center text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SignUp
