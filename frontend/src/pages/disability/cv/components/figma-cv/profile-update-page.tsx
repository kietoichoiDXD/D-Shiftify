import { useEffect, useState } from 'react'

import { Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { useCvDraftStore } from '@/core/store/features/cv/cvDraftStore'
import { speakAccessibleText } from '@/core/services/speech.service'
import { DEFAULT_CV_FORM_VALUES, type CvFormValues } from '@/core/zod/cv.zod'

import { BottomVoiceAction, OptionRow, VoiceField } from './form-controls'

export function FigmaProfileUpdatePage() {
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

  const handleSpeakGreeting = () => {
    speakAccessibleText('Vui lòng cập nhật đầy đủ thông tin để chúng tôi hỗ trợ bạn tốt nhất')
  }

  const handleComplete = () => {

    if (!fields.fullName || !fields.phone || !fields.email) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc: Họ tên, Số điện thoại, Email.')
      return
    }


    setFormValues(fields)
    setDraft({
      mode: 'create',
      formValues: fields
    })


    navigate(ROUTE.DISABILITY.CV_UPDATE)
  }

  return (
    <div className='min-h-[calc(100vh-84px)] bg-gradient-to-br from-[#F8FBFF] to-[#EAF4FF] text-[#111]'>
      <main className='mx-auto w-full max-w-[760px] px-5 pb-4 pt-10'>
        <div className='mb-8 flex items-center justify-between gap-4 bg-[#004080] px-6 py-4 text-white'>
          <p className='text-[15px] font-semibold'>Vui lòng cung cấp thông tin để chúng tôi có thể hỗ trợ tốt nhất</p>
          <button
            type='button'
            onClick={handleSpeakGreeting}
            aria-label='Đọc hướng dẫn chung'
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25'
          >
            <Volume2 className='h-4 w-4 text-white' />
          </button>
        </div>

        <form className='space-y-5' onSubmit={(e) => e.preventDefault()}>
          <VoiceField
            label='Họ và tên'
            placeholder='Nhập họ và tên'
            value={fields.fullName}
            onChange={(val) => updateField('fullName', val)}
          />
          <VoiceField
            label='Ngày tháng năm sinh'
            placeholder='DD/MM/YYYY'
            value={fields.birthday}
            onChange={(val) => updateField('birthday', val)}
          />

          <div className='space-y-3'>
            <span className='flex items-center gap-2 text-[12px] font-bold text-[#222]'>
              Giới tính
              <button
                type='button'
                onClick={() => speakAccessibleText('Giới tính')}
                className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
              >
                <Volume2 className='h-3.5 w-3.5 text-[#777]' />
              </button>
            </span>
            <OptionRow
              selected={fields.gender === 'male'}
              onClick={() => updateField('gender', 'male')}
            >
              Nam
            </OptionRow>
            <OptionRow
              selected={fields.gender === 'female'}
              onClick={() => updateField('gender', 'female')}
            >
              Nữ
            </OptionRow>
          </div>

          <VoiceField
            label='Số điện thoại'
            placeholder='Nhập số điện thoại'
            value={fields.phone}
            onChange={(val) => updateField('phone', val)}
          />
          <VoiceField
            label='Email'
            placeholder='Nhập email'
            value={fields.email}
            onChange={(val) => updateField('email', val)}
          />

          <div className='space-y-3'>
            <span className='flex items-center gap-2 text-[12px] font-bold text-[#222]'>
              Tình trạng khuyết tật
              <button
                type='button'
                onClick={() => speakAccessibleText('Tình trạng khuyết tật')}
                className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
              >
                <Volume2 className='h-3.5 w-3.5 text-[#777]' />
              </button>
            </span>
            <OptionRow
              selected={fields.disabilityStatus === 'blind'}
              onClick={() => updateField('disabilityStatus', 'blind')}
            >
              Khiếm thị hoàn toàn
            </OptionRow>
            <OptionRow
              selected={fields.disabilityStatus === 'partial_blind'}
              onClick={() => updateField('disabilityStatus', 'partial_blind')}
            >
              Khiếm thị không hoàn toàn
            </OptionRow>
            <VoiceField
              label=''
              placeholder='Khác...'
              value={
                fields.disabilityStatus !== 'blind' && fields.disabilityStatus !== 'partial_blind'
                  ? fields.disabilityStatus
                  : ''
              }
              onChange={(val) => updateField('disabilityStatus', val)}
            />
          </div>
        </form>
      </main>
      <BottomVoiceAction
        label='Hoàn tất'
        onClick={handleComplete}
        instructionText='Vui lòng cung cấp thông tin để chúng tôi có thể hỗ trợ tốt nhất'
      />
    </div>
  )
}
