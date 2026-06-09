/**
 * Candidate Profile Page
 *
 * Route: /candidate/profile
 * Shows the current user's candidate profile
 */

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CandidateProfile from '@/components/candidate/CandidateProfile'
import { useAuthStore } from '@/core/store/auth.store'

export const CandidateProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const userRole = useAuthStore((state) => state.user?.role)

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Only candidates can view this page
    if (userRole && userRole !== 'candidate') {
      navigate('/')
      return
    }
  }, [isAuthenticated, userRole, navigate])

  if (!isAuthenticated || userRole !== 'candidate') {
    return null // Redirect in progress
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <a href="/" className="hover:text-blue-600">Home</a>
            <span>/</span>
            <span>Profile</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your professional information and career details</p>
        </div>
      </div>

      {/* Main Content */}
      <CandidateProfile />
    </div>
  )
}

export default CandidateProfilePage
