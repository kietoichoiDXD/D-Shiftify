import { type ReactNode } from 'react'

import { motion } from 'framer-motion'
import { BriefcaseBusiness, GraduationCap, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTE } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'

import { type RegisterRole } from '../types'

interface RoleOption {
  value: RegisterRole
  title: string
  description: string
  icon: ReactNode
}

const roleOptions: RoleOption[] = [
  {
    value: 'candidate',
    title: 'Ứng viên',
    description: 'Tìm việc làm, tạo hồ sơ và ứng tuyển vào vị trí phù hợp.',
    icon: <UserRound className='h-7 w-7' />
  },

  {
    value: 'business',
    title: 'Doanh nghiệp',
    description: 'Đăng tuyển, tìm kiếm ứng viên và quản lý nhu cầu nhân sự.',
    icon: <BriefcaseBusiness className='h-7 w-7' />
  },
  {
    value: 'educator',
    title: 'Nhà đào tạo',
    description: 'Kết nối học viên, quản lý chương trình đào tạo và định hướng nghề nghiệp.',
    icon: <GraduationCap className='h-7 w-7' />
  }
]

interface RoleSelectionCardProps {
  selectedRole: RegisterRole | null
  onSelectRole: (role: RegisterRole) => void
  onContinue: () => void
}

export const RoleSelectionCard = ({ selectedRole, onSelectRole, onContinue }: RoleSelectionCardProps) => (
  <motion.div
    className='w-full rounded-[28px] bg-white px-6 py-8 shadow-[0_18px_48px_rgba(0,64,128,0.14)] ring-1 ring-slate-200/80 sm:max-w-[520px] sm:px-8'
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
  >
    <div className='mb-6 text-center'>
      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary/70'>Bước 1</p>
      <h2 className='mt-2 text-2xl font-bold text-brand-primary'>Bạn là...</h2>
    </div>

    <div className='space-y-3'>
      {roleOptions.map((option) => {
        const isSelected = selectedRole === option.value

        return (
          <button
            key={option.value}
            type='button'
            onClick={() => onSelectRole(option.value)}
            className={cn(
              'flex w-full items-center gap-4 rounded-xl border bg-white p-4 text-left transition hover:border-brand-primary hover:bg-[#F4FAFF]',
              isSelected ? 'border-brand-primary bg-[#F4FAFF] shadow-sm' : 'border-slate-200'
            )}
            aria-pressed={isSelected}
          >
            <span
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                isSelected ? 'bg-brand-primary text-white' : 'bg-slate-100 text-brand-primary'
              )}
            >
              {option.icon}
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-sm font-bold text-brand-primary'>{option.title}</span>
              <span className='mt-1 block text-xs leading-5 text-slate-600'>{option.description}</span>
            </span>
          </button>
        )
      })}
    </div>

    <Button
      type='button'
      disabled={!selectedRole}
      onClick={onContinue}
      className='mt-6 h-12 w-full rounded-[22px] bg-gradient-to-r from-[#004C91] to-[#2B313A] text-xs font-bold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(0,64,128,0.25)] hover:from-brand-primary hover:to-[#1F2933]'
    >
      Tiếp tục
    </Button>

    <p className='pt-5 text-center text-xs text-slate-600'>
      Bạn đã có tài khoản?{' '}
      <Link to={ROUTE.PUBLIC.LOGIN} className='font-semibold text-brand-primary underline-offset-2 hover:underline'>
        Đăng nhập ngay
      </Link>
    </p>
  </motion.div>
)
