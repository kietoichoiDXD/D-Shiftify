import axiosClient from '@/core/services/axios-client'

interface RawProfileDevice {
  id: string
  name: string
}

interface RawProfileResponse {
  status?: string
  data?: {

    disabilityStatus?: string | null
    disability_status?: string | null
    devices?: RawProfileDevice[]
  }
}

export interface AccessibilitySignal {
  disabilityStatus: string | null
  deviceNames: string[]
}

export const fetchAccessibilitySignal = async (): Promise<AccessibilitySignal> => {
  const res = (await axiosClient.get('/api/v1/profile/me')) as RawProfileResponse
  const data = res?.data ?? {}
  return {
    disabilityStatus: data.disabilityStatus ?? data.disability_status ?? null,
    deviceNames: (data.devices ?? []).map((d) => d?.name).filter(Boolean)
  }
}
