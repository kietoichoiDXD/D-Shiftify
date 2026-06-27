import { type ComponentType, useEffect, useState } from 'react'

import { Bell, BriefcaseBusiness, FileText, Search, UserRound, Volume2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'
import { jobApi } from '@/core/services/job.service'
import { speakAccessibleText } from '@/core/services/speech.service'
import { useAuthStore } from '@/core/store/features/auth/authStore'

type Shortcut = {
  label: string
  description: string
  to: string
  icon: ComponentType<{ className?: string }>
}

const shortcuts: Shortcut[] = [
  { label: 'Tìm việc', description: 'Khám phá công việc phù hợp với hồ sơ của bạn.', to: ROUTE.DISABILITY.JOBS, icon: Search },
  { label: 'Ứng tuyển', description: 'Theo dõi các công việc bạn đã ứng tuyển.', to: ROUTE.DISABILITY.APPLICATIONS, icon: BriefcaseBusiness },
  { label: 'Thông báo', description: 'Xem thư mời và cập nhật mới nhất.', to: ROUTE.DISABILITY.NOTIFICATIONS, icon: Bell },
  { label: 'Hồ sơ năng lực', description: 'Cập nhật CV để tăng độ phù hợp.', to: ROUTE.DISABILITY.CV, icon: FileText },
  { label: 'Thông tin cá nhân', description: 'Quản lý thông tin và tình trạng hỗ trợ.', to: ROUTE.DISABILITY.PROFILE, icon: UserRound }
]

function SpeakButton({ text, label }: { text: string; label: string }) {
  return (
    <button
      type='button'
      aria-label={label}
      onClick={() => void speakAccessibleText(text)}
      className='inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
    >
      <Volume2 className='size-4' />
    </button>
  )
}

export default function DisabilityDashboardPage() {
  const { user } = useAuthStore()
  const userName = user?.name || 'Trần Văn A'
  // TODO(backend): replace with a dashboard summary endpoint (applications, matches, unread).
  const [jobCount, setJobCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    void jobApi
      .list({ page: 1, limit: 1 })
      .then((response) => {
        if (active) setJobCount(response.meta?.total ?? response.data.length)
      })
      .catch(() => active && setJobCount(null))
    return () => {
      active = false
    }
  }, [])

  const greeting = `Xin chào ${userName}. Đây là trang tổng quan của bạn.`

  return (
    <div className='mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.12em] text-[#3F6FA8]'>Tổng quan</p>
          <h1 className='mt-1 text-balance text-3xl font-black text-[#004080] sm:text-[34px]'>Xin chào, {userName}</h1>
          <p className='mt-2 max-w-xl text-pretty text-[15px] leading-7 text-[#33506E]'>
            Chọn một mục bên dưới để bắt đầu. Mỗi mục đều có nút loa để nghe nội dung.
          </p>
        </div>
        <SpeakButton text={greeting} label='Nghe lời chào' />
      </div>

      {jobCount !== null ? (
        <div className='mt-7 flex items-center gap-3 border-l-4 border-[#004080] bg-white p-4 shadow-sm'>
          <span className='text-2xl font-black tabular-nums text-[#004080]'>{jobCount}</span>
          <p className='text-sm font-medium text-[#33506E]'>công việc đang tuyển dụng phù hợp để bạn khám phá.</p>
          <SpeakButton text={`Hiện có ${jobCount} công việc đang tuyển dụng.`} label='Nghe số lượng công việc' />
        </div>
      ) : null}

      <div className='mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon
          return (
            <div
              key={shortcut.label}
              className={cn(
                'group relative flex flex-col gap-3 border border-[#CFE3F7] bg-white p-5 shadow-sm transition',
                'hover:border-[#004080] hover:shadow-md'
              )}
            >
              <div className='flex items-center justify-between'>
                <span className='inline-flex size-11 items-center justify-center rounded-md bg-[#EAF4FF] text-[#004080]'>
                  <Icon className='size-5' />
                </span>
                <SpeakButton text={`${shortcut.label}. ${shortcut.description}`} label={`Nghe ${shortcut.label}`} />
              </div>
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
    </div>
  )
}
