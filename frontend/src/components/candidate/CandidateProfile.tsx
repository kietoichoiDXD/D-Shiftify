/**
 * CandidateProfile Component
 *
 * Main profile display component with 5-state rendering:
 * 1. Loading: Show skeleton screen
 * 2. Error: Show error message with retry button
 * 3. Empty: Show empty state with CTA
 * 4. Success: Show profile data
 * 5. Validation: Show validation errors
 */

import React, { useState } from 'react'
import { useCandidateProfile } from '@/hooks/useCandidateProfile'
import { ProfileSkeleton } from '@/components/loaders/ProfileSkeleton'

export const CandidateProfile: React.FC = () => {
  const { profile, isLoading, error, refetch } = useCandidateProfile()
  const [isEditing, setIsEditing] = useState(false)

  // STATE 1: LOADING
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <ProfileSkeleton />
      </div>
    )
  }

  // STATE 2: ERROR
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">⚠️</div>
            <div>
              <h2 className="text-lg font-semibold text-red-900">Unable to Load Profile</h2>
              <p className="text-red-700 mt-1">{error.getUserMessage()}</p>
            </div>
          </div>

          {/* Show field errors if validation error */}
          {error.isCode('VALIDATION_ERROR') && (
            <div className="bg-red-100 rounded p-3 mb-4">
              {Object.entries(error.getFieldErrors()).map(([field, message]) => (
                <p key={field} className="text-sm text-red-800">
                  <strong>{field}:</strong> {message}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>

          {/* Dev mode: Show full error details */}
          {import.meta.env.DEV && (
            <details className="mt-4 p-2 bg-red-100 rounded text-xs">
              <summary className="cursor-pointer font-mono">Error Details</summary>
              <pre className="mt-2 text-red-700">{JSON.stringify(error.toJSON(), null, 2)}</pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  // STATE 3: EMPTY
  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto p-12 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-6">Start building your professional profile to get discovered by employers</p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Your Profile
          </button>
        </div>
      </div>
    )
  }

  // STATE 4: SUCCESS
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              {profile.profileImage && (
                <img
                  src={profile.profileImage}
                  alt={profile.fullName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                <p className="text-gray-600">{profile.headline || 'No headline'}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {profile.location && `📍 ${profile.location}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            {profile.phone && (
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {profile.experience && profile.experience.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
            <div className="space-y-6">
              {profile.experience.map((exp) => (
                <div key={exp.id} className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-lg text-gray-900">{exp.title}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(exp.startDate).toLocaleDateString()} -{' '}
                    {exp.current ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Education</h2>
            <div className="space-y-4">
              {profile.education.map((edu) => (
                <div key={edu.id} className="border-l-4 border-green-600 pl-4">
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.school}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(edu.startDate).toLocaleDateString()} -{' '}
                    {new Date(edu.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CandidateProfile
