import { useEffect, useState } from 'react'
import { CalendarDays, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { useCvDraftStore } from '@/core/store/features/cv/cvDraftStore'
import { speakAccessibleText } from '@/core/services/speech.service'
import { DEFAULT_CV_FORM_VALUES, type CvFormValues } from '@/core/zod/cv.zod'

import { PlaybackControls, ResumeSection, Tag } from './form-controls'

export function FigmaCvPreviewPage() {
  const navigate = useNavigate()
  const { formValues } = useCvDraftStore()
  const [fields, setFields] = useState<CvFormValues>(formValues || DEFAULT_CV_FORM_VALUES)

  // Playback state
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (formValues) {
      setFields(formValues)
    }
  }, [formValues])

  const firstExp = fields.workExperiences?.[0] || {
    companyName: 'Chưa có',
    jobTitle: 'Chưa có',
    contributionStart: '',
    contributionEnd: '',
    experience: 'Chưa có'
  }

  const sectionsToRead = [
    {
      title: 'Thông tin cá nhân',
      text: `Họ tên: ${fields.fullName || 'Chưa điền'}. Email: ${fields.email || 'Chưa điền'}. Số điện thoại: ${fields.phone || 'Chưa điền'}. Tình trạng khuyết tật: ${
        fields.disabilityStatus === 'blind'
          ? 'Khiếm thị hoàn toàn'
          : fields.disabilityStatus === 'partial_blind'
            ? 'Khiếm thị không hoàn toàn'
            : fields.disabilityStatus || 'Chưa điền'
      }.`
    },
    {
      title: 'Mục tiêu nghề nghiệp',
      text: `Mục tiêu nghề nghiệp: ${fields.careerGoals || 'Chưa có'}`
    },
    {
      title: 'Học vấn',
      text: `Học vấn: Học trường ${fields.schoolName || 'Chưa có'}, ngành ${fields.major || 'Chưa có'}. Thành tựu: ${fields.achievement || 'Chưa có'}.`
    },
    {
      title: 'Kinh nghiệm làm việc',
      text: `Kinh nghiệm làm việc: Làm chức vụ ${firstExp.jobTitle} tại công ty ${firstExp.companyName}. Mô tả chi tiết: ${firstExp.experience}.`
    },
    {
      title: 'Kỹ năng và thiết bị',
      text: `Kỹ năng cứng: ${fields.hardSkills || 'Chưa có'}. Kỹ năng mềm: ${fields.softSkills || 'Chưa có'}. Thiết bị hiện có: ${fields.availableEquipment.join(', ') || 'Chưa chọn'}.`
    }
  ]

  const speakSection = (index: number) => {
    const section = sectionsToRead[index]
    if (section) {
      speakAccessibleText(`${section.title}. ${section.text}`)
    }
  }

  const handlePlayField = () => {
    setIsPlaying(true)
    speakSection(activeSectionIndex)
  }

  const handlePause = () => {
    setIsPlaying(false)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }

  const handleNextField = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    const nextIndex = (activeSectionIndex + 1) % sectionsToRead.length
    setActiveSectionIndex(nextIndex)
    if (isPlaying) {
      speakSection(nextIndex)
    }
  }

  const handlePrevField = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    const prevIndex = activeSectionIndex === 0 ? sectionsToRead.length - 1 : activeSectionIndex - 1
    setActiveSectionIndex(prevIndex)
    if (isPlaying) {
      speakSection(prevIndex)
    }
  }

  const handleFinalSubmit = () => {
    alert('Hồ sơ năng lực của bạn đã được xuất bản và xác nhận thành công!')
    navigate(ROUTE.DISABILITY.DASHBOARD)
  }

  return (
    <div className='min-h-[calc(100vh-84px)] bg-white text-[#111]'>
      <main className='mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-12 px-6 pb-36 pt-10 lg:grid-cols-[1fr_310px]'>
        <section className='space-y-10'>
          {/* Main Info */}
          <div className='mb-9 grid gap-8 lg:grid-cols-[300px_1fr]'>
            <div
              className='min-h-[300px] bg-[#F8F8F8] flex items-center justify-center border border-dashed border-slate-300'
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #ececec 25%, transparent 25%), linear-gradient(-45deg, #ececec 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ececec 75%), linear-gradient(-45deg, transparent 75%, #ececec 75%)',
                backgroundSize: '62px 62px',
                backgroundPosition: '0 0, 0 31px, 31px -31px, -31px 0'
              }}
            >
              {fields.avatarUrl ? (
                <img src={fields.avatarUrl} alt={fields.fullName} className='max-h-full max-w-full object-cover' />
              ) : (
                <span className='text-xs font-bold text-slate-400'>No Avatar</span>
              )}
            </div>
            <div>
              <h1 className='mb-8 text-[44px] font-black uppercase tracking-[-0.03em]'>{fields.fullName || 'Nguyen Van A'}</h1>
              <div className='max-w-[320px] bg-[#F2F2F2] p-7 text-[12px] font-medium leading-6'>
                <p className='mb-3 flex items-center gap-2 text-[10px] font-black uppercase'>
                  <UserRound className='h-4 w-4' /> Contact info
                </p>
                <p className='flex items-center gap-2'>
                  <Mail className='h-3.5 w-3.5' /> {fields.email || 'example@gmail.com'}
                </p>
                <p className='flex items-center gap-2'>
                  <Phone className='h-3.5 w-3.5' /> {fields.phone || '+84 901 234 567'}
                </p>
                <p className='flex items-center gap-2'>
                  <MapPin className='h-3.5 w-3.5' /> {fields.address || 'Quận 1, TP. Hồ Chí Minh'}
                </p>
                <p className='flex items-center gap-2'>
                  <CalendarDays className='h-3.5 w-3.5' /> {
                    fields.disabilityStatus === 'blind'
                      ? 'Khiếm thị hoàn toàn'
                      : fields.disabilityStatus === 'partial_blind'
                        ? 'Khiếm thị không hoàn toàn'
                        : fields.disabilityStatus || 'Khác'
                  }
                </p>
              </div>
            </div>
          </div>

          <ResumeSection title='Mục tiêu nghề nghiệp'>
            <p className='text-[13px] font-medium leading-7 text-[#333]'>
              {fields.careerGoals || 'Chưa điền mục tiêu nghề nghiệp.'}
            </p>
          </ResumeSection>

          <ResumeSection title='Học vấn'>
            <div className='bg-[#F3F3F3] p-6'>
              <div className='mb-3 flex items-center justify-between gap-4'>
                <h3 className='text-[14px] font-black uppercase'>{fields.schoolName || 'Trường Đại học'}</h3>
                {fields.educationStart && (
                  <Tag>{fields.educationStart} - {fields.educationEnd || 'Hiện tại'}</Tag>
                )}
              </div>
              <p className='text-[12px] font-bold uppercase'>{fields.major || 'Chuyên ngành'}</p>
              <p className='mt-3 text-[12px] leading-6 text-[#555]'>{fields.achievement || 'Thành tựu đạt được.'}</p>
            </div>
          </ResumeSection>

          <ResumeSection title='Kinh nghiệm làm việc'>
            <div className='space-y-6'>
              {(fields.workExperiences || []).map((exp, index) => (
                <div key={index} className='grid gap-5 bg-[#F1F1F1] p-6 sm:grid-cols-[58px_1fr]'>
                  <div className='flex h-12 w-12 items-center justify-center bg-white text-[#8BA7B8] font-bold'>
                    S{index + 1}
                  </div>
                  <div>
                    <div className='mb-2 flex items-start justify-between gap-4'>
                      <div>
                        <h3 className='text-[14px] font-black uppercase'>{exp.jobTitle || 'Chức vụ'}</h3>
                        <p className='text-[11px] font-bold uppercase text-[#555]'>{exp.companyName || 'Tên công ty'}</p>
                      </div>
                      <span className='text-[10px] font-bold text-[#BBB]'>
                        {exp.contributionStart || 'N/A'} - {exp.contributionEnd || (exp.isCurrent ? 'Hiện tại' : 'N/A')}
                      </span>
                    </div>
                    <p className='text-[12px] leading-6 text-[#555]'>{exp.experience || 'Mô tả công việc.'}</p>
                  </div>
                </div>
              ))}
            </div>
          </ResumeSection>
        </section>

        <aside className='space-y-8'>
          {fields.certifications && (
            <ResumeSection title='Chứng chỉ'>
              <div className='flex flex-wrap gap-2'>
                {fields.certifications.split(',').map((cert) => (
                  <Tag key={cert}>{cert.trim()}</Tag>
                ))}
              </div>
            </ResumeSection>
          )}

          {fields.hardSkills && (
            <ResumeSection title='Kỹ năng cứng'>
              <div className='flex flex-wrap gap-2'>
                {fields.hardSkills.split(',').map((skill) => (
                  <Tag key={skill}>{skill.trim()}</Tag>
                ))}
              </div>
            </ResumeSection>
          )}

          {fields.softSkills && (
            <ResumeSection title='Kỹ năng mềm'>
              <div className='flex flex-wrap gap-2'>
                {fields.softSkills.split(',').map((skill) => (
                  <Tag key={skill}>{skill.trim()}</Tag>
                ))}
              </div>
            </ResumeSection>
          )}

          {fields.availableEquipment.length > 0 && (
            <ResumeSection title='Thiết bị hiện có'>
              <div className='flex flex-wrap gap-2'>
                {fields.availableEquipment.map((device) => (
                  <Tag key={device}>{device}</Tag>
                ))}
              </div>
            </ResumeSection>
          )}
        </aside>
      </main>

      <footer className='fixed bottom-0 left-0 right-0 z-30 border-t border-[#E4E4E4] bg-white/95 px-5 pb-5 pt-1 backdrop-blur'>
        <PlaybackControls
          isPlaying={isPlaying}
          onPlayField={handlePlayField}
          onPause={handlePause}
          onNextField={handleNextField}
          onPrevField={handlePrevField}
        />
        <button
          type='button'
          onClick={handleFinalSubmit}
          className='mx-auto block h-12 w-full max-w-[520px] bg-black text-[12px] font-black uppercase tracking-[0.24em] text-white hover:bg-[#222] transition'
        >
          Xác nhận hoàn tất
        </button>
      </footer>
    </div>
  )
}
