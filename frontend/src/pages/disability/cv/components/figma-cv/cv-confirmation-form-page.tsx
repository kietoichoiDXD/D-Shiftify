import { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { cvApi } from '@/core/services/cv.service'
import { speakAccessibleText } from '@/core/services/speech.service'
import { useCvDraftStore } from '@/core/store/features/cv/cvDraftStore'
import { DEFAULT_CV_FORM_VALUES, type CvFormValues } from '@/core/zod/cv.zod'

import { PlaybackControls, VoiceField } from './form-controls'

export function FigmaCvConfirmationFormPage() {
  const navigate = useNavigate()
  const { formValues, cvId, setDraft, mode } = useCvDraftStore()
  const [fields, setFields] = useState<CvFormValues>(formValues || DEFAULT_CV_FORM_VALUES)
  

  const [activeFieldIndex, setActiveFieldIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (formValues) {
      setFields(formValues)
    }
  }, [formValues])

  const fieldsToRead = [
    { key: 'fullName', label: 'Họ và tên', value: fields.fullName || 'Chưa điền' },
    { key: 'birthday', label: 'Ngày tháng năm sinh', value: fields.birthday || 'Chưa điền' },
    { key: 'phone', label: 'Số điện thoại', value: fields.phone || 'Chưa điền' },
    { key: 'email', label: 'Email', value: fields.email || 'Chưa điền' },
    {
      key: 'disabilityStatus',
      label: 'Tình trạng khuyết tật',
      value:
        fields.disabilityStatus === 'blind'
          ? 'Khiếm thị hoàn toàn'
          : fields.disabilityStatus === 'partial_blind'
            ? 'Khiếm thị không hoàn toàn'
            : fields.disabilityStatus || 'Chưa điền'
    },
    { key: 'careerGoals', label: 'Mục tiêu nghề nghiệp', value: fields.careerGoals || 'Chưa điền' }
  ]

  const speakField = (index: number) => {
    const field = fieldsToRead[index]
    if (field) {
      speakAccessibleText(`${field.label}: ${field.value}`)
    }
  }

  const handlePlayField = () => {
    setIsPlaying(true)
    speakField(activeFieldIndex)
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
    const nextIndex = (activeFieldIndex + 1) % fieldsToRead.length
    setActiveFieldIndex(nextIndex)
    if (isPlaying) {
      speakField(nextIndex)
    }
  }

  const handlePrevField = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    const prevIndex = activeFieldIndex === 0 ? fieldsToRead.length - 1 : activeFieldIndex - 1
    setActiveFieldIndex(prevIndex)
    if (isPlaying) {
      speakField(prevIndex)
    }
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      let result
      if (mode === 'edit' && cvId) {
        result = await cvApi.updateCv(cvId, fields)
      } else {
        result = await cvApi.createCv(fields)
      }


      setDraft({
        mode: mode || 'create',
        cvId: result.id,
        formValues: fields
      })


      navigate(ROUTE.DISABILITY.CV_PREVIEW)
    } catch (err) {
      console.error(err)
      alert('Có lỗi xảy ra khi lưu hồ sơ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='min-h-[calc(100vh-84px)] bg-[#FAFAFA] text-[#111]'>
      <main className='mx-auto w-full max-w-[760px] px-5 pb-36 pt-14'>
        <h1 className='mb-8 text-[24px] font-black uppercase tracking-[-0.01em]'>Xác nhận hồ sơ</h1>
        <div className='space-y-8 border-l-[3px] border-black pl-6'>
          {fieldsToRead.map((field, idx) => {
            const isActive = activeFieldIndex === idx
            return (
              <VoiceField
                key={field.key}
                label={field.label}
                value={field.value}
                active={isActive}
                faded={!isActive && !isPlaying}
              />
            )
          })}
        </div>
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
          onClick={handleConfirm}
          disabled={isSubmitting}
          className='mx-auto block h-12 w-full max-w-[520px] bg-black text-[12px] font-black uppercase tracking-[0.24em] text-white hover:bg-[#222] transition disabled:opacity-50'
        >
          {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
        </button>
      </footer>
    </div>
  )
}
