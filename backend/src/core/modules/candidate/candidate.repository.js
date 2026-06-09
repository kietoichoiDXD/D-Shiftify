import { randomUUID } from 'crypto';
import { DataRepository } from 'packages/restBuilder/core/dataHandler/data.repository'
import { NotFoundException } from '../../../packages/httpException'

class Repository extends DataRepository {
  findByUserId(userId) {
    return this.query()
      .where('user_id', '=', userId)
      .whereNull('deleted_at')
      .first()
  }

  create(data) {
    return this.query().insert({
      user_id: data.userId,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      location: data.location || null,
      headline: data.headline || null,
      bio: data.bio || null,
      profile_image: data.profileImage || null,
      skills: JSON.stringify(data.skills || []),
      created_at: new Date(),
      updated_at: new Date(),
    })
  }

  updateByUserId(userId, data) {
    const updateData = {
      updated_at: new Date(),
    }

    if (data.fullName !== undefined) updateData.full_name = data.fullName
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.location !== undefined) updateData.location = data.location
    if (data.headline !== undefined) updateData.headline = data.headline
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.profileImage !== undefined) updateData.profile_image = data.profileImage
    if (data.skills !== undefined) updateData.skills = JSON.stringify(data.skills)

    return this.query()
      .where('user_id', '=', userId)
      .update(updateData)
  }

  async addEducation(userId, education) {
    const profile = await this.findByUserId(userId)
    if (!profile) throw new NotFoundException('Profile not found')

    const educationList = JSON.parse(profile.education || '[]')
    const educationId = this.generateId()

    educationList.push({
      id: educationId,
      school: education.school,
      degree: education.degree,
      fieldOfStudy: education.fieldOfStudy || null,
      startDate: education.startDate,
      endDate: education.endDate,
    })

    await this.query()
      .where('user_id', '=', userId)
      .update({
        education: JSON.stringify(educationList),
        updated_at: new Date(),
      })

    return educationId
  }

  async updateEducation(userId, educationId, education) {
    const profile = await this.findByUserId(userId)
    if (!profile) throw new NotFoundException('Profile not found')

    const educationList = JSON.parse(profile.education || '[]')
    const index = educationList.findIndex(e => e.id === educationId)

    if (index === -1) throw new NotFoundException('Education record not found')

    educationList[index] = {
      ...educationList[index],
      school: education.school || educationList[index].school,
      degree: education.degree || educationList[index].degree,
      fieldOfStudy: education.fieldOfStudy ?? educationList[index].fieldOfStudy,
      startDate: education.startDate || educationList[index].startDate,
      endDate: education.endDate || educationList[index].endDate,
    }

    await this.query()
      .where('user_id', '=', userId)
      .update({
        education: JSON.stringify(educationList),
        updated_at: new Date(),
      })
  }

  async deleteEducation(userId, educationId) {
    const profile = await this.findByUserId(userId)
    if (!profile) throw new NotFoundException('Profile not found')

    const educationList = JSON.parse(profile.education || '[]')
    const filtered = educationList.filter(e => e.id !== educationId)

    if (filtered.length === educationList.length) {
      throw new NotFoundException('Education record not found')
    }

    await this.query()
      .where('user_id', '=', userId)
      .update({
        education: JSON.stringify(filtered),
        updated_at: new Date(),
      })
  }

  async addExperience(userId, experience) {
    const profile = await this.findByUserId(userId)
    if (!profile) throw new NotFoundException('Profile not found')

    const experienceList = JSON.parse(profile.experience || '[]')
    const experienceId = this.generateId()

    experienceList.push({
      id: experienceId,
      title: experience.title,
      company: experience.company,
      description: experience.description || null,
      startDate: experience.startDate,
      endDate: experience.endDate || null,
      current: experience.current || false,
    })

    await this.query()
      .where('user_id', '=', userId)
      .update({
        experience: JSON.stringify(experienceList),
        updated_at: new Date(),
      })

    return experienceId
  }

  async updateExperience(userId, experienceId, experience) {
    const profile = await this.findByUserId(userId)
    if (!profile) throw new NotFoundException('Profile not found')

    const experienceList = JSON.parse(profile.experience || '[]')
    const index = experienceList.findIndex(e => e.id === experienceId)

    if (index === -1) throw new NotFoundException('Experience record not found')

    experienceList[index] = {
      ...experienceList[index],
      title: experience.title || experienceList[index].title,
      company: experience.company || experienceList[index].company,
      description: experience.description ?? experienceList[index].description,
      startDate: experience.startDate || experienceList[index].startDate,
      endDate: experience.endDate ?? experienceList[index].endDate,
      current: experience.current !== undefined ? experience.current : experienceList[index].current,
    }

    await this.query()
      .where('user_id', '=', userId)
      .update({
        experience: JSON.stringify(experienceList),
        updated_at: new Date(),
      })
  }

  async deleteExperience(userId, experienceId) {
    const profile = await this.findByUserId(userId)
    if (!profile) throw new NotFoundException('Profile not found')

    const experienceList = JSON.parse(profile.experience || '[]')
    const filtered = experienceList.filter(e => e.id !== experienceId)

    if (filtered.length === experienceList.length) {
      throw new NotFoundException('Experience record not found')
    }

    await this.query()
      .where('user_id', '=', userId)
      .update({
        experience: JSON.stringify(filtered),
        updated_at: new Date(),
      })
  }

  generateId() {
    return randomUUID();
  }
}

export const CandidateRepository = new Repository('candidate_profiles')
