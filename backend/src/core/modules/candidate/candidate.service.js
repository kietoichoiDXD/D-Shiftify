import { CandidateRepository } from './candidate.repository'
import { UserRepository } from '../user/user.repository'
import { UnprocessableEntityException } from 'packages/httpException/UnprocessableEntityException'
import { NotFoundException } from 'packages/httpException/NotFoundException'
import { logger } from 'packages/logger'
import { normalizeCvProfilePayload } from './candidate.schema'

const ensureNormalizedCvPayload = data => (data?.cvPayload ? data : normalizeCvProfilePayload(data))

class CandidateService {
  async getProfileByUserId(userId) {
    try {
      const profile = await CandidateRepository.findByUserId(userId)

      if (!profile) {
        throw new NotFoundException('Candidate profile not found')
      }

      return this.formatProfile(profile)
    } catch (error) {
      logger.error('[CandidateService.getProfileByUserId]', { userId, error: error.message })
      throw error
    }
  }

  async getPublicProfileByUserId(userId) {
    const profile = await CandidateRepository.findByUserId(userId)
    if (!profile) {
      throw new NotFoundException('Candidate profile not found')
    }

    const formatted = this.formatProfile(profile)
    return {
      id: formatted.id,
      userId: formatted.userId,
      fullName: formatted.fullName,
      headline: formatted.headline,
      bio: formatted.bio,
      location: formatted.location,
      profileImage: formatted.profileImage,
      skills: formatted.skills,
      education: formatted.education,
      experience: formatted.experience,
    }
  }

  async createProfile(userId, data) {
    try {
      const normalized = ensureNormalizedCvPayload(data)
      const userRows = await UserRepository.findById(userId)
      if (!userRows?.length) {
        throw new NotFoundException('User not found')
      }
      const user = userRows[0]

      const existing = await CandidateRepository.findByUserId(userId)
      if (existing) {
        throw new UnprocessableEntityException('Profile already exists for this user')
      }

      await CandidateRepository.create({
        userId,
        fullName: normalized.fullName || user.fullName,
        email: user.email,
        phone: normalized.phone || null,
        location: normalized.location || null,
        headline: normalized.headline || null,
        bio: normalized.bio || null,
        profileImage: normalized.profileImage || null,
        skills: normalized.skills || [],
        education: normalized.education || [],
        experience: normalized.experience || [],
        dob: normalized.dob || null,
        gender: normalized.gender || null,
        disabilityStatus: normalized.disabilityStatus || null,
        deviceIds: normalized.deviceIds || [],
        jobType: normalized.jobType || null,
        workMode: normalized.workMode || null,
        mobility: normalized.mobility || null,
        expectedJob: normalized.expectedJob || null,
        conditions: normalized.conditions || [],
        certificates: normalized.certificates || [],
        customSections: normalized.customSections || [],
        cvPayload: normalized.cvPayload || {},
      })

      const profile = await CandidateRepository.findByUserId(userId)
      return this.formatProfile(profile)
    } catch (error) {
      logger.error('[CandidateService.createProfile]', { userId, error: error.message })
      throw error
    }
  }

  async updateProfile(userId, data) {
    try {
      const normalized = ensureNormalizedCvPayload(data)
      this.validateUpdateData(normalized)

      const existing = await CandidateRepository.findByUserId(userId)
      if (!existing) {
        throw new NotFoundException('Candidate profile not found')
      }

      await CandidateRepository.updateByUserId(userId, normalized)

      const updated = await CandidateRepository.findByUserId(userId)
      return this.formatProfile(updated)
    } catch (error) {
      logger.error('[CandidateService.updateProfile]', { userId, error: error.message })
      throw error
    }
  }

  async addEducation(userId, education) {
    try {
      this.validateEducation(education)
      const educationId = await CandidateRepository.addEducation(userId, education)
      const profile = await CandidateRepository.findByUserId(userId)
      return {
        status: 'success',
        data: this.formatProfile(profile),
        educationId,
      }
    } catch (error) {
      logger.error('[CandidateService.addEducation]', { userId, error: error.message })
      throw error
    }
  }

  async updateEducation(userId, educationId, education) {
    try {
      this.validateEducation(education, false)
      await CandidateRepository.updateEducation(userId, educationId, education)
      const profile = await CandidateRepository.findByUserId(userId)
      return this.formatProfile(profile)
    } catch (error) {
      logger.error('[CandidateService.updateEducation]', { userId, educationId, error: error.message })
      throw error
    }
  }

  async deleteEducation(userId, educationId) {
    try {
      await CandidateRepository.deleteEducation(userId, educationId)
      const profile = await CandidateRepository.findByUserId(userId)
      return this.formatProfile(profile)
    } catch (error) {
      logger.error('[CandidateService.deleteEducation]', { userId, educationId, error: error.message })
      throw error
    }
  }

  async addExperience(userId, experience) {
    try {
      this.validateExperience(experience)
      const experienceId = await CandidateRepository.addExperience(userId, experience)
      const profile = await CandidateRepository.findByUserId(userId)
      return {
        status: 'success',
        data: this.formatProfile(profile),
        experienceId,
      }
    } catch (error) {
      logger.error('[CandidateService.addExperience]', { userId, error: error.message })
      throw error
    }
  }

  async updateExperience(userId, experienceId, experience) {
    try {
      this.validateExperience(experience, false)
      await CandidateRepository.updateExperience(userId, experienceId, experience)
      const profile = await CandidateRepository.findByUserId(userId)
      return this.formatProfile(profile)
    } catch (error) {
      logger.error('[CandidateService.updateExperience]', { userId, experienceId, error: error.message })
      throw error
    }
  }

  async deleteExperience(userId, experienceId) {
    try {
      await CandidateRepository.deleteExperience(userId, experienceId)
      const profile = await CandidateRepository.findByUserId(userId)
      return this.formatProfile(profile)
    } catch (error) {
      logger.error('[CandidateService.deleteExperience]', { userId, experienceId, error: error.message })
      throw error
    }
  }

  formatProfile(profile) {
    const parseJson = (value) => {
      if (!value) return []
      if (Array.isArray(value)) return value
      try {
        return JSON.parse(value)
      } catch (_error) {
        return []
      }
    }
    const parseObject = (value) => {
      if (!value) return {}
      if (typeof value === 'object' && !Array.isArray(value)) return value
      try {
        const parsed = JSON.parse(value)
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
      } catch (_error) {
        return {}
      }
    }

    return {
      id: profile.id,
      userId: profile.user_id,
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone || undefined,
      location: profile.location || undefined,
      headline: profile.headline || undefined,
      bio: profile.bio || undefined,
      profileImage: profile.profile_image || undefined,
      dob: this.formatDate(profile.dob),
      gender: profile.gender || undefined,
      disabilityStatus: profile.disability_status || undefined,
      deviceIds: parseJson(profile.device_ids),
      jobType: profile.job_type || undefined,
      workMode: profile.work_mode || undefined,
      mobility: profile.mobility || undefined,
      expectedJob: profile.expected_job || undefined,
      conditions: parseJson(profile.conditions),
      certificates: parseJson(profile.certificates),
      customSections: parseJson(profile.custom_sections),
      skills: parseJson(profile.skills),
      education: parseJson(profile.education),
      experience: parseJson(profile.experience),
      cv: {
        ...parseObject(profile.cv_payload),
        deviceIds: parseJson(profile.device_ids),
        jobType: profile.job_type || undefined,
        workMode: profile.work_mode || undefined,
        mobility: profile.mobility || undefined,
        expectedJob: profile.expected_job || undefined,
        conditions: parseJson(profile.conditions),
        certificates: parseJson(profile.certificates),
        customSections: parseJson(profile.custom_sections),
      },
      createdAt: profile.created_at?.toISOString(),
      updatedAt: profile.updated_at?.toISOString(),
    }
  }

  formatDate(value) {
    if (!value) return undefined
    if (typeof value === 'string') return value.slice(0, 10)
    return value.toISOString?.().slice(0, 10)
  }

  validateUpdateData(data) {
    if (data.fullName && typeof data.fullName !== 'string') {
      throw new UnprocessableEntityException('fullName must be a string')
    }

    if (data.phone && typeof data.phone !== 'string') {
      throw new UnprocessableEntityException('phone must be a string')
    }

    if (data.location && typeof data.location !== 'string') {
      throw new UnprocessableEntityException('location must be a string')
    }

    if (data.headline && typeof data.headline !== 'string') {
      throw new UnprocessableEntityException('headline must be a string')
    }

    if (data.bio && typeof data.bio !== 'string') {
      throw new UnprocessableEntityException('bio must be a string')
    }

    if (data.skills && !Array.isArray(data.skills)) {
      throw new UnprocessableEntityException('skills must be an array')
    }

    if (data.deviceIds && !Array.isArray(data.deviceIds)) {
      throw new UnprocessableEntityException('deviceIds must be an array')
    }

    if (data.conditions && !Array.isArray(data.conditions)) {
      throw new UnprocessableEntityException('conditions must be an array')
    }

    if (data.certificates && !Array.isArray(data.certificates)) {
      throw new UnprocessableEntityException('certificates must be an array')
    }
  }

  validateEducation(education, isRequired = true) {
    if (!education) {
      if (isRequired) throw new UnprocessableEntityException('Education data is required')
      return
    }

    if (isRequired) {
      if (!education.school) throw new UnprocessableEntityException('school is required')
      if (!education.degree) throw new UnprocessableEntityException('degree is required')
      if (!education.startDate) throw new UnprocessableEntityException('startDate is required')
      if (!education.endDate) throw new UnprocessableEntityException('endDate is required')
    }
  }

  validateExperience(experience, isRequired = true) {
    if (!experience) {
      if (isRequired) throw new UnprocessableEntityException('Experience data is required')
      return
    }

    if (isRequired) {
      if (!experience.title) throw new UnprocessableEntityException('title is required')
      if (!experience.company) throw new UnprocessableEntityException('company is required')
      if (!experience.startDate) throw new UnprocessableEntityException('startDate is required')
    }
  }
}

export const candidateService = new CandidateService()
