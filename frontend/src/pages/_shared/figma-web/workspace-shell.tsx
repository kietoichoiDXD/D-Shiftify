import { type ReactNode } from 'react'

import { Volume2 } from 'lucide-react'

import { cn } from '@/core/lib/utils'

import { type WorkspaceRole } from './data'
import { AnimatedButton } from './interactive'

const navByRole: Record<WorkspaceRole, string[]> = {
  business: ['Dashboard', 'Tin nhắn', 'Ứng viên', 'Danh sách công việc', 'Lịch trình', 'Hồ sơ'],
  educator: ['Dashboard', 'Tin nhắn', 'Học viên', 'Lớp học', 'Hồ sơ']
}

const activeByRole: Record<WorkspaceRole, string[]> = {
  business: ['Danh sách công việc', 'Hồ sơ'],
  educator: ['Lớp học', 'Hồ sơ']
}

function WorkspaceTopNav({ role }: { role: WorkspaceRole }) {
  return (
    <header className='sticky top-0 z-40 border-b border-[#E8E8E8] bg-white'>
      <div className='mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 sm:px-7'>
        <div className='text-[18px] font-black uppercase tracking-[0.22em] text-black'>D-Shiftify</div>
        <nav className='hidden items-center gap-6 lg:flex' aria-label='Điều hướng khu làm việc'>
          {navByRole[role].map((item) => (
            <AnimatedButton
              key={item}
              aria-current={activeByRole[role].includes(item) ? 'page' : undefined}
              className={cn(
                'flex items-center gap-1 border-b-2 border-transparent py-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#555]',
                activeByRole[role].includes(item) ? 'border-black text-black' : 'hover:border-black/30 hover:text-black'
              )}
            >
              <Volume2 className='h-3 w-3' aria-hidden='true' />
              {item}
            </AnimatedButton>
          ))}
        </nav>
        <div className='flex items-center gap-3 rounded-lg bg-white px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)]'>
          <div className='text-right'>
            <p className='text-[11px] font-black uppercase text-black'>{role === 'educator' ? 'Cơ sở A' : 'Doanh nghiệp A'}</p>
            <p className='text-[10px] text-[#777]'>abc123456@gmail.com</p>
          </div>
          <div className='flex h-8 w-8 items-center justify-center rounded-md bg-black text-[10px] font-black text-white'>
            {role === 'educator' ? 'CS' : 'DN'}
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
    <section className='min-h-screen bg-white text-black'>
      <WorkspaceTopNav role={role} />
      <main className={cn('mx-auto w-full max-w-[1280px] bg-[#FAFAFA] px-5 py-10 sm:px-6', className)}>{children}</main>
    </section>
  )
}
