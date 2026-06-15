/**
 * Candidate Profile Service
 *
 * Pure API functions with NO React dependencies.
 * These functions can be used in any context (React, Vue, plain JS, etc.)
 */

import apiClient from './api/apiClient'
import { ApiError } from './api/errors'

type ApiEnvelope<T> = T | { data?: T }

const unwrapData = <T>(response: ApiEnvelope<T>): T => {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data as T
  }

  return response as T
}

/**
 * Data Models/Types
 */
export interface Education {
  id: string
  school: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
}

export interface Experience {
  id: string
  title: string
  company: string
  description: string
  startDate: string
  endDate: string
  current: boolean
}

export interface CandidateProfile {
  id: string
  userId: string
  fullName: string
  email: string
  phone?: string
  location?: string
  headline?: string
  bio?: string
  profileImage?: string
  skills: string[]
  education: Education[]
  experience: Experience[]
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileDto {
  fullName?: string
  phone?: string
  location?: string
  headline?: string
  bio?: string
  skills?: string[]
}

/**
 * GET /api/candidate/profile
 *
 * Fetch current user's candidate profile
 *
 * @returns Promise resolving to CandidateProfile
 * @throws ApiError with code 'UNAUTHORIZED' if not logged in
 * @throws ApiError with code 'NOT_FOUND' if profile doesn't exist
 *
 * @example
 * try {
 *   const profile = await getCandidateProfile()
 *   console.log(profile.fullName)
 * } catch (error) {
 *   if (error instanceof ApiError && error.isCode('NOT_FOUND')) {
 *     console.log('Profile not found')
 *   }
 * }
 */
export async function getCandidateProfile(): Promise<CandidateProfile | null> {
  try {
    const response = await apiClient.get('/candidate/profile')

    const profile = unwrapData<CandidateProfile | null>(response)
    if (!profile) {
      throw new ApiError({
        code: 'INVALID_RESPONSE',
        message: 'Invalid response format from server',
        statusCode: 500,
      })
    }

    return profile
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error
    }

    // Convert generic errors to ApiError
    throw new ApiError({
      code: 'FETCH_PROFILE_ERROR',
      message: 'Failed to fetch candidate profile',
      statusCode: error.statusCode || 500,
      details: error,
    })
  }
}

/**
 * GET /api/candidate/profile/:id
 *
 * Fetch a candidate profile by ID (for viewing other profiles)
 *
 * @param id - Candidate ID
 * @returns Promise resolving to CandidateProfile
 * @throws ApiError with code 'NOT_FOUND' if profile doesn't exist
 *
 * @example
 * const profile = await getCandidateProfileById('candidate-123')
 */
export async function getCandidateProfileById(id: string): Promise<CandidateProfile> {
  const response = await apiClient.get(`/candidate/profile/${id}`)
  return unwrapData<CandidateProfile>(response)
}

/**
 * PUT /api/candidate/profile
 *
 * Update current user's candidate profile
 *
 * @param data - Profile fields to update
 * @returns Promise resolving to updated CandidateProfile
 * @throws ApiError with code 'VALIDATION_ERROR' if input invalid
 *
 * @example
 * const updated = await updateCandidateProfile({
 *   fullName: 'John Doe',
 *   headline: 'Senior Developer',
 *   skills: ['JavaScript', 'React', 'Node.js']
 * })
 */
export async function updateCandidateProfile(
  data: UpdateProfileDto
): Promise<CandidateProfile> {
  const response = await apiClient.put('/candidate/profile', data)
  return unwrapData<CandidateProfile>(response)
}

/**
 * POST /api/candidate/profile/upload-avatar
 *
 * Upload profile avatar image
 *
 * @param file - Image file (JPEG, PNG, max 5MB)
 * @returns Promise resolving to URL of uploaded image
 * @throws ApiError with code 'VALIDATION_ERROR' if file invalid
 *
 * @example
 * const file = event.target.files[0]
 * const imageUrl = await uploadProfileAvatar(file)
 */
export async function uploadProfileAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await apiClient.post('/candidate/profile/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return unwrapData<{ imageUrl: string }>(response).imageUrl
}

/**
 * POST /api/candidate/profile/education
 *
 * Add education entry to profile
 *
 * @param education - Education data
 * @returns Promise resolving to updated CandidateProfile
 */
export async function addEducation(education: Omit<Education, 'id'>): Promise<Education> {
  const response = await apiClient.post('/candidate/profile/education', education)
  return unwrapData<Education>(response)
}

/**
 * PUT /api/candidate/profile/education/:id
 *
 * Update education entry
 *
 * @param id - Education ID
 * @param education - Updated education data
 * @returns Promise resolving to updated Education
 */
export async function updateEducation(
  id: string,
  education: Partial<Omit<Education, 'id'>>
): Promise<Education> {
  const response = await apiClient.put(`/candidate/profile/education/${id}`, education)
  return unwrapData<Education>(response)
}

/**
 * DELETE /api/candidate/profile/education/:id
 *
 * Remove education entry
 *
 * @param id - Education ID
 * @returns Promise resolving when deleted
 */
export async function deleteEducation(id: string): Promise<void> {
  await apiClient.delete(`/candidate/profile/education/${id}`)
}

/**
 * POST /api/candidate/profile/experience
 *
 * Add work experience entry
 *
 * @param experience - Experience data
 * @returns Promise resolving to created Experience
 */
export async function addExperience(
  experience: Omit<Experience, 'id'>
): Promise<Experience> {
  const response = await apiClient.post('/candidate/profile/experience', experience)
  return unwrapData<Experience>(response)
}

/**
 * PUT /api/candidate/profile/experience/:id
 *
 * Update experience entry
 *
 * @param id - Experience ID
 * @param experience - Updated experience data
 * @returns Promise resolving to updated Experience
 */
export async function updateExperience(
  id: string,
  experience: Partial<Omit<Experience, 'id'>>
): Promise<Experience> {
  const response = await apiClient.put(`/candidate/profile/experience/${id}`, experience)
  return unwrapData<Experience>(response)
}

/**
 * DELETE /api/candidate/profile/experience/:id
 *
 * Remove experience entry
 *
 * @param id - Experience ID
 * @returns Promise resolving when deleted
 */
export async function deleteExperience(id: string): Promise<void> {
  await apiClient.delete(`/candidate/profile/experience/${id}`)
}
