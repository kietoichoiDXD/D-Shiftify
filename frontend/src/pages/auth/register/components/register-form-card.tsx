import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { type UseFormReturn } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputPassword } from '@/components/ui/input-password'
import { Label } from '@/components/ui/label'
import { ROUTE } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'

import { AuthDivider } from '../../components/auth-divider'
import { GoogleLoginButton } from '../../login/components/google-login-button'
import { type RegisterFormValues, type RegisterRole } from '../types'

interface RegisterFormCardProps {
  form: UseFormReturn<RegisterFormValues>
  formError: string | null
  isPending: boolean
  selectedRole: RegisterRole | null
  onBackToRole: () => void
  onSubmit: (values: RegisterFormValues) => void
}

const roleLabels: Record<RegisterRole, string> = {
  candidate: 'Ứng viên',
  educator: 'Nhà đào tạo',
  business: 'Doanh nghiệp'
}

export const RegisterFormCard = ({
  form,
  formError,
  isPending,
  selectedRole,
  onBackToRole,
  onSubmit
}: RegisterFormCardProps) => (
  <motion.div
    className='w-full rounded-[28px] bg-white px-6 py-8 shadow-[0_18px_48px_rgba(0,64,128,0.14)] ring-1 ring-slate-200/80 sm:max-w-[420px] sm:px-8'
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
  >
    <button
      type='button'
      onClick={onBackToRole}
      className='mb-5 inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:underline'
    >
      <ArrowLeft className='h-4 w-4' />
      Quay lại
    </button>

    <div className='mb-6 text-center'>
      <p className='text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary/70'>
        {selectedRole ? roleLabels[selectedRole] : 'Tài khoản'}
      </p>
      <h2 className='mt-2 text-2xl font-bold text-brand-primary'>Đăng ký tài khoản</h2>
    </div>

    <Form {...form}>
      <form className='space-y-4' noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='full_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>Họ và tên</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  autoComplete='name'
                  placeholder='Họ và tên'
                  className='h-12 rounded-[2px] border-[#8A8A8A] bg-white text-xs focus-visible:ring-brand-primary'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>Số điện thoại</FormLabel>
              <FormControl>
                <Input
                  type='tel'
                  autoComplete='tel'
                  placeholder='Số điện thoại'
                  className='h-12 rounded-[2px] border-[#8A8A8A] bg-white text-xs focus-visible:ring-brand-primary'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  autoComplete='email'
                  placeholder='Địa chỉ Email'
                  className='h-12 rounded-[2px] border-[#8A8A8A] bg-white text-xs focus-visible:ring-brand-primary'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>Mật khẩu</FormLabel>
              <FormControl>
                <InputPassword
                  autoComplete='new-password'
                  placeholder='Mật khẩu'
                  className='h-12 rounded-[2px] border-[#8A8A8A] bg-white text-xs focus-visible:ring-brand-primary'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>Nhập lại mật khẩu</FormLabel>
              <FormControl>
                <InputPassword
                  autoComplete='new-password'
                  placeholder='Nhập lại mật khẩu'
                  className='h-12 rounded-[2px] border-[#8A8A8A] bg-white text-xs focus-visible:ring-brand-primary'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='role'
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex items-center space-x-2 pt-1'>
          <Checkbox
            id='terms'
            className='mt-0.5 h-4 w-4 rounded-[3px] border-[#8A8A8A] data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary'
          />
          <Label htmlFor='terms' className='text-xs leading-tight text-slate-600 cursor-pointer select-none'>
            Tôi đồng ý với các{' '}
            <span className='font-semibold text-brand-primary hover:underline'>Điều khoản dịch vụ</span> và{' '}
            <span className='font-semibold text-brand-primary hover:underline'>Chính sách bảo mật</span>
          </Label>
        </div>

        {formError ? (
          <p
            id='register-form-error'
            className='rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700'
            role='alert'
            aria-live='assertive'
          >
            {formError}
          </p>
        ) : null}

        <Button
          type='submit'
          loading={isPending}
          disabled={isPending}
          aria-describedby={formError ? 'register-form-error' : undefined}
          className={cn(
            'h-12 w-full rounded-[22px] bg-gradient-to-r from-[#004C91] to-[#2B313A] text-xs font-bold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(0,64,128,0.25)] hover:from-brand-primary hover:to-[#1F2933]',
            isPending && 'min-w-full'
          )}
        >
          Đăng ký
        </Button>

        <AuthDivider />

        <GoogleLoginButton label='Đăng ký bằng Google' />

        <p className='pt-3 text-center text-xs text-slate-600'>
          Bạn đã có tài khoản?{' '}
          <Link to={ROUTE.PUBLIC.LOGIN} className='font-semibold text-brand-primary underline-offset-2 hover:underline'>
            Đăng nhập ngay
          </Link>
        </p>
      </form>
    </Form>
  </motion.div>
)
