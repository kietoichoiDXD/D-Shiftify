import { useState } from 'react'

import { Bell, LogOut, ShieldCheck, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'
import { speakAccessibleText } from '@/core/services/speech.service'
import { useAuthStore } from '@/core/store/features/auth/authStore'

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition',
        checked ? 'bg-[#004080]' : 'bg-slate-300'
      )}
    >
      <span className={cn('inline-block size-5 transform rounded-full bg-white transition', checked ? 'translate-x-5' : 'translate-x-0.5')} />
    </button>
  )
}

export default function AccountSettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [emailNotif, setEmailNotif] = useState(true)
  const [autoSpeak, setAutoSpeak] = useState(false)

  const handleLogout = () => {
    logout()
    navigate(ROUTE.PUBLIC.LOGIN)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#F8FBFF] to-[#EAF4FF] px-4 py-10 sm:px-6'>
      <div className='mx-auto w-full max-w-[760px]'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-balance text-3xl font-black text-[#004080]'>Cài đặt tài khoản</h1>
            <p className='mt-2 text-pretty text-[15px] text-[#33506E]'>Quản lý thông tin, thông báo và bảo mật của bạn.</p>
          </div>
          <button
            type='button'
            aria-label='Nghe mô tả trang cài đặt'
            onClick={() => void speakAccessibleText('Trang cài đặt tài khoản. Quản lý thông tin, thông báo và bảo mật.')}
            className='inline-flex size-10 items-center justify-center rounded-full text-[#004080] transition hover:bg-white'
          >
            <Volume2 className='size-5' />
          </button>
        </div>

        <section className='mt-7 border border-[#CFE3F7] bg-white p-6 shadow-sm'>
          <h2 className='text-sm font-black uppercase tracking-[0.04em] text-[#004080]'>Thông tin tài khoản</h2>
          <dl className='mt-4 space-y-3'>
            <div className='flex justify-between gap-4'>
              <dt className='text-sm text-[#5A718B]'>Tên</dt>
              <dd className='font-semibold text-[#102033]'>{user?.name || '—'}</dd>
            </div>
            <div className='flex justify-between gap-4'>
              <dt className='text-sm text-[#5A718B]'>Email</dt>
              <dd className='font-semibold text-[#102033]'>{user?.email || '—'}</dd>
            </div>
          </dl>
        </section>

        <section className='mt-4 border border-[#CFE3F7] bg-white p-6 shadow-sm'>
          <h2 className='flex items-center gap-2 text-sm font-black uppercase tracking-[0.04em] text-[#004080]'>
            <Bell className='size-4' /> Thông báo & Trợ năng
          </h2>
          <div className='mt-4 space-y-4'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='font-semibold text-[#102033]'>Nhận thông báo qua email</p>
                <p className='text-sm text-[#5A718B]'>Cập nhật về việc làm và thư mời.</p>
              </div>
              <Toggle checked={emailNotif} onChange={setEmailNotif} label='Bật thông báo email' />
            </div>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='font-semibold text-[#102033]'>Tự động đọc nội dung</p>
                <p className='text-sm text-[#5A718B]'>Đọc to nội dung khi mở trang (trợ năng).</p>
              </div>
              <Toggle checked={autoSpeak} onChange={setAutoSpeak} label='Bật tự động đọc nội dung' />
            </div>
          </div>
        </section>

        <section className='mt-4 border border-[#CFE3F7] bg-white p-6 shadow-sm'>
          <h2 className='flex items-center gap-2 text-sm font-black uppercase tracking-[0.04em] text-[#004080]'>
            <ShieldCheck className='size-4' /> Bảo mật
          </h2>
          {/* TODO(backend): wire change-password endpoint. */}
          <button
            type='button'
            className='mt-4 border border-[#CFE3F7] px-5 py-2.5 text-sm font-bold text-[#004080] transition hover:border-[#004080]'
          >
            Đổi mật khẩu
          </button>
        </section>

        <button
          type='button'
          onClick={handleLogout}
          className='mt-6 inline-flex items-center gap-2 bg-rose-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-700'
        >
          <LogOut className='size-4' /> Đăng xuất
        </button>
      </div>
    </div>
  )
}
