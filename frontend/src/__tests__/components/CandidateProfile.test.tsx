/**
 * API Integration Test Examples
 * Using Jest + React Testing Library
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CandidateProfile as CandidateProfileModel } from '@/core/services/candidate.service'
import { ApiError } from '@/core/services/api/errors'

jest.mock('@/core/services/candidate.service', () => ({
  getCandidateProfile: jest.fn(),
}))

const CandidateProfile = require('@/components/candidate/CandidateProfile').default
const candidateService = require('@/core/services/candidate.service')

describe('CandidateProfile Component', () => {
  const mockProfile: CandidateProfileModel = {
    id: '1',
    userId: 'user-1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    headline: 'Senior Developer',
    location: 'San Francisco',
    bio: 'Passionate about building great software',
    profileImage: 'https://example.com/avatar.jpg',
    skills: ['JavaScript', 'React', 'Node.js'],
    education: [
      {
        id: 'edu-1',
        school: 'Stanford University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2015-09-01',
        endDate: '2019-05-31',
      },
    ],
    experience: [
      {
        id: 'exp-1',
        title: 'Senior Developer',
        company: 'Tech Company',
        description: 'Led development team',
        startDate: '2020-01-01',
        endDate: '2024-05-21',
        current: true,
      },
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-05-21',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading skeleton initially', () => {
    ;(candidateService.getCandidateProfile as jest.Mock).mockReturnValueOnce(
      new Promise(() => {}) // Never resolves
    )

    render(<CandidateProfile />)
    expect(screen.getByTestId('profile-skeleton')).toBeInTheDocument()
  })

  it('renders profile data on successful fetch', async () => {
    ;(candidateService.getCandidateProfile as jest.Mock).mockResolvedValueOnce(
      mockProfile
    )

    render(<CandidateProfile />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getAllByText('Senior Developer').length).toBeGreaterThan(0)
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })
  })

  it('renders error state with retry button', async () => {
    const error = new ApiError({
      code: 'FETCH_ERROR',
      message: 'Failed to fetch profile',
      statusCode: 500,
    })

    ;(candidateService.getCandidateProfile as jest.Mock).mockRejectedValueOnce(
      error
    )

    render(<CandidateProfile />)

    await waitFor(() => {
      expect(screen.getByText(/unable to load profile/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })
  })

  it('retries fetch when retry button clicked', async () => {
    const error = new ApiError({
      code: 'FETCH_ERROR',
      message: 'Network error',
      statusCode: 0,
    })

    ;(candidateService.getCandidateProfile as jest.Mock)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(mockProfile)

    render(<CandidateProfile />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    // Click retry
    const retryButton = screen.getByRole('button', { name: /try again/i })
    await userEvent.click(retryButton)

    // Should render success state
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('renders empty state when profile is null', async () => {
    ;(candidateService.getCandidateProfile as jest.Mock).mockResolvedValueOnce(
      null
    )

    render(<CandidateProfile />)

    await waitFor(() => {
      expect(screen.getByText(/no profile found/i)).toBeInTheDocument()
    })
  })

  it('displays validation errors when present', async () => {
    const validationError = new ApiError({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      statusCode: 422,
      details: {
        fields: {
          email: 'Invalid email format',
          phone: 'Phone number too short',
        },
      },
    })

    ;(candidateService.getCandidateProfile as jest.Mock).mockRejectedValueOnce(
      validationError
    )

    render(<CandidateProfile />)

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
      expect(screen.getByText(/phone number too short/i)).toBeInTheDocument()
    })
  })

  it('renders skills section with all skills', async () => {
    ;(candidateService.getCandidateProfile as jest.Mock).mockResolvedValueOnce(
      mockProfile
    )

    render(<CandidateProfile />)

    await waitFor(() => {
      mockProfile.skills.forEach((skill) => {
        expect(screen.getByText(skill)).toBeInTheDocument()
      })
    })
  })

  it('renders education section with all entries', async () => {
    ;(candidateService.getCandidateProfile as jest.Mock).mockResolvedValueOnce(
      mockProfile
    )

    render(<CandidateProfile />)

    await waitFor(() => {
      expect(screen.getByText('Stanford University')).toBeInTheDocument()
      expect(screen.getByText('Bachelor of Science')).toBeInTheDocument()
    })
  })

  it('renders experience section with all entries', async () => {
    ;(candidateService.getCandidateProfile as jest.Mock).mockResolvedValueOnce(
      mockProfile
    )

    render(<CandidateProfile />)

    await waitFor(() => {
      expect(screen.getAllByText('Senior Developer').length).toBeGreaterThan(0)
      expect(screen.getByText('Tech Company')).toBeInTheDocument()
      expect(screen.getByText(/present/i)).toBeInTheDocument()
    })
  })
})
