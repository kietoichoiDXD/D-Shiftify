import { type AxiosInstance } from 'axios'

import { DEFAULT_CV_RECORD } from '@/core/constants/cv-options'
import axiosClient from '@/core/services/axios-client'
import {
  type CvPayload,
  type CvPreviewResponse,
  type CvRecord,
  type DisabilityOptionsResponse,
  type UploadAvatarResponse
} from '@/models/interface/cv.interfaces'

const API_CV_URL = '/api/v1/cv'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type ApiEnvelope<T> = { data: T; status?: string }

const splitValues = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const createPreview = (payload: CvPayload): CvPreviewResponse => {
  const fields = [
    payload.fullName,
    payload.email || payload.phone,
    payload.disabilityStatus,
    payload.careerGoals,
    payload.hardSkills,
    payload.softSkills,
    payload.education || payload.schoolName,
    payload.experience || payload.workExperiences?.[0]?.experience
  ]
  const completenessScore = Math.round((fields.filter((item) => String(item || '').trim()).length / fields.length) * 100)

  return {
    completenessScore,
    summary: `${payload.fullName || 'Ứng viên'} đang xác nhận hồ sơ năng lực.`,
    warnings: completenessScore < 75 ? ['Bổ sung thêm kỹ năng và kinh nghiệm để tăng độ phù hợp.'] : [],
    sections: [
      { label: 'Mục tiêu nghề nghiệp', value: payload.careerGoals || '' },
      { label: 'Kinh nghiệm', value: payload.experience || payload.workExperiences?.[0]?.experience || '' },
      { label: 'Học vấn', value: payload.education || [payload.schoolName, payload.major].filter(Boolean).join(' - ') }
    ].filter((section) => section.value)
  }
}

const toBackendPayload = (payload: CvPayload) => ({
  profile: {
    fullName: payload.fullName,
    dob: payload.birthday || undefined,
    gender: payload.gender || undefined,
    phone: payload.phone || undefined,
    disabilityStatus: payload.disabilityStatus || undefined
  },
  cv: {
    deviceIds: payload.availableEquipment.filter((id) => UUID_PATTERN.test(id)),
    jobType: payload.workExperiences?.[0]?.workTime || payload.workTime || undefined,
    workMode: payload.workExperiences?.[0]?.workMode || payload.workMode || undefined,
    expectedJob: payload.careerGoals || payload.jobTitle || undefined,
    skills: [
      ...splitValues(payload.hardSkills).map((name) => ({ name, type: 'hard_skill' })),
      ...splitValues(payload.softSkills).map((name) => ({ name, type: 'soft_skill' }))
    ],
    conditions: payload.workConditions,
    experiences: (payload.workExperiences || []).map((item) => ({
      company: item.companyName,
      position: item.jobTitle,
      description: item.experience,
      startDate: item.contributionStart,
      endDate: item.contributionEnd
    })),
    certificates: splitValues(payload.certifications),
    customSections: [
      {
        title: 'education',
        items: [
          {
            school: payload.schoolName,
            major: payload.major,
            startDate: payload.educationStart,
            endDate: payload.educationEnd,
            description: payload.achievement || payload.education
          }
        ]
      },
      { title: 'accessibility', items: [{ supportNeeds: payload.supportNeeds }] }
    ]
  }
})

const normalizeRecord = (value: unknown, payload?: CvPayload): CvRecord => {
  const envelope = value as ApiEnvelope<unknown>
  const raw = envelope?.data ?? value
  const record = (Array.isArray(raw) ? raw[0] : raw) as Record<string, unknown>
  return {
    ...(payload || DEFAULT_CV_RECORD),
    id: String(record?.id || 'current'),
    status: 'submitted',
    updatedAt: String(record?.updatedAt || new Date().toISOString()),
    previewScore: payload ? createPreview(payload).completenessScore : 0
  }
}

export type CvApi = {
  getDisabilityOptions: () => Promise<DisabilityOptionsResponse>
  getCvDetail: (cvId: string) => Promise<CvRecord>
  createCv: (payload: CvPayload) => Promise<CvRecord>
  updateCv: (cvId: string, payload: CvPayload) => Promise<CvRecord>
  uploadAvatar: (file: File) => Promise<UploadAvatarResponse>
  validatePreview: (payload: CvPayload) => Promise<CvPreviewResponse>
}

export const createCvApi = (client: AxiosInstance): CvApi => ({
  async getDisabilityOptions() {
    return client.get(`${API_CV_URL}/disability-options`) as Promise<DisabilityOptionsResponse>
  },
  async getCvDetail(cvId) {
    const response = await client.get(`${API_CV_URL}/${cvId}`)
    return normalizeRecord(response)
  },
  async createCv(payload) {
    const response = await client.post(API_CV_URL, toBackendPayload(payload))
    return normalizeRecord(response, payload)
  },
  async updateCv(cvId, payload) {
    const response = await client.put(`${API_CV_URL}/${cvId}`, toBackendPayload(payload))
    return normalizeRecord(response, payload)
  },
  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = (await client.post('/api/v1/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })) as { avatarUrl?: string; url?: string; data?: { url?: string } }
    return { avatarUrl: response.avatarUrl || response.url || response.data?.url || '' }
  },
  async validatePreview(payload) {
    try {
      return (await client.post(`${API_CV_URL}/preview`, payload)) as CvPreviewResponse
    } catch {
      return createPreview(payload)
    }
  }
})

export const cvApi = createCvApi(axiosClient)
