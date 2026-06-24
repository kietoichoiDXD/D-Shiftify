import axiosClient from '@/core/services/axios-client'

export type CompanyProfile = {
  id?: string
  name: string
  slogan: string
  phone: string
  email: string
  website: string
  industry: string
  taxCode: string
  address: string
  policyForDisabled: string
  experienceWithDisabled: string
  licenseFile: string
  logoUrl: string
}

type Envelope<T> = { status: string; data: T }

export const companyApi = {
  async getMine() {
    const response = (await axiosClient.get('/api/v1/company/me')) as Envelope<CompanyProfile>
    return response.data
  },
  async save(profile: CompanyProfile) {
    const response = (await axiosClient.put('/api/v1/company/me', profile)) as Envelope<CompanyProfile>
    return response.data
  }
}
