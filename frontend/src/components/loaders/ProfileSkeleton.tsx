/**
 * Skeleton Loader Component
 * Used during loading state to prevent layout shift
 */

import React from 'react'

export const ProfileSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg animate-pulse">
    {/* Header skeleton */}
    <div className="flex items-center gap-4 mb-6">
      <div className="w-20 h-20 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>

    {/* Section skeletons */}
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
    </div>
  </div>
)

export const EducationListSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-2" />
      </div>
    ))}
  </div>
)
