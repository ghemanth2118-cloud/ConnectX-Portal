import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoute = ({ requiredRole }) => {
  // will implement later
  return <Outlet />
};

export default ProtectedRoute