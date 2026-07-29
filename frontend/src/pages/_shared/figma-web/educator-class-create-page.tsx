import { useState } from 'react'

import { CheckCircle2, Volume2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import toastifyCommon from '@/core/lib/toastify-common'
import { cn } from '@/core/lib/utils'
import { speakAccessibleText } from '@/core/services/speech.service'
import { trainingApi, type CourseInput } from '@/core/services/training.service'

import { workModeOptions } from './data'
import { Chip, FigmaField, PrimaryAction } from './form-controls'
import { AnimatedButton } from './interactive'
import { WorkspaceShell } from './workspace-shell'

export function FigmaEducatorClassCreatePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [durationLabel, setDurationLabel] = useState('Ngắn hạn')
  const [startDateStr, setStartDateStr] = useState('')
  const [endDateStr, setEndDateStr] = useState('')
  const [modeLabel, setModeLabel] = useState('Online')
  const [certificates, setCertificates] = useState<string[]>(['CCNA', 'TOEIC 750+'])
  const [newCertificate, setNewCertificate] = useState('')
  const [showAddCert, setShowAddCert] = useState(false)
  const [description, setDescription] = useState('')

  const handleSpeakLabel = (label: string) => {
    speakAccessibleText(label)
  }

  const handleAddCertificate = () => {
    if (newCertificate.trim()) {
      if (!certificates.includes(newCertificate.trim())) {
        setCertificates([...certificates, newCertificate.trim()])
      }
      setNewCertificate('')
      setShowAddCert(false)
    }
  }

  const handleRemoveCertificate = (item: string) => {
    setCertificates(certificates.filter(c => c !== item))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toastifyCommon.error('Vui lòng nhập tên lớp học.')
      return
    }
    if (!startDateStr.trim() || !endDateStr.trim()) {
      toastifyCommon.error('Vui lòng nhập khoảng thời gian đào tạo.')
      return
    }

    setLoading(true)
    try {
      // Map UI fields to backend DTO
      const durationMap: Record<string, 'short_term' | 'medium_term' | 'long_term'> = {
        'Ngắn hạn': 'short_term',
        'Trung hạn': 'medium_term',
        'Dài hạn': 'long_term'
      }

      const modeMap: Record<string, 'online' | 'offline' | 'hybrid'> = {
        'Online': 'online',
        'Offline': 'offline',
        'Hybrid': 'hybrid'
      }

      const payload: CourseInput = {
        title,
        durationType: durationMap[durationLabel] || 'short_term',
        startDate: startDateStr,
        endDate: endDateStr,
        mode: modeMap[modeLabel] || 'online',
        certificateOutput: certificates.join(', '),
        description: description || 'Mô tả lớp học mới.'
      }

      await trainingApi.createCourse(payload)
      toastifyCommon.success('Tạo lớp học mới thành công!')
      navigate(ROUTE.EDUCATOR.PROFILE_UPDATE) // redirect back to dashboard
    } catch (err: any) {
      console.error(err)
      toastifyCommon.error('Tạo lớp học thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <WorkspaceShell role='educator'>
      <div className='mx-auto w-full max-w-[620px]'>
        <h1 className='mb-8 flex items-center gap-2 text-[34px] font-black uppercase text-[#004080]'>
          Tạo lớp học mới
          <button
            type='button'
            onClick={() => handleSpeakLabel('Tạo lớp học mới')}
            aria-label='Đọc tiêu đề Tạo lớp học mới'
            className='rounded-full p-1 transition hover:bg-[#004080]/5'
          >
            <Volume2 className='h-5 w-5 text-[#004080]' aria-hidden='true' />
          </button>
        </h1>
        <form onSubmit={handleSubmit} className='space-y-5'>
          <FigmaField
            label='Tên lớp học'
            placeholder='Nhập tên lớp học...'
            value={title}
            onChange={setTitle}
          />
          <div className='space-y-2'>
            <span className='flex items-center gap-1.5 text-[12px] font-black text-black'>
              Thời gian đào tạo
              <button
                type='button'
                onClick={() => handleSpeakLabel('Thời gian đào tạo')}
                className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
              >
                <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
              </button>
            </span>
            {['Ngắn hạn', 'Trung hạn', 'Dài hạn'].map((item) => {
              const isSelected = durationLabel === item
              return (
                <AnimatedButton
                  key={item}
                  type='button'
                  onClick={() => setDurationLabel(item)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex h-12 w-full items-center justify-between border-l-[3px] bg-white px-4 text-[13px] font-black transition-all hover:bg-[#F5F5F5]',
                    isSelected ? 'border-[#004080] bg-[#EAF4FF] text-[#004080]' : 'border-transparent text-[#555]'
                  )}
                >
                  {item}
                  <Volume2 className='h-4 w-4 text-[#555]' aria-hidden='true' />
                </AnimatedButton>
              )
            })}
          </div>
          <div>
            <span className='mb-2 flex items-center gap-1.5 text-[12px] font-black text-black'>
              Khoảng thời gian cụ thể
              <button
                type='button'
                onClick={() => handleSpeakLabel('Khoảng thời gian cụ thể')}
                className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
              >
                <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
              </button>
            </span>
            <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-5'>
              <FigmaField
                label=''
                placeholder='MM/YYYY (Bắt đầu)'
                value={startDateStr}
                onChange={setStartDateStr}
              />
              <span className='text-[#777]'>-</span>
              <FigmaField
                label=''
                placeholder='MM/YYYY (Kết thúc)'
                value={endDateStr}
                onChange={setEndDateStr}
              />
            </div>
          </div>
          <div>
            <span className='mb-2 flex items-center gap-1.5 text-[12px] font-black text-black'>
              Hình thức
              <button
                type='button'
                onClick={() => handleSpeakLabel('Hình thức')}
                className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
              >
                <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
              </button>
            </span>
            <div className='grid gap-3 md:grid-cols-3'>
              {workModeOptions.map(([Icon, label]) => {
                const isSelected = modeLabel === label
                return (
                  <AnimatedButton
                    key={label}
                    type='button'
                    onClick={() => setModeLabel(label)}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex h-24 flex-col items-center justify-center border-t-[3px] bg-white text-[11px] font-black uppercase transition-all hover:bg-[#F5F5F5]',
                      isSelected ? 'border-[#004080] bg-[#EAF4FF] text-[#004080]' : 'border-transparent text-[#555]'
                    )}
                  >
                    <Icon className='mb-2 h-6 w-6' aria-hidden='true' />
                    {label}
                    <Volume2 className='mt-2 h-3 w-3 text-[#555]' aria-hidden='true' />
                  </AnimatedButton>
                )
              })}
            </div>
          </div>
          <div>
            <span className='mb-2 flex items-center gap-1.5 text-[12px] font-black text-black'>
              Chứng chỉ đầu ra
              <button
                type='button'
                onClick={() => handleSpeakLabel('Chứng chỉ đầu ra')}
                className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
              >
                <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
              </button>
            </span>
            <div className='min-h-12 border border-[#CFE3F7] bg-white px-3 py-3 flex flex-wrap gap-2 items-center'>
              {certificates.map((cert) => (
                <Chip key={cert} removable onRemove={() => handleRemoveCertificate(cert)}>
                  {cert}
                </Chip>
              ))}
              {showAddCert ? (
                <div className='flex items-center gap-1'>
                  <input
                    aria-label='Nhập chứng chỉ đầu ra'
                    className='h-7 w-28 border border-[#CFE3F7] px-2 text-[10px] outline-none'
                    placeholder='Tên chứng chỉ'
                    value={newCertificate}
                    onChange={(e) => setNewCertificate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCertificate()}
                    autoFocus
                  />
                  <button
                    type='button'
                    onClick={handleAddCertificate}
                    className='h-7 bg-[#004080] text-white px-2 text-[10px] font-bold uppercase'
                  >
                    Thêm
                  </button>
                </div>
              ) : (
                <AnimatedButton
                  type='button'
                  onClick={() => setShowAddCert(true)}
                  className='ml-2 bg-[#F2F2F2] px-3 py-1.5 text-[10px] font-black uppercase text-[#555] hover:bg-[#E7E7E7]'
                >
                  + Thêm mới
                </AnimatedButton>
              )}
            </div>
          </div>
          <FigmaField
            label='Mô tả'
            placeholder='Nhập mô tả chi tiết về khóa học...'
            textarea
            value={description}
            onChange={setDescription}
          />
          <PrimaryAction type='submit' disabled={loading}>
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                ĐANG LƯU...
              </span>
            ) : (
              <>
                Hoàn tất <CheckCircle2 className='ml-2 inline h-4 w-4' aria-hidden='true' />
              </>
            )}
          </PrimaryAction>
        </form>
      </div>
    </WorkspaceShell>
  )
}
