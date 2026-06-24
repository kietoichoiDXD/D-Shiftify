import { type ReactNode } from 'react'

import { cn } from '@/core/lib/utils'

interface AuthPatternShellProps {
  children: ReactNode
  className?: string
  innerClassName?: string
}

export const AuthPatternShell = ({ children, className, innerClassName }: AuthPatternShellProps) => (
  <main className={cn('min-h-screen bg-white text-brand-primary', className)}>
    <div className='mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-3 py-3 sm:px-4 sm:py-4'>
      <div className='mb-2 flex items-center justify-between px-2 py-1'>
        <img src='/logo.svg' alt='D-Shiftify' className='h-4 w-auto' />
        <div className='flex items-center gap-3 text-brand-primary'>
          <button type='button' className='inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100' aria-label='Trợ giúp'>
            ?
          </button>
          <button type='button' className='inline-flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100' aria-label='Cài đặt'>
            ⚙
          </button>
        </div>
      </div>

      <section
        className={cn(
          'relative flex min-h-[calc(100vh-88px)] overflow-hidden rounded-[2px] border border-slate-200 bg-[linear-gradient(90deg,rgba(240,240,240,0.55)_1px,transparent_1px),linear-gradient(rgba(240,240,240,0.55)_1px,transparent_1px)] bg-[size:36px_36px] shadow-[0_0_0_3px_rgba(3,102,214,0.95)_inset]',
          innerClassName
        )}
      >
        {children}
      </section>
    </div>
  </main>
)
