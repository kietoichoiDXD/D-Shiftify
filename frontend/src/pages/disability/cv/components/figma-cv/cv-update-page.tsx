import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { useCvDraftStore } from '@/core/store/features/cv/cvDraftStore'
import { DEFAULT_CV_FORM_VALUES, type CvFormValues } from '@/core/zod/cv.zod'

import { BottomVoiceAction, VoiceField, OptionRow } from './form-controls'

export function FigmaCvUpdatePage() {
  const navigate = useNavigate()
  const { formValues, setFormValues, setDraft } = useCvDraftStore()


  const [fields, setFields] = useState<CvFormValues>(formValues || DEFAULT_CV_FORM_VALUES)

  useEffect(() => {
    if (formValues) {
      setFields(formValues)
    }
  }, [formValues])

  const updateField = (key: keyof CvFormValues, val: any) => {
    setFields((prev) => ({
      ...prev,
      [key]: val
    }))
  }


  const updateExperienceField = (key: string, val: any) => {
    setFields((prev) => {
      const expList = [...prev.workExperiences]
      if (expList.length === 0) {
        expList.push({
          companyName: '',
          jobTitle: '',
          contributionStart: '',
          contributionEnd: '',
          workTime: '',
          workMode: '',
          experience: '',
          isCurrent: false
        })
      }
      expList[0] = {
        ...expList[0],
        [key]: val
      }
      return {
        ...prev,
        workExperiences: expList
      }
    })
  }

  const handleComplete = () => {

    setFormValues(fields)
    setDraft({
      mode: 'create',
      formValues: fields
    })


    navigate(ROUTE.DISABILITY.CV_CONFIRM)
  }

  const firstExp = fields.workExperiences?.[0] || {
    companyName: '',
    jobTitle: '',
    contributionStart: '',
    contributionEnd: '',
    workTime: '',
    workMode: '',
    experience: '',
    isCurrent: false
  }

  return (
    <div className='min-h-[calc(100vh-84px)] bg-[#FAFAFA] text-[#111]'>
      <main className='mx-auto w-full max-w-[673px] px-5 pb-4 pt-10'>
        <h1 className='mb-8 text-[30px] font-black uppercase tracking-[-0.02em] text-[#111]'>Hồ sơ năng lực</h1>

        <form className='space-y-7 border-l-[3px] border-black pl-5' onSubmit={(e) => e.preventDefault()}>
          {}
          <section className='space-y-4'>
            <div className='flex items-center gap-3'>
              <h2 className='text-[14px] font-black uppercase text-[#222]'>Kinh nghiệm làm việc</h2>
            </div>
            <VoiceField
              label='Kinh nghiệm làm việc'
              textarea
              placeholder='Nhập kinh nghiệm của bạn'
              value={firstExp.experience}
              onChange={(val) => updateExperienceField('experience', val)}
            />
            <VoiceField
              label='Tên công ty/doanh nghiệp'
              placeholder='Nhập công ty/doanh nghiệp'
              value={firstExp.companyName}
              onChange={(val) => updateExperienceField('companyName', val)}
            />
            <VoiceField
              label='Chức vụ'
              placeholder='Nhập chức vụ'
              value={firstExp.jobTitle}
              onChange={(val) => updateExperienceField('jobTitle', val)}
            />
            <div className='grid grid-cols-[1fr_auto_1fr] items-end gap-3'>
              <VoiceField
                label='Thời gian bắt đầu'
                placeholder='YYYY'
                value={firstExp.contributionStart}
                onChange={(val) => updateExperienceField('contributionStart', val)}
              />
              <span className='pb-3 text-[#888]'>-</span>
              <VoiceField
                label='Thời gian kết thúc'
                placeholder='YYYY'
                value={firstExp.contributionEnd}
                onChange={(val) => updateExperienceField('contributionEnd', val)}
              />
            </div>
            
            <div className='space-y-2'>
              <span className='text-[12px] font-bold text-[#222]'>Thời gian làm việc</span>
              <OptionRow
                selected={firstExp.workTime === 'full_time'}
                onClick={() => updateExperienceField('workTime', 'full_time')}
              >
                Toàn thời gian
              </OptionRow>
              <OptionRow
                selected={firstExp.workTime === 'part_time'}
                onClick={() => updateExperienceField('workTime', 'part_time')}
              >
                Bán thời gian
              </OptionRow>
            </div>

            <div className='space-y-2'>
              <span className='text-[12px] font-bold text-[#222]'>Hình thức làm việc</span>
              <OptionRow
                selected={firstExp.workMode === 'online'}
                onClick={() => updateExperienceField('workMode', 'online')}
              >
                Online
              </OptionRow>
              <OptionRow
                selected={firstExp.workMode === 'offline'}
                onClick={() => updateExperienceField('workMode', 'offline')}
              >
                Offline
              </OptionRow>
            </div>
          </section>

          {}
          <section className='space-y-4 border-l-[3px] border-black pl-5'>
            <h2 className='text-[14px] font-black uppercase text-[#222]'>Học vấn</h2>
            <VoiceField
              label='Học vấn'
              placeholder='Nhập trường'
              value={fields.schoolName}
              onChange={(val) => updateField('schoolName', val)}
            />
            <VoiceField
              label='Ngành'
              placeholder='Nhập ngành'
              value={fields.major}
              onChange={(val) => updateField('major', val)}
            />
            <VoiceField
              label='Thành tựu'
              placeholder='Nhập thành tựu'
              value={fields.achievement}
              onChange={(val) => updateField('achievement', val)}
            />
            <div className='grid grid-cols-[1fr_auto_1fr] items-end gap-3'>
              <VoiceField
                label='Thời gian học bắt đầu'
                placeholder='YYYY'
                value={fields.educationStart}
                onChange={(val) => updateField('educationStart', val)}
              />
              <span className='pb-3 text-[#888]'>-</span>
              <VoiceField
                label='Thời gian học kết thúc'
                placeholder='YYYY'
                value={fields.educationEnd}
                onChange={(val) => updateField('educationEnd', val)}
              />
            </div>
          </section>

          {}
          <VoiceField
            label='Chứng chỉ'
            placeholder='Liệt kê các bằng cấp liên quan (cách nhau bằng dấu phẩy)'
            value={fields.certifications}
            onChange={(val) => updateField('certifications', val)}
          />

          {}
          <VoiceField
            label='Kỹ năng mềm'
            placeholder='Lựa chọn kỹ năng mềm...'
            value={fields.softSkills}
            onChange={(val) => updateField('softSkills', val)}
          />
          <VoiceField
            label='Kỹ năng cứng'
            placeholder='Lựa chọn kỹ năng cứng...'
            value={fields.hardSkills}
            onChange={(val) => updateField('hardSkills', val)}
          />

          {}
          <section className='space-y-4 border-l-[3px] border-black pl-5'>
            <VoiceField
              label='Mục tiêu nghề nghiệp'
              textarea
              placeholder='Mục tiêu của bạn là gì?'
              value={fields.careerGoals}
              onChange={(val) => updateField('careerGoals', val)}
            />
            
            {}
            <div className='space-y-2'>
              <span className='text-[12px] font-bold text-[#222]'>Thiết bị hiện có</span>
              {['Screen Reader', 'Braille Display', 'Voice Recognition Software', 'Magnification Software'].map((device) => {
                const isSelected = fields.availableEquipment.includes(device)
                return (
                  <OptionRow
                    key={device}
                    selected={isSelected}
                    onClick={() => {
                      if (isSelected) {
                        updateField('availableEquipment', fields.availableEquipment.filter(d => d !== device))
                      } else {
                        updateField('availableEquipment', [...fields.availableEquipment, device])
                      }
                    }}
                  >
                    {device}
                  </OptionRow>
                )
              })}
            </div>
          </section>
        </form>
      </main>
      <BottomVoiceAction
        label='Hoàn tất'
        wide
        onClick={handleComplete}
        instructionText='Hãy cập nhật chi tiết học vấn, kinh nghiệm làm việc và các kỹ năng của bạn'
      />
    </div>
  )
}
