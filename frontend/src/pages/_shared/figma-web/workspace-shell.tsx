import { type ReactNode } from 'react'

import { Bell, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'
import { useAuthStore } from '@/core/store/features/auth/authStore'

import { type WorkspaceRole } from './data'

type NavItem = { label: string; to: string }

const navByRole: Record<WorkspaceRole, NavItem[]> = {
  business: [
    { label: 'Dashboard', to: ROUTE.BUSINESS.DASHBOARD },
    { label: 'Tin nhắn', to: ROUTE.BUSINESS.MESSAGES },
    { label: 'Ứng viên', to: ROUTE.BUSINESS.CANDIDATES },
    { label: 'Danh sách công việc', to: ROUTE.BUSINESS.JOBS },
    { label: 'Lịch trình', to: ROUTE.BUSINESS.SCHEDULE },
    { label: 'Hồ sơ', to: ROUTE.BUSINESS.PROFILE }
  ],
  educator: [
    { label: 'Dashboard', to: ROUTE.EDUCATOR.DASHBOARD },
    { label: 'Tin nhắn', to: ROUTE.EDUCATOR.DASHBOARD },
    { label: 'Học viên', to: ROUTE.EDUCATOR.DASHBOARD },
    { label: 'Lớp học', to: ROUTE.EDUCATOR.CLASS_CREATE },
    { label: 'Hồ sơ', to: ROUTE.EDUCATOR.PROFILE_UPDATE }
  ]
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

function WorkspaceTopNav({ role }: { role: WorkspaceRole }) {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const fallbackName = role === 'educator' ? 'Cơ sở A' : 'Doanh nghiệp A'
  const userName = user?.name || fallbackName
  const userEmail = user?.email || 'abc123456@gmail.com'

  return (
    <header className='sticky top-0 z-40 border-b border-[#E4E4E4] bg-white'>
      <div className='mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8'>
        <Link to={ROUTE.PUBLIC.HOME} className='text-[20px] font-black uppercase tracking-[0.16em] text-[#004080]'>
          D-Shiftify
        </Link>

        <nav className='hidden items-center gap-7 lg:flex' aria-label='Điều hướng khu làm việc'>
          {navByRole[role].map((item) => {
            const isActive = pathname === item.to || (item.to !== ROUTE.EDUCATOR.DASHBOARD && pathname.startsWith(item.to))
            return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-1 border-b-2 border-transparent py-2 text-[12px] font-bold uppercase tracking-[0.04em] text-[#49657F] transition hover:text-[#004080]',
                  isActive && 'border-[#004080] font-black text-[#004080]'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className='flex items-center gap-4'>
          <button type='button' aria-label='Thông báo' className='hidden text-[#49657F] transition hover:text-[#004080] sm:block'>
            <Bell className='h-5 w-5' />
          </button>
          <button type='button' aria-label='Cài đặt' className='hidden text-[#49657F] transition hover:text-[#004080] sm:block'>
            <Settings className='h-5 w-5' />
          </button>
          <div className='flex items-center gap-3'>
            <div className='hidden text-right sm:block'>
              <p className='text-[11px] font-black uppercase text-[#004080]'>{userName}</p>
              <p className='text-[10px] text-slate-500'>{userEmail}</p>
            </div>
            <div className='flex h-9 w-9 items-center justify-center rounded-md bg-[#004080] text-[11px] font-black text-white'>
              {getInitials(userName) || (role === 'educator' ? 'CS' : 'DN')}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export function WorkspaceShell({
  role,
  children,
  className
}: {
  role: WorkspaceRole
  children: ReactNode
  className?: string
}) {
  return (
    <section className='min-h-screen bg-gradient-to-br from-[#F8FBFF] to-[#EAF4FF] text-[#102033]'>
      <WorkspaceTopNav role={role} />
      <main className={cn('mx-auto w-full max-w-[1280px] px-5 py-10 sm:px-6', className)}>{children}</main>
    </section>
  )
}
