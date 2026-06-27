import { useMemo, useState } from 'react'

import { CalendarDays, Volume2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'
import { speakAccessibleText } from '@/core/services/speech.service'

type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected'

type Application = {
  id: string
  jobTitle: string
  company: string
  location: string
  appliedAt: string
  status: ApplicationStatus
}

const statusMeta: Record<ApplicationStatus, { label: string; className: string }> = {
  pending: { label: 'Chờ xử lý', className: 'bg-slate-100 text-slate-700' },
  reviewing: { label: 'Đang xem xét', className: 'bg-[#EAF4FF] text-[#004080]' },
  interview: { label: 'Mời phỏng vấn', className: 'bg-amber-100 text-amber-800' },
  accepted: { label: 'Được nhận', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Từ chối', className: 'bg-rose-100 text-rose-700' }
}

// TODO(backend): replace with GET /api/v1/applications/me once the endpoint is wired.
const MOCK_APPLICATIONS: Application[] = [
  { id: 'a1', jobTitle: 'Nhân viên phân tích dữ liệu', company: 'Tập đoàn Công nghệ Alpha', location: 'Hồ Chí Minh', appliedAt: '2026-06-20', status: 'interview' },
  { id: 'a2', jobTitle: 'Senior Backend Developer', company: 'Công ty Sản Xuất Y', location: 'Hà Nội', appliedAt: '2026-06-18', status: 'reviewing' },
  { id: 'a3', jobTitle: 'Content Marketing', company: 'Media Nexus Group', location: 'Đà Nẵng', appliedAt: '2026-06-12', status: 'pending' },
  { id: 'a4', jobTitle: 'Thiết kế UI/UX', company: 'Zion Tech Solutions', location: 'Hồ Chí Minh', appliedAt: '2026-06-05', status: 'rejected' }
]

const FILTERS: Array<{ key: ApplicationStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'reviewing', label: 'Đang xem xét' },
  { key: 'interview', label: 'Mời phỏng vấn' },
  { key: 'accepted', label: 'Được nhận' },
  { key: 'rejected', label: 'Từ chối' }
]

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function DisabilityApplicationsPage() {
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')

  const applications = useMemo(
    () => (filter === 'all' ? MOCK_APPLICATIONS : MOCK_APPLICATIONS.filter((item) => item.status === filter)),
    [filter]
  )

  return (
    <div className='mx-auto w-full max-w-[1000px] px-4 py-10 sm:px-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-balance text-3xl font-black text-[#004080] sm:text-[34px]'>Việc đã ứng tuyển</h1>
          <p className='mt-2 text-pretty text-[15px] leading-7 text-[#33506E]'>
            Theo dõi tiến trình tuyển dụng của từng công việc bạn đã nộp hồ sơ.
          </p>
        </div>
        <button
          type='button'
          aria-label='Nghe tổng quan trang ứng tuyển'
          onClick={() => void speakAccessibleText(`Bạn có ${MOCK_APPLICATIONS.length} công việc đã ứng tuyển.`)}
          className='inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
        >
          <Volume2 className='size-5' />
        </button>
      </div>

      <div className='mt-6 flex flex-wrap gap-2'>
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type='button'
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
            className={cn(
              'border px-4 py-2 text-sm font-bold transition',
              filter === item.key
                ? 'border-[#004080] bg-[#004080] text-white'
                : 'border-[#CFE3F7] bg-white text-[#33506E] hover:border-[#004080]'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className='mt-6 space-y-3'>
        {applications.map((application) => {
          const meta = statusMeta[application.status]
          const speech = `${application.jobTitle} tại ${application.company}. Trạng thái: ${meta.label}. Ứng tuyển ngày ${formatDate(application.appliedAt)}.`
          return (
            <li key={application.id}>
              <article className='flex flex-col gap-4 border border-[#CFE3F7] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
                <div className='min-w-0'>
                  <h2 className='text-balance text-lg font-black text-[#102033]'>{application.jobTitle}</h2>
                  <p className='mt-1 text-sm font-medium text-[#5A718B]'>
                    {application.company} | {application.location}
                  </p>
                  <p className='mt-2 inline-flex items-center gap-1.5 text-xs text-[#5A718B]'>
                    <CalendarDays className='size-3.5' aria-hidden='true' />
                    Ứng tuyển ngày {formatDate(application.appliedAt)}
                  </p>
                </div>
                <div className='flex items-center gap-3 sm:flex-col sm:items-end'>
                  <span className={cn('rounded-full px-3 py-1 text-xs font-black uppercase', meta.className)}>{meta.label}</span>
                  <button
                    type='button'
                    aria-label={`Nghe trạng thái ${application.jobTitle}`}
                    onClick={() => void speakAccessibleText(speech)}
                    className='inline-flex size-9 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
                  >
                    <Volume2 className='size-4' />
                  </button>
                </div>
              </article>
            </li>
          )
        })}
      </ul>

      {applications.length === 0 ? (
        <div className='mt-6 border border-dashed border-[#CFE3F7] bg-white p-10 text-center'>
          <p className='font-bold text-[#33506E]'>Chưa có công việc nào ở trạng thái này.</p>
          <Link to={ROUTE.DISABILITY.JOBS} className='mt-3 inline-block font-bold text-[#004080] underline'>
            Tìm việc phù hợp
          </Link>
        </div>
      ) : null}
    </div>
  )
}
