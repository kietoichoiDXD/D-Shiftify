import axiosClient from '@/core/services/axios-client'

export type TrainingCenterProfile = {
  id?: string
  name: string
  slogan: string
  phone: string
  email: string
  website: string
  address: string
  organizationType: string
  supportForDisabled: string
  partnerCompanies: string
  achievements: string
  licenseFile?: string
  logoUrl?: string
}

export type CourseInput = {
  title: string
  durationType: 'short_term' | 'medium_term' | 'long_term'
  startDate: string
  endDate: string
  mode: 'online' | 'offline' | 'hybrid'
  certificateOutput: string
  description: string
}

type Envelope<T> = { status: string; data: T }

export const trainingApi = {
  async getMine() {
    const response = (await axiosClient.get('/api/v1/training-center/me')) as Envelope<TrainingCenterProfile>
    return response.data
  },
  async save(profile: TrainingCenterProfile) {
    const response = (await axiosClient.put('/api/v1/training-center/me', profile)) as Envelope<TrainingCenterProfile>
    return response.data
  },
  async createCourse(course: CourseInput) {
    const response = (await axiosClient.post('/api/v1/training-center/courses', course)) as Envelope<{ id: string; title: string }>
    return response.data
  }
}
