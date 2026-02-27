import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase } from 'lucide-react'
import { useNavigate } from 'react-router-dom'


import { useAuth } from '../../../context/AuthContext';

const Header = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (typeof user?.logout === 'function') await user.logout(); // or auth context logout
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  }
  return <header>
    <div className='container mx-auto px-4'>
      <div className='flex items-center justify-between h-16'>
        {/* logo */}
        <div className='flex items-center space-x-3'>
          <div className='w-8 h-8 bg-linear-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center'>
            <Briefcase className='w-5 h-5 text-white' />
          </div>
          <span className='text-xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>ConnectX</span>
        </div>
        {/* Navigation linkes -hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-8">
          <a onClick={() => navigate(isAuthenticated ? '/search' : '/login')} className='text-gray-600 hover:text-blue-600 transition-colors cursor-pointer'>
            Find jobs
          </a>
          <a onClick={() =>
            navigate(
              isAuthenticated ? (user?.role === "employer" ? "/employer-dashboard" : "/dashboard") : "/login"
            )} className='text-gray-600 hover:text-blue-600 transition-colors cursor-pointer'>
            For Employers
          </a>
        </nav>
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <div className='flex items-center space-x-3'>
              <span className='text-gray-600 hover:text-blue-600 transition-colors cursor-pointer'> Welcome, {user?.name}</span>
              <button onClick={() => navigate(
                user?.role === "employer" ? "/employer-dashboard" : "/dashboard"
              )} className='bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm hover:shadow-md'>Dashboard</button>
            </div>
          ) : (
            <>
              <a href="/login" className='text-gray-600 transition-colors 
              font-medium px-4 py-2 rounded-lg hover:bg-gray-50 cursor-pointer'>Login</a>
              <a href="/signup" className='bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-2 hover:to-purple-700 font-medium rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-sm hover:shadow-md'>Signup</a>
            </>

          )}
        </div>
      </div>
    </div>
  </header>
}

export default Header