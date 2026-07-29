import { useMemo, useRef, useState } from 'react'

import { motion } from 'framer-motion'
import {
  BriefcaseBusiness,
  CircleHelp,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mic,
  Settings,
  UserRound,
  Volume2
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { getDashboardRouteByRole } from '@/core/helpers/auth-route'
import { cn } from '@/core/lib/utils'
import { authApi } from '@/core/services/auth.service'
import { setToken, setUserToLS } from '@/core/shared/storage'
import { useAuthStore } from '@/core/store/features/auth/authStore'

type AuthRole = 'disability' | 'business' | 'educator'

interface FigmaAuthShellProps {
  mode: 'login' | 'register'
}

const roleOptions = [
  { id: 'disability', label: 'Bạn là người khiếm thị', icon: UserRound },
  { id: 'business', label: 'Bạn là nhà tuyển dụng', icon: BriefcaseBusiness },
  { id: 'educator', label: 'Bạn là người đào tạo', icon: GraduationCap }
] satisfies Array<{ id: AuthRole; label: string; icon: typeof UserRound }>

const roleApiValue: Record<AuthRole, string> = {
  disability: 'candidate',
  business: 'recruiter',
  educator: 'training_center'
}

function AuthHeader() {
  return (
    <header className='relative z-10 flex h-[70px] items-center justify-between border-b border-gray-100 bg-white px-8 sm:px-11'>
      <Link to={ROUTE.PUBLIC.HOME} className='text-[14px] font-black uppercase tracking-[0.22em] text-[#111]'>
        D-SHIFTIFY
      </Link>
      <div className='flex items-center gap-5 text-[#111]'>
        <button type='button' aria-label='Trợ giúp' className='rounded-sm p-1 hover:bg-black/5'>
          <CircleHelp className='h-[20px] w-[20px]' />
        </button>
        <button type='button' aria-label='Cài đặt' className='rounded-sm p-1 hover:bg-black/5'>
          <Settings className='h-[20px] w-[20px]' />
        </button>
      </div>
    </header>
  )
}

function CheckerboardStage({ children }: { children: React.ReactNode }) {
  return (
    <main className='mx-auto flex min-h-[calc(100vh-70px)] w-full max-w-[1280px] items-center justify-center bg-white px-5 pb-12'>
      <div
        className='relative flex min-h-[760px] w-full items-center justify-center overflow-hidden rounded-[24px] border border-gray-200/50 bg-[#FAFAFA] shadow-sm lg:justify-end lg:pr-[10%]'
        style={{
          backgroundImage:
            'linear-gradient(45deg, #EBEBEB 25%, transparent 25%), linear-gradient(-45deg, #EBEBEB 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #EBEBEB 75%), linear-gradient(-45deg, transparent 75%, #EBEBEB 75%)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px'
        }}
      >
        <div className='relative z-10 flex w-full justify-center lg:justify-end'>{children}</div>
      </div>
    </main>
  )
}

function FigmaInput({
  label,
  name,
  type = 'text',
  showEye = false
}: {
  label: string
  name: string
  type?: string
  showEye?: boolean
}) {
  const [value, setValue] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const isPassword = type === 'password'
  const currentType = isPassword ? (showPass ? 'text' : 'password') : type

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Trình duyệt không hỗ trợ nhận diện giọng nói.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'vi-VN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event: any) => setValue(event.results[0][0].transcript)
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  const speakText = () => {
    if (!window.speechSynthesis) {
      alert('Trình duyệt không hỗ trợ đọc văn bản.')
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(value || label)
    utterance.lang = 'vi-VN'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <label className='relative block'>
      <span className='sr-only'>{label}</span>
      <input
        name={name}
        type={currentType}
        placeholder={label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        required
        className='h-[54px] w-full border border-[#BDBDBD] bg-white px-6 pr-28 text-[13px] font-bold text-[#111] outline-none transition placeholder:text-[#777] focus:border-black focus:ring-1 focus:ring-black'
      />
      <span className='absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-3 text-[#555]'>
        <button
          type='button'
          onClick={startSpeechRecognition}
          className={cn('rounded p-1 hover:text-black', isListening && 'animate-pulse text-red-500')}
          aria-label='Nhập bằng giọng nói'
        >
          <Mic className='h-4 w-4' />
        </button>
        <button type='button' onClick={speakText} className='p-1 hover:text-black' aria-label='Đọc nội dung'>
          <Volume2 className='h-4 w-4' />
        </button>
        {showEye ? (
          <button type='button' onClick={() => setShowPass(!showPass)} className='p-1 hover:text-black' aria-label='Ẩn hiện mật khẩu'>
            {showPass ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
          </button>
        ) : null}
      </span>
    </label>
  )
}

function AuthCard({ mode, role }: { mode: 'login' | 'register'; role: AuthRole }) {
  const navigate = useNavigate()
  const { loginStart, loginSuccess, loginFailure } = useAuthStore()
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const isRegister = mode === 'register'

  const fields = useMemo(() => {
    if (!isRegister) {
      return [
        { label: 'Nhập email hoặc số điện thoại', name: 'email' },
        { label: 'Nhập mật khẩu', name: 'password', type: 'password', showEye: true }
      ]
    }

    if (role === 'disability') {
      return [
        { label: 'Email hoặc số điện thoại', name: 'email_or_phone' },
        { label: 'Mật khẩu', name: 'password', type: 'password', showEye: true },
        { label: 'Nhập lại mật khẩu', name: 'confirm_password', type: 'password', showEye: true }
      ]
    }

    const baseFields = [
      { label: 'Số điện thoại', name: 'phone' },
      { label: 'Email', name: 'email' },
      { label: 'Mật khẩu', name: 'password', type: 'password', showEye: true },
      { label: 'Nhập lại mật khẩu', name: 'confirm_password', type: 'password', showEye: true }
    ]

    return role === 'educator' ? [...baseFields, { label: 'Chức vụ', name: 'job_title' }] : baseFields
  }, [isRegister, role])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMsg('')
    loginStart()

    const form = formRef.current!
    const getData = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value?.trim() ?? ''

    try {
      if (!isRegister) {
        const res = await authApi.login({ email: getData('email'), password: getData('password') })
        const data = (res as any).data ?? res
        setToken(data.accessToken, data.refreshToken)
        setUserToLS(data.user)
        loginSuccess(data)

        const userRole = data.user?.role ?? ''
        navigate(getDashboardRouteByRole(userRole))
        return
      }

      const password = getData('password')
      const confirmPassword = getData('confirm_password')
      if (password.length < 8) {
        setErrorMsg('Mật khẩu phải có ít nhất 8 ký tự')
        loginFailure('Mật khẩu quá ngắn')
        return
      }

      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu không khớp')
        loginFailure('Mật khẩu không khớp')
        return
      }

      let email = ''
      let phone = ''
      let fullName = ''

      if (role === 'disability') {
        const input = getData('email_or_phone')
        email = input.includes('@') ? input : `${input}@shiftify.com`
        phone = input.includes('@') ? '0900000000' : input
        fullName = 'Ứng viên Shiftify'
      } else if (role === 'business') {
        email = getData('email')
        phone = getData('phone')
        fullName = 'Doanh nghiệp Shiftify'
      } else {
        email = getData('email')
        phone = getData('phone')
        fullName = getData('job_title') || 'Người đào tạo Shiftify'
      }

      if (!/^[0-9]{10,11}$/.test(phone)) {
        setErrorMsg('Số điện thoại phải có từ 10 đến 11 chữ số')
        loginFailure('Số điện thoại không hợp lệ')
        return
      }

      await authApi.register({ email, phone, password, name: fullName, role: roleApiValue[role], full_name: fullName } as any)
      navigate(ROUTE.PUBLIC.LOGIN + '?registered=1')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Đã xảy ra lỗi, thử lại sau.'
      setErrorMsg(msg)
      loginFailure(msg)
    }
  }

  return (
    <motion.form
      ref={formRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit}
      className='w-full max-w-[430px] rounded-[36px] border border-gray-200/50 bg-white px-11 py-12 shadow-[0_20px_50px_rgba(0,0,0,0.06)]'
    >
      <div className='mb-8 text-center'>
        <h1 className='text-[30px] font-black tracking-[-0.01em] text-[#111]'>{isRegister ? 'Đăng ký' : 'Đăng nhập'}</h1>
        <p className='mx-auto mt-2 max-w-[240px] text-[13px] font-bold text-[#555]'>Bắt đầu hành trình mới cùng D-SHIFTIFY</p>
      </div>

      <div className='space-y-4'>
        {fields.map((field) => (
          <FigmaInput key={field.name} name={field.name} label={field.label} type={field.type} showEye={field.showEye} />
        ))}
      </div>

      {errorMsg ? <p className='mt-4 rounded-md bg-red-50 px-4 py-2 text-[12px] font-medium text-red-600'>{errorMsg}</p> : null}

      <button
        type='submit'
        className='mt-7 h-[58px] w-full rounded-full bg-[#1A1A1A] text-[13px] font-black uppercase tracking-[0.15em] text-white shadow-[0_12px_20px_rgba(0,0,0,0.18)] transition hover:bg-black active:scale-[0.98]'
      >
        {isRegister ? 'Đăng ký' : 'Đăng nhập'}
      </button>

      <div className='my-6 flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-[#999]'>
        <span className='h-px flex-1 bg-gray-200' />
        Hoặc
        <span className='h-px flex-1 bg-gray-200' />
      </div>

      <div className='space-y-3'>
        <button type='button' className='flex h-[50px] w-full items-center justify-center gap-3 border border-[#BDBDBD] bg-white text-[13px] font-bold text-[#222] transition hover:border-black active:scale-[0.98]'>
          <img src='https://www.google.com/favicon.ico' className='h-4 w-4' alt='Google' />
          {isRegister ? 'Đăng ký bằng Google' : 'Đăng nhập bằng Google'}
        </button>
        <button type='button' className='flex h-[50px] w-full items-center justify-center gap-3 border border-[#BDBDBD] bg-white text-[13px] font-bold text-[#222] transition hover:border-black active:scale-[0.98]'>
          <LockKeyhole className='h-4 w-4' />
          {isRegister ? 'Đăng ký bằng Passkey' : 'Đăng nhập bằng Passkey'}
        </button>
      </div>

      <p className='mt-8 text-center text-[12px] font-bold text-[#444]'>
        {isRegister ? 'Bạn đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
        <Link to={isRegister ? ROUTE.PUBLIC.LOGIN : ROUTE.PUBLIC.REGISTER} className='border-b border-black font-black text-[#111]'>
          {isRegister ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
        </Link>
      </p>
    </motion.form>
  )
}

function RoleSelector({ onSelect }: { onSelect: (role: AuthRole) => void }) {
  return (
    <main className='mx-auto flex min-h-[calc(100vh-70px)] w-full max-w-[1280px] items-center justify-center bg-white px-5 pb-12'>
      <section className='flex min-h-[760px] w-full flex-col items-center rounded-[24px] border border-gray-200/50 bg-[#FAFAFA] pt-24 shadow-sm'>
        <h1 className='mb-[80px] text-[32px] font-black uppercase tracking-[-0.02em] text-[#111]'>Bạn là...</h1>
        <div className='w-full max-w-[392px] space-y-4 px-4'>
          {roleOptions.map((option) => {
            const Icon = option.icon
            return (
              <button
                key={option.id}
                type='button'
                onClick={() => onSelect(option.id)}
                className='grid h-[58px] w-full grid-cols-[54px_1fr_54px] items-center border border-[#BDBDBD] bg-white text-left text-[13px] font-black uppercase tracking-[0.04em] text-[#222] transition hover:border-black hover:shadow-sm active:scale-[0.98]'
              >
                <span className='flex justify-center'>
                  <Icon className='h-5 w-5 text-[#555]' />
                </span>
                <span>{option.label}</span>
                <span className='flex justify-center text-[#777]'>
                  <Volume2 className='h-4 w-4' />
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default function FigmaAuthShell({ mode }: FigmaAuthShellProps) {
  const [role, setRole] = useState<AuthRole | null>(mode === 'login' ? 'disability' : null)

  return (
    <div className={cn('min-h-screen bg-white font-sans text-[#111]', mode === 'login' && 'overflow-x-hidden')}>
      <AuthHeader />
      {mode === 'register' && role === null ? (
        <RoleSelector onSelect={setRole} />
      ) : (
        <CheckerboardStage>
          <AuthCard mode={mode} role={role || 'disability'} />
        </CheckerboardStage>
      )}
    </div>
  )
}
