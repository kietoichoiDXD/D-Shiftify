import { useCallback, useEffect, useState } from 'react'

import { CalendarClock, ClipboardList, FileText, Loader2, MapPin, Volume2, Wallet } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTE } from '@/core/constants/path'
import toastifyCommon from '@/core/lib/toastify-common'
import { type JobRecord, jobApi } from '@/core/services/job.service'
import { speakAccessibleText } from '@/core/services/speech.service'

const workModeLabels: Record<string, string> = {
  remote: 'Làm việc từ xa',
  hybrid: 'Kết hợp',
  onsite: 'Tại văn phòng'
}

const jobTypeLabels: Record<string, string> = {
  full_time: 'Toàn thời gian',
  part_time: 'Bán thời gian',
  internship: 'Thực tập',
  freelance: 'Tự do'
}

const formatSalary = (job: JobRecord) => {
  const format = (value: number) => value.toLocaleString('vi-VN')
  if (job.salaryMin && job.salaryMax) return `${format(job.salaryMin)} - ${format(job.salaryMax)} VNĐ`
  if (job.salaryMin) return `Từ ${format(job.salaryMin)} VNĐ`
  if (job.salaryMax) return `Đến ${format(job.salaryMax)} VNĐ`
  return 'Thỏa thuận'
}

const formatDeadline = (deadline?: string) => {
  if (!deadline) return { date: 'Đang cập nhật', remaining: '' }
  const target = new Date(deadline)
  if (Number.isNaN(target.getTime())) return { date: deadline, remaining: '' }
  const date = target.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.')
  const days = Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return { date, remaining: days > 0 ? `Còn ${days} ngày` : 'Đã hết hạn' }
}

function SectionHeading({ icon: Icon, title, speech }: { icon: typeof FileText; title: string; speech: string }) {
  return (
    <div className='flex items-center gap-2 text-[#004080]'>
      <Icon className='size-5' aria-hidden='true' />
      <h2 className='text-[17px] font-black uppercase tracking-[0.02em]'>{title}</h2>
      <button type='button' aria-label={`Đọc ${title}`} onClick={() => void speakAccessibleText(speech)} className='hover:text-[#003466]'>
        <Volume2 className='size-4' />
      </button>
    </div>
  )
}

function GreenPanel({ icon: Icon, label, value, hint }: { icon: typeof Wallet; label: string; value: string; hint?: string }) {
  return (
    <div className='bg-emerald-600 p-5 text-white'>
      <div className='flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.08em] text-emerald-50'>
        <Icon className='size-4' aria-hidden='true' />
        {label}
      </div>
      <p className='mt-3 text-[22px] font-black leading-tight'>{value}</p>
      {hint ? (
        <p className='mt-2 inline-flex items-center bg-white/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wide'>{hint}</p>
      ) : null}
    </div>
  )
}

export function JobDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<JobRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    jobApi
      .get(id)
      .then((data) => active && setJob(data))
      .catch(() => active && toastifyCommon.error('Không thể tải chi tiết công việc.'))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const handleApply = useCallback(async () => {
    setIsApplying(true)
    try {
      const cv = await jobApi.getCurrentCv()
      await jobApi.apply(id, cv.id)
      toastifyCommon.success('Ứng tuyển thành công.')
    } catch {
      navigate(ROUTE.DISABILITY.CV)
    } finally {
      setIsApplying(false)
    }
  }, [id, navigate])

  if (isLoading) {
    return (
      <div className='mx-auto flex max-w-[1280px] items-center justify-center px-6 py-24 text-[#004080]'>
        <Loader2 className='size-6 animate-spin' />
      </div>
    )
  }

  if (!job) {
    return (
      <div className='mx-auto max-w-[1280px] px-6 py-20 text-center text-[#334155]'>
        <p className='font-bold'>Không tìm thấy công việc.</p>
        <Button type='button' variant='outline' className='mt-4' onClick={() => navigate(ROUTE.DISABILITY.JOBS)}>
          Quay lại tìm việc
        </Button>
      </div>
    )
  }

  const deadline = formatDeadline(job.deadline)
  const hardSkills = job.skills.filter((skill) => skill.type !== 'soft_skill').map((skill) => skill.name)
  const fullSpeech = `${job.title}. ${job.description || ''}. Yêu cầu: ${job.requirements || job.experienceRequired || ''}. Mức lương ${formatSalary(job)}.`

  return (
    <section className='mx-auto w-full max-w-[1280px] px-5 py-8 text-[#102033] sm:px-6'>
      <nav className='mb-6 text-[11px] font-black uppercase tracking-[0.12em] text-[#64748B]' aria-label='Breadcrumb'>
        Thông tin doanh nghiệp <span className='mx-2 text-[#CBD5E1]'>|</span>
        <span className='text-[#004080]'>Chi tiết công việc</span>
      </nav>

      <div className='grid gap-8 lg:grid-cols-[1fr_320px]'>
        <div className='space-y-8'>
          <div className='flex items-center gap-3'>
            <h1 className='text-[34px] font-black uppercase leading-tight text-[#102033]'>{job.title}</h1>
            <button type='button' aria-label='Đọc tên công việc' onClick={() => void speakAccessibleText(fullSpeech)} className='text-[#004080] hover:text-[#003466]'>
              <Volume2 className='size-5' />
            </button>
          </div>

          <div className='space-y-4'>
            <SectionHeading icon={FileText} title='Mô tả công việc' speech={job.description || 'Chưa có mô tả.'} />
            <p className='whitespace-pre-line text-pretty text-[15px] leading-7 text-[#334155]'>
              {job.description || 'Doanh nghiệp chưa cập nhật mô tả chi tiết.'}
            </p>
          </div>

          <div className='space-y-4'>
            <SectionHeading icon={ClipboardList} title='Yêu cầu công việc' speech={job.requirements || job.experienceRequired || 'Chưa có yêu cầu.'} />
            {job.experienceRequired ? (
              <div>
                <span className='inline-flex bg-[#EAF4FF] px-3 py-1 text-[12px] font-black uppercase text-[#004080]'>Kinh nghiệm làm việc</span>
                <p className='mt-2 text-[15px] leading-7 text-[#334155]'>{job.experienceRequired}</p>
              </div>
            ) : null}
            {hardSkills.length > 0 ? (
              <div>
                <span className='inline-flex bg-[#EAF4FF] px-3 py-1 text-[12px] font-black uppercase text-[#004080]'>Kỹ năng chuyên môn</span>
                <p className='mt-2 text-[15px] leading-7 text-[#334155]'>{hardSkills.join(', ')}</p>
              </div>
            ) : null}
            {job.requirements ? (
              <p className='whitespace-pre-line text-[15px] leading-7 text-[#334155]'>{job.requirements}</p>
            ) : null}
          </div>

          <Button
            type='button'
            onClick={() => void handleApply()}
            disabled={isApplying}
            className='h-12 min-w-[180px] rounded-none bg-black text-xs font-black uppercase tracking-[0.08em] text-white hover:bg-slate-800'
          >
            {isApplying ? <Loader2 className='size-4 animate-spin' /> : 'Ứng tuyển'}
          </Button>
        </div>

        <aside className='space-y-4'>
          <GreenPanel icon={CalendarClock} label='Hạn tuyển dụng' value={deadline.date} hint={deadline.remaining} />
          <GreenPanel icon={Wallet} label='Mức lương' value={formatSalary(job)} hint='Hàng tháng' />
          <GreenPanel
            icon={MapPin}
            label='Hình thức'
            value={jobTypeLabels[job.jobType] || job.jobType || 'Toàn thời gian'}
            hint={workModeLabels[job.workMode] || job.location}
          />
        </aside>
      </div>
    </section>
  )
}
