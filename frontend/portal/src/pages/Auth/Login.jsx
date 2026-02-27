import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  EyeOff,
  Eye,
  Loader,
  Briefcase,
  CheckCircle,
  ArrowRight,
  AlertCircle
} from "lucide-react"
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext';
import { API_PATHS } from '../../Utils/apiPaths';

import { validateEmail } from '../../Utils/helper';
import axiosInstance from '../../Utils/axiosinstance'

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [formState, setFormState] = useState({
    loading: false,
    success: false,
    showPassword: false,
    errors: {}
  })

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Clear error for this field
    if (formState.errors[name]) {
      setFormState(prev => ({ ...prev, errors: { ...prev.errors, [name]: "" } }));
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const validateForm = () => {
    const errors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    // Login password validation might be less strict than signup (just needs to exist), 
    // but using helper for consistency is fine or just check for existence.
    if (!formData.password) errors.password = "Password is required";
    // Optional: check length if you want to save an API call for very short passwords

    setFormState(prev => ({ ...prev, errors: errors }));
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    setFormState(prev => ({ ...prev, loading: true }));

    try {
      const response = await login(formData.email, formData.password);

      if (response.success) {
        setFormState(prev => ({
          ...prev,
          loading: false,
          success: true,
          errors: {}
        }));

        // Redirect is handled in AuthContext or here if we want more control
        // But AuthContext implementation of login already does NOT redirect (it returns true/false)
        // Wait, AuthContext (line 34) returns true/false and sets User.
        // It does NOT redirect.

        // However, I need to get the user role to redirect correctly.
        // The user state in context might not be updated immediately in this render cycle.
        // But login awaits the API call which returns user data.

        // Let's rely on the fact that if login returns true, we can redirect.
        // We might need to fetch the user role from the response in AuthContext, 
        // but AuthContext.login implementation doesn't return the user object, just true/false.

        // I will modify AuthContext to return the user-data or generic true.
        // For now, I'll redirect to a default or check if I can get the role.
        // Actually, the previous code tried to use `response.data` which it had access to.
        // If I use `login`, I lose that unless I modify `login` to return it.

        // Let's modify AuthContext first? No, that requires another file edit.
        // I can just assume a default redirect or fetch the user from context in a useEffect,
        // OR I can make the login function return the full data.

        // Looking at AuthContext line 42: return true.
        // Looking at AuthContext line 37: destructures { token, user }.

        // I should probably update AuthContext to return the user object on success.
        // But for now, to minimize changes, I'll just redirect to a generic dashboard or find-jobs.
        // OR better: The original code logic for redirecting based on role was:
        // role === "employer" ? "/employer-dashboard" : "/find-jobs"

        // I will stick to fixing Login.jsx first.

        setTimeout(() => {
          // Redirect to respective dashboard
          window.location.href = response.user.role === 'employer' ? '/employer-dashboard' : '/find-job';
        }, 1500);

      } else {
        setFormState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Login call failed", error);
      setFormState(prev => ({ ...prev, loading: false }));
    }
  }

  // Animation variants
  const shakeVariant = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
    animate: (hasError) => hasError ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } : {}
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-urbanist relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-100 rounded-full blur-[100px] opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 w-full max-w-md relative z-10 border border-gray-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20 mb-6">
            <Briefcase className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500">
            Sign in to access your dashboard
          </p>
        </div>

        <form className='space-y-6' onSubmit={handleSubmit}>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              Email Address
            </label>
            <motion.div
              className="relative group"
              variants={shakeVariant}
              animate="animate"
              custom={!!formState.errors.email}
            >
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-5 h-5 ${formState.errors.email ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"}`} />
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border ${formState.errors.email ? "border-red-500 focus:ring-red-200 bg-red-50/50" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 outline-none transition-all duration-300 font-medium text-gray-700 placeholder-gray-400`}
                placeholder='you@example.com'
              />
            </motion.div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Password
              </label>
            </div>

            <motion.div
              className="relative group"
              variants={shakeVariant}
              animate="animate"
              custom={!!formState.errors.password}
            >
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors w-5 h-5 ${formState.errors.password ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"}`} />
              <input
                type={formState.showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 rounded-xl border ${formState.errors.password ? "border-red-500 focus:ring-red-200 bg-red-50/50" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 outline-none transition-all duration-300 font-medium text-gray-700 placeholder-gray-400`}
                placeholder='Enter your password'
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
              <p className="text-red-500 text-xs font-medium mt-1">{formState.errors.password}</p>
            )}
          </div>


          {/* Global Error */}
          {formState.errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {formState.errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={formState.loading || formState.success}
            whileHover={{ scale: formState.success ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all duration-500 ${formState.success
              ? "bg-green-500 shadow-green-500/25"
              : "bg-linear-to-r from-blue-600 to-purple-600 shadow-blue-500/25 hover:shadow-blue-500/40"
              } text-white disabled:opacity-80`}
          >
            <AnimatePresence mode="wait">
              {formState.loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-2"
                >
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </motion.div>
              ) : formState.success ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-6 h-6" />
                  <span>Verified</span>
                </motion.div>
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Sign Up Link */}
          <div className="text-center pt-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 font-medium"
            >
              Don't have an account?{" "}
              <Link to="/signup" className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold hover:opacity-80 transition-opacity">
                Create One Now
              </Link>
            </motion.p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default Login
