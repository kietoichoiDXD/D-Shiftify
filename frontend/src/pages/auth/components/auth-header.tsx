import { ArrowLeft, HelpCircle, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import Logo from '@/components/logo/logo'

export const AuthHeader = () => {
  const navigate = useNavigate()

  return (
    <header className='relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-3 sm:px-8 lg:px-6'>
      <div className='flex items-center gap-2'>
        <button
          type='button'
          className='inline-flex h-9 w-9 items-center justify-center rounded-md text-brand-primary transition hover:bg-brand-bg-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden'
          aria-label='Quay lại'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className='h-4 w-4' aria-hidden='true' />
        </button>
        <Logo className='[&_img]:h-8 sm:[&_img]:h-9' />
      </div>

      <div className='flex items-center gap-2 text-brand-primary'>
        <button
          type='button'
          className='inline-flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-brand-bg-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
          aria-label='Trợ giúp'
        >
          <HelpCircle className='h-4 w-4' aria-hidden='true' />
        </button>
        <button
          type='button'
          className='inline-flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-brand-bg-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
          aria-label='Cài đặt'
        >
          <Settings className='h-4 w-4' aria-hidden='true' />
        </button>
      </div>
    </header>
  )
}
