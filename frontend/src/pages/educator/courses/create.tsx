import { useState } from 'react'

import { BookOpen, CheckCircle, Loader2, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { speakAccessibleText } from '@/core/services/speech.service'
import { trainingApi, type CourseInput } from '@/core/services/training.service'
import { WorkspaceShell } from '@/pages/_shared/figma-web/workspace-shell'

const DURATION_OPTIONS: Array<{ value: CourseInput['durationType']; label: string; desc: string }> = [
  { value: 'short_term', label: 'Ngắn hạn', desc: 'Dưới 3 tháng' },
  { value: 'medium_term', label: 'Trung hạn', desc: '3 – 6 tháng' },
  { value: 'long_term', label: 'Dài hạn', desc: 'Trên 6 tháng' }
]

const MODE_OPTIONS: Array<{ value: CourseInput['mode']; label: string }> = [
  { value: 'online', label: 'Trực tuyến (Online)' },
  { value: 'offline', label: 'Trực tiếp (Offline)' },
  { value: 'hybrid', label: 'Kết hợp (Hybrid)' }
]

const EMPTY: CourseInput = {
  title: '',
  durationType: 'short_term',
  startDate: '',
  endDate: '',
  mode: 'hybrid',
  certificateOutput: '',
  description: ''
}

export default function EducatorCourseCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CourseInput>(EMPTY)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof CourseInput, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.startDate || !form.endDate || !form.certificateOutput.trim()) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.')
      void speakAccessibleText('Vui lòng điền đầy đủ các trường bắt buộc.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await trainingApi.createCourse(form)
      setSuccessId(result.id)
      void speakAccessibleText(`Khóa học "${form.title}" đã được tạo thành công!`)
    } catch {
      setError('Không thể tạo khóa học. Vui lòng thử lại.')
      void speakAccessibleText('Không thể tạo khóa học. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successId) {
    return (
      <WorkspaceShell role='educator'>
        <div className='mx-auto max-w-lg py-20 text-center'>
          <CheckCircle className='mx-auto size-16 text-emerald-500' aria-hidden='true' />
          <h1 className='mt-6 text-2xl font-black text-[#004080]'>Tạo khóa học thành công!</h1>
          <p className='mt-3 text-[15px] text-[#33506E]'>
            Khóa học <strong>"{form.title}"</strong> đã được lưu.
          </p>
          <div className='mt-8 flex justify-center gap-3'>
            <button
              type='button'
              onClick={() => navigate(ROUTE.EDUCATOR.COURSES)}
              className='bg-[#004080] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#003466]'
            >
              Xem danh sách khóa học
            </button>
            <button
              type='button'
              onClick={() => { setForm(EMPTY); setSuccessId(null) }}
              className='border border-[#004080] px-6 py-3 text-sm font-bold text-[#004080] transition hover:bg-[#EAF4FF]'
            >
              Tạo thêm khóa học
            </button>
          </div>
        </div>
      </WorkspaceShell>
    )
  }

  return (
    <WorkspaceShell role='educator'>
      <div className='mx-auto max-w-2xl'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <div className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#004080]'>
              <BookOpen className='size-4' aria-hidden='true' />
              Khóa học mới
            </div>
            <h1 className='mt-1 text-balance text-3xl font-black text-[#004080]'>Tạo khóa học</h1>
            <p className='mt-2 text-pretty text-[15px] leading-7 text-[#33506E]'>
              Thiết lập thông tin cho khóa học nghề dành cho người khuyết tật.
            </p>
          </div>
          <button
            type='button'
            aria-label='Nghe hướng dẫn tạo khóa học'
            onClick={() => void speakAccessibleText('Điền thông tin tạo khóa học. Cần nhập tên khóa học, ngày bắt đầu, kết thúc và chứng chỉ đầu ra.')}
            className='inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
          >
            <Volume2 className='size-5' />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className='mt-8 space-y-6'>
          {/* Tên khóa học */}
          <div>
            <label htmlFor='title' className='block text-sm font-black text-[#102033]'>
              Tên khóa học <span aria-hidden='true' className='text-rose-500'>*</span>
            </label>
            <input
              id='title'
              type='text'
              required
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder='VD: Kỹ năng tin học văn phòng cho NKT'
              className='mt-2 w-full border border-[#CFE3F7] bg-white px-4 py-3 text-[15px] text-[#102033] outline-none transition focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/20'
            />
          </div>

          {/* Thời lượng */}
          <fieldset>
            <legend className='text-sm font-black text-[#102033]'>
              Thời lượng <span aria-hidden='true' className='text-rose-500'>*</span>
            </legend>
            <div className='mt-2 flex flex-wrap gap-3'>
              {DURATION_OPTIONS.map((opt) => (
                <label key={opt.value} className='cursor-pointer'>
                  <input
                    type='radio'
                    name='durationType'
                    value={opt.value}
                    checked={form.durationType === opt.value}
                    onChange={() => set('durationType', opt.value)}
                    className='sr-only'
                  />
                  <span
                    className={`flex flex-col border px-4 py-3 text-sm transition ${
                      form.durationType === opt.value
                        ? 'border-[#004080] bg-[#EAF4FF] font-black text-[#004080]'
                        : 'border-[#CFE3F7] bg-white text-[#33506E] hover:border-[#004080]'
                    }`}
                  >
                    <span className='font-bold'>{opt.label}</span>
                    <span className='text-xs text-[#5A718B]'>{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Ngày bắt đầu / kết thúc */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label htmlFor='startDate' className='block text-sm font-black text-[#102033]'>
                Ngày bắt đầu <span aria-hidden='true' className='text-rose-500'>*</span>
              </label>
              <input
                id='startDate'
                type='date'
                required
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className='mt-2 w-full border border-[#CFE3F7] bg-white px-4 py-3 text-[15px] text-[#102033] outline-none transition focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/20'
              />
            </div>
            <div>
              <label htmlFor='endDate' className='block text-sm font-black text-[#102033]'>
                Ngày kết thúc <span aria-hidden='true' className='text-rose-500'>*</span>
              </label>
              <input
                id='endDate'
                type='date'
                required
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className='mt-2 w-full border border-[#CFE3F7] bg-white px-4 py-3 text-[15px] text-[#102033] outline-none transition focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/20'
              />
            </div>
          </div>

          {/* Hình thức */}
          <fieldset>
            <legend className='text-sm font-black text-[#102033]'>Hình thức học</legend>
            <div className='mt-2 flex flex-wrap gap-3'>
              {MODE_OPTIONS.map((opt) => (
                <label key={opt.value} className='cursor-pointer'>
                  <input
                    type='radio'
                    name='mode'
                    value={opt.value}
                    checked={form.mode === opt.value}
                    onChange={() => set('mode', opt.value)}
                    className='sr-only'
                  />
                  <span
                    className={`block border px-4 py-2.5 text-sm font-bold transition ${
                      form.mode === opt.value
                        ? 'border-[#004080] bg-[#EAF4FF] text-[#004080]'
                        : 'border-[#CFE3F7] bg-white text-[#33506E] hover:border-[#004080]'
                    }`}
                  >
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Chứng chỉ đầu ra */}
          <div>
            <label htmlFor='certificateOutput' className='block text-sm font-black text-[#102033]'>
              Chứng chỉ / Kết quả đầu ra <span aria-hidden='true' className='text-rose-500'>*</span>
            </label>
            <input
              id='certificateOutput'
              type='text'
              required
              value={form.certificateOutput}
              onChange={(e) => set('certificateOutput', e.target.value)}
              placeholder='VD: Chứng chỉ IC3, Chứng nhận kỹ năng nghề quốc gia...'
              className='mt-2 w-full border border-[#CFE3F7] bg-white px-4 py-3 text-[15px] text-[#102033] outline-none transition focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/20'
            />
          </div>

          {/* Mô tả */}
          <div>
            <label htmlFor='description' className='block text-sm font-black text-[#102033]'>
              Mô tả khóa học
            </label>
            <textarea
              id='description'
              rows={5}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder='Giới thiệu nội dung, đối tượng học viên, yêu cầu đầu vào...'
              className='mt-2 w-full resize-y border border-[#CFE3F7] bg-white px-4 py-3 text-[15px] text-[#102033] outline-none transition focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/20'
            />
          </div>

          {/* Error */}
          {error ? (
            <div role='alert' className='border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700'>
              {error}
            </div>
          ) : null}

          {/* Actions */}
          <div className='flex items-center gap-3 border-t border-[#EAF4FF] pt-6'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex items-center gap-2 bg-[#004080] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#003466] disabled:opacity-60'
            >
              {isSubmitting ? <Loader2 className='size-4 animate-spin' aria-hidden='true' /> : null}
              {isSubmitting ? 'Đang lưu...' : 'Tạo khóa học'}
            </button>
            <button
              type='button'
              onClick={() => navigate(ROUTE.EDUCATOR.COURSES)}
              className='border border-[#CFE3F7] px-6 py-3 text-sm font-bold text-[#33506E] transition hover:border-[#004080] hover:text-[#004080]'
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </WorkspaceShell>
  )
}
