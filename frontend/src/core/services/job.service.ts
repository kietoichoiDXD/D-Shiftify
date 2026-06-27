import axiosClient from '@/core/services/axios-client'

export type JobRecord = {
  id: string
  title: string
  company: { name: string; logoUrl?: string }
  location: string
  jobType: string
  workMode: string
  experienceRequired?: string
  skills: Array<{ name: string; required?: boolean; type?: string }>
  salaryMin?: number
  salaryMax?: number
  workingTime?: string
  description?: string
  requirements?: string
  deadline?: string
}

// Mirrors backend MATCHING_CRITERIA_V2 (match.scoring.js). Default order = default weights
// [25,20,15,15,10,5,5,5]. Users can re-order via the priority selector; the chosen order is
// sent as `priorities` and the backend re-assigns the fixed weight set top-down.
export const MATCHING_CRITERIA: Array<{ key: string; label: string }> = [
  { key: 'priority', label: 'Ưu tiên công việc' },
  { key: 'experience', label: 'Kinh nghiệm làm việc' },
  { key: 'devices', label: 'Thiết bị hiện có' },
  { key: 'career_goal', label: 'Mục tiêu nghề nghiệp' },
  { key: 'hard_skills', label: 'Kỹ năng cứng' },
  { key: 'soft_skills', label: 'Kỹ năng mềm' },
  { key: 'certificates', label: 'Chứng chỉ' },
  { key: 'custom', label: 'Trường phụ' }
]

export type MatchCriterion = {
  key: string
  label: string
  weight: number
  score: number
  contribution: number
  reason?: string
  source?: 'ai' | 'deterministic'
}

export type JobMatch = {
  job: Pick<JobRecord, 'id' | 'title' | 'location' | 'workMode'> & { company: { name: string } }
  score: number
  criteria: MatchCriterion[]
  strengths: string[]
  gaps: string[]
  explanation: string
  accessibility: { score: number; signals: string[]; warnings: string[] }
  aiRefined?: boolean
}

type Envelope<T> = { data: T; meta?: { total: number; page: number; limit: number; totalPages: number } }

export const jobApi = {
  async assistiveDevices() {
    const response = (await axiosClient.get('/api/v1/jobs/assistive-devices')) as Envelope<Array<{ id: string; name: string }>>
    return response.data
  },
  async list(params: { page?: number; limit?: number; search?: string; work_mode?: string; location?: string } = {}) {
    return (await axiosClient.get('/api/v1/jobs/', { params })) as Envelope<JobRecord[]>
  },
  async get(jobId: string) {
    const response = (await axiosClient.get(`/api/v1/jobs/${jobId}`)) as Envelope<JobRecord>
    return response.data
  },
  async create(payload: Record<string, unknown>) {
    return axiosClient.post('/api/v1/jobs/', payload) as Promise<{ data: { id: string }; message: string }>
  },
  async getCurrentCv() {
    const response = (await axiosClient.get('/api/v1/cv/me')) as Envelope<{ id: string }>
    return response.data
  },
  async match(cvId: string, jobIds: string[], priorities: string[] = []) {
    const response = (await axiosClient.post('/api/v1/ai/matching/jobs', {
      cvId,
      jobIds,
      priorities,
      limit: Math.min(jobIds.length || 20, 50)
    })) as Envelope<{ matches: JobMatch[] }>
    return response.data.matches
  },
  async apply(jobId: string, cvId: string) {
    return axiosClient.post('/api/v1/applications/', { jobId, cvId })
  }
}

export const getJobs = jobApi.list

