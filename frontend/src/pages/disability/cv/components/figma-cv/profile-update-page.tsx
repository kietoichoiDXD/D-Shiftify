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
    <div className='min-h-[calc(100vh-84px)] bg-white text-[#111]'>
      <main className='mx-auto w-full max-w-[760px] px-5 pb-4 pt-12'>
        <div className='mb-7 flex items-center justify-center gap-5 text-center text-[16px] font-medium text-[#333]'>
          Vui lòng cập nhật đầy đủ thông tin để chúng tôi hỗ trợ bạn tốt nhất
          <button
            type='button'
            onClick={handleSpeakGreeting}
            aria-label='Đọc hướng dẫn chung'
            className='rounded-full p-1 transition hover:bg-black/5 hover:text-black'
          >
            <Volume2 className='h-4 w-4 text-[#777]' />
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
            placeholder='01/01/2000'
            value={fields.birthday}
            onChange={(val) => updateField('birthday', val)}
          />
          <VoiceField
            label='Số điện thoại'
            placeholder='090 123 4567'
            value={fields.phone}
            onChange={(val) => updateField('phone', val)}
          />
          <VoiceField
            label='Email'
            placeholder='example@gmail.com'
            value={fields.email}
            onChange={(val) => updateField('email', val)}
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
        label='Tiếp tục'
        onClick={handleComplete}
        instructionText='Vui lòng cập nhật đầy đủ thông tin để chúng tôi hỗ trợ bạn tốt nhất'
      />
    </div>
  )
}
