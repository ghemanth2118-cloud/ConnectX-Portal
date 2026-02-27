import React from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowRight, Users, TrendingUp, Building2, Briefcase, PlusCircle, Network } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'

const Hero = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const stats = [
    { icon: Users, value: "10k+", label: "Active candidates" },
    { icon: TrendingUp, value: "98%", label: "Companies" },
    { icon: Building2, value: "500+", label: "Jobs posted" }
  ]
  return (
    <section className="pt-24 pb-16 bg-white min-h-screen flex items-start">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight pt-10">
            Find Your Dream Job
            <span className="block bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Perfect Hire
            </span>
          </motion.h1>

          {/* Subheading */}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with top companies and find your dream job with ease.
          </motion.p>

          {/* Search bar & Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 justify-center mb-16">

            {!isAuthenticated ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                  className="group bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-medium rounded-lg flex shadow-sm hover:shadow-md 
                  hover:from-blue-700 hover:to-purple-700 transition-all duration-300 ease-in-out items-center justify-center space-x-3 hover:border-blue-500 cursor-pointer">
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="group bg-white text-gray-600 px-8 py-4 text-lg font-medium rounded-lg flex shadow-sm hover:shadow-md 
                  hover:bg-gray-50 transition-all duration-300 ease-in-out items-center justify-center space-x-3 cursor-pointer">
                  <Search className="w-5 h-5" />
                  <span>Find a job</span>
                </motion.button>
              </>
            ) : user?.role === "employer" ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/post-job')}
                  className="group bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-medium rounded-lg flex shadow-sm hover:shadow-md 
                  hover:from-blue-700 hover:to-purple-700 transition-all duration-300 ease-in-out items-center justify-center space-x-3 hover:border-blue-500 cursor-pointer">
                  <PlusCircle className="w-5 h-5" />
                  <span>Post a New Job</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/manage-jobs')}
                  className="group bg-white text-gray-600 px-8 py-4 text-lg font-medium rounded-lg flex shadow-sm hover:shadow-md 
                  hover:bg-gray-50 transition-all duration-300 ease-in-out items-center justify-center space-x-3 cursor-pointer">
                  <Briefcase className="w-5 h-5" />
                  <span>Manage Applicants</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/search')}
                  className="group bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-medium rounded-lg flex shadow-sm hover:shadow-md 
                  hover:from-blue-700 hover:to-purple-700 transition-all duration-300 ease-in-out items-center justify-center space-x-3 hover:border-blue-500 cursor-pointer">
                  <Search className="w-5 h-5" />
                  <span>Find Your Dream Job</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all duration-300 ease-in-out" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="group bg-white text-gray-600 px-8 py-4 text-lg font-medium rounded-lg flex shadow-sm hover:shadow-md 
                  hover:bg-gray-50 transition-all duration-300 ease-in-out items-center justify-center space-x-3 cursor-pointer">
                  <Network className="w-5 h-5" />
                  <span>Connect with Companies</span>
                </motion.button>
              </>
            )}

          </motion.div>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col md:flex-row justify-center items-center gap-12 mt-10"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.2 }}
                className="flex items-center gap-4"
              >
                {/* Icon box */}
                <div className="w-12 h-12 bg-linear-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>

                {/* Text */}
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
      {/* subtle Background Elements  */}
      {/* subtle Background Elements  */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-linear-to-r from-blue-600 to-purple-600 opacity-10 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 rounded-full bg-linear-to-r from-blue-600 to-purple-600 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-linear-to-l from-blue-600 to-purple-600 opacity-20 blur-3xl"></div>
      </div>

    </section>
  )
}

export default Hero