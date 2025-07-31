import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Loading from './Loading'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loading text="Checking authentication..." />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute