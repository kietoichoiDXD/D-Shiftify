import { type ComponentType, useEffect, useState } from 'react'

import { BriefcaseBusiness, CalendarDays, MessageSquare, Plus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { jobApi } from '@/core/services/job.service'
import { WorkspaceShell } from '@/pages/_shared/figma-web/workspace-shell'

type Shortcut = { label: string; description: string; to: string; icon: ComponentType<{ className?: string }> }

const shortcuts: Shortcut[] = [
  { label: 'Ứng viên', description: 'Xem ứng viên ứng tuyển và gợi ý phù hợp.', to: ROUTE.BUSINESS.CANDIDATES, icon: Users },
  { label: 'Danh sách công việc', description: 'Quản lý tin tuyển dụng đang mở.', to: ROUTE.BUSINESS.JOBS, icon: BriefcaseBusiness },
  { label: 'Tin nhắn', description: 'Trao đổi với ứng viên.', to: ROUTE.BUSINESS.MESSAGES, icon: MessageSquare },
  { label: 'Lịch trình', description: 'Lịch phỏng vấn và sự kiện tuyển dụng.', to: ROUTE.BUSINESS.SCHEDULE, icon: CalendarDays }
]

export default function BusinessDashboardPage() {
  const [jobCount, setJobCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    void jobApi
      .list({ page: 1, limit: 1 })
      .then((response) => active && setJobCount(response.meta?.total ?? response.data.length))
      .catch(() => active && setJobCount(null))
    return () => {
      active = false
    }
  }, [])

  return (
    <WorkspaceShell role='business'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-balance text-3xl font-black text-[#004080]'>Bảng điều khiển</h1>
          <p className='mt-2 text-pretty text-[15px] text-[#33506E]'>Tổng quan hoạt động tuyển dụng của doanh nghiệp.</p>
        </div>
        <Link
          to={ROUTE.BUSINESS.JOB_CREATE}
          className='inline-flex items-center gap-2 bg-[#004080] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#003466]'
        >
          <Plus className='size-4' /> Tạo việc mới
        </Link>
      </div>

      <div className='mt-7 grid gap-4 sm:grid-cols-3'>
        <Stat label='Tin đang tuyển' value={jobCount} accent />
        <Stat label='Ứng viên mới' value={null} hint='Đang cập nhật' />
        <Stat label='Phỏng vấn tuần này' value={null} hint='Đang cập nhật' />
      </div>

      <div className='mt-8 grid gap-4 sm:grid-cols-2'>
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon
          return (
            <div
              key={shortcut.label}
              className='group relative flex items-start gap-4 border border-[#CFE3F7] bg-white p-5 shadow-sm transition hover:border-[#004080] hover:shadow-md'
            >
              <span className='inline-flex size-11 items-center justify-center rounded-md bg-[#EAF4FF] text-[#004080]'>
                <Icon className='size-5' />
              </span>
              <div>
                <Link to={shortcut.to} className='text-lg font-black text-[#004080] after:absolute after:inset-0'>
                  {shortcut.label}
                </Link>
                <p className='mt-1 text-pretty text-sm leading-6 text-[#5A718B]'>{shortcut.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </WorkspaceShell>
  )
}

function Stat({ label, value, hint, accent }: { label: string; value: number | null; hint?: string; accent?: boolean }) {
  return (
    <div className='border border-[#CFE3F7] bg-white p-5 shadow-sm'>
      <p className='text-xs font-bold uppercase tracking-[0.04em] text-[#5A718B]'>{label}</p>
      <p className='mt-2 text-3xl font-black tabular-nums text-[#004080]'>
        {value !== null ? value : <span className='text-base font-semibold text-slate-400'>{hint ?? '—'}</span>}
      </p>
      {accent ? <span className='mt-1 block h-1 w-10 bg-[#004080]' /> : null}
    </div>
  )
}
