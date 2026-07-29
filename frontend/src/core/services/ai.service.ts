import { type AxiosInstance } from 'axios'

import axiosClient from '@/core/services/axios-client'

export type ChatResponse = {
  tts_text: string
  audio_base64: string | null
  profile: Record<string, unknown> | null
  profile_completeness: number | null
  matches: JobMatch[] | null
  nextStep: string
  errors: string[]
}

export type JobMatch = {
  job_id: string
  title: string
  final_score: number
  explanation: string
  is_remote: boolean
  salary_min: number | null
  salary_max: number | null
  accessibility_level: string
  skill_gap: SkillGap | null
}

export type SkillGap = {
  missing_skills: string[]
  courses: { skill: string; course: string | null; provider: string | null; url: string | null; duration: string | null }[]
  tts_text: string
}

export type MarketTrend = {
  industry: string
  trend: 'growing' | 'stable' | 'declining'
  accessible_job_count: number
  month: string
}

export type AiApi = {
  chat: (sessionId: string, message: string) => Promise<ChatResponse>
  voice: (sessionId: string, audioBase64: string, encoding?: string) => Promise<ChatResponse>
  postJob: (payload: Record<string, unknown>) => Promise<unknown>
  marketTrends: () => Promise<MarketTrend[]>
  getProfile: (sessionId: string) => Promise<Record<string, unknown>>
  clearSession: (sessionId: string) => Promise<void>
}

export const createAiApi = (client: AxiosInstance): AiApi => ({
  chat(sessionId, message) {
    return client.post('/ai/chat', { session_id: sessionId, message })
  },
  voice(sessionId, audioBase64, encoding = 'audio/webm') {
    return client.post('/ai/voice', { session_id: sessionId, audio: audioBase64, encoding })
  },
  postJob(payload) {
    return client.post('/ai/jobs', payload)
  },
  marketTrends() {
    return client.get('/ai/market-trends')
  },
  getProfile(sessionId) {
    return client.get('/candidate/profile', { params: { session_id: sessionId } })
  },
  clearSession(sessionId) {
    return client.delete(`/ai/session/${sessionId}`)
  },
})

export const aiApi: AiApi = createAiApi(axiosClient)
