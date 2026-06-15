/**
 * useCandidateProfile Hook
 *
 * Manages async state for fetching candidate profile.
 * Implements the 5-state pattern: idle, loading, error, empty, success
 *
 * Usage:
 * const { profile, isLoading, error, refetch } = useCandidateProfile()
 */

import { useState, useEffect, useCallback } from 'react'
import { getCandidateProfile, CandidateProfile } from '@/core/services/candidate.service'
import { ApiError } from '@/core/services/api/errors'

export interface UseCandidateProfileReturn {
  // Data
  profile: CandidateProfile | null

  // Loading states
  isLoading: boolean
  isValidating: boolean
  isSuccess: boolean

  // Error state
  error: ApiError | null

  // Actions
  refetch: () => Promise<void>
  reset: () => void
}

export function useCandidateProfile(): UseCandidateProfileReturn {
  // State
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  // Fetch profile
  const fetchProfile = useCallback(async (isRevalidate = false) => {
    try {
      if (isRevalidate) {
        setIsValidating(true)
      } else {
        setIsLoading(true)
      }

      setError(null)

      const data = await getCandidateProfile()
      setProfile(data)
    } catch (err: any) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        code: 'UNKNOWN_ERROR',
        message: err.message || 'Failed to fetch profile',
        statusCode: 500,
      })

      setError(apiError)
    } finally {
      if (isRevalidate) {
        setIsValidating(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchProfile(false)

    // Cleanup (optional)
    return () => {
      // Cancel any pending requests if needed
    }
  }, [fetchProfile])

  // Refetch action
  const refetch = useCallback(async () => {
    await fetchProfile(false)
  }, [fetchProfile])

  // Reset action
  const reset = useCallback(() => {
    setProfile(null)
    setError(null)
    setIsLoading(true)
  }, [])

  return {
    profile,
    isLoading,
    isValidating,
    isSuccess: !!profile && !error,
    error,
    refetch,
    reset,
  }
}

/**
 * useUpdateProfile Hook
 *
 * Manages state for updating candidate profile
 *
 * Usage:
 * const { isPending, error, mutate } = useUpdateProfile()
 * await mutate({ fullName: 'John Doe' })
 */

import { updateCandidateProfile, UpdateProfileDto } from '@/core/services/candidate.service'

export interface UseUpdateProfileReturn {
  isPending: boolean
  error: ApiError | null
  mutate: (data: UpdateProfileDto) => Promise<CandidateProfile>
}

export function useUpdateProfile(): UseUpdateProfileReturn {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const mutate = useCallback(async (data: UpdateProfileDto): Promise<CandidateProfile> => {
    try {
      setIsPending(true)
      setError(null)

      const updated = await updateCandidateProfile(data)
      return updated
    } catch (err: any) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        code: 'UPDATE_ERROR',
        message: 'Failed to update profile',
        statusCode: 500,
      })

      setError(apiError)
      throw apiError
    } finally {
      setIsPending(false)
    }
  }, [])

  return { isPending, error, mutate }
}

/**
 * useUploadAvatar Hook
 *
 * Manages state for uploading profile avatar
 */

import { uploadProfileAvatar } from '@/core/services/candidate.service'

export interface UseUploadAvatarReturn {
  isPending: boolean
  progress: number
  error: ApiError | null
  upload: (file: File) => Promise<string>
}

export function useUploadAvatar(): UseUploadAvatarReturn {
  const [isPending, setIsPending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<ApiError | null>(null)

  const upload = useCallback(async (file: File): Promise<string> => {
    try {
      setIsPending(true)
      setProgress(0)
      setError(null)

      // Simple progress simulation (would need real progress tracking)
      setProgress(50)

      const imageUrl = await uploadProfileAvatar(file)

      setProgress(100)
      return imageUrl
    } catch (err: any) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload avatar',
        statusCode: 500,
      })

      setError(apiError)
      throw apiError
    } finally {
      setIsPending(false)
      setTimeout(() => setProgress(0), 500)
    }
  }, [])

  return { isPending, progress, error, upload }
}
