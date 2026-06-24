import { motion } from 'framer-motion'
import { type UseFormReturn } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputPassword } from '@/components/ui/input-password'
import { ROUTE } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'

import { AuthDivider } from '../../components/auth-divider'
import { type LoginFormValues } from '../types'

import { GoogleLoginButton } from './google-login-button'

interface LoginFormCardProps {
  form: UseFormReturn<LoginFormValues>
  formError: string | null
  isPending: boolean
  onSubmit: (values: LoginFormValues) => void
}

export const LoginFormCard = ({ form, formError, isPending, onSubmit }: LoginFormCardProps) => (
  <motion.div
    className='w-full rounded-[28px] bg-white px-6 py-8 shadow-[0_18px_48px_rgba(0,64,128,0.14)] ring-1 ring-slate-200/80 sm:max-w-[380px] sm:px-8 lg:max-w-md'
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
  >
    <h2 className='mb-7 text-center text-2xl font-bold text-brand-primary'>Đăng nhập</h2>

    <Form {...form}>
      <form className='space-y-4' noValidate onSubmit={form.handleSubmit(onSubmit)}>
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
                  placeholder='Nhập email'
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
                  autoComplete='current-password'
                  placeholder='Nhập mật khẩu'
                  className='h-12 rounded-[2px] border-[#8A8A8A] bg-white text-xs focus-visible:ring-brand-primary'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='text-right'>
          <Link
            to={ROUTE.PUBLIC.FORGOT_PASSWORD}
            className='text-xs font-medium text-brand-primary underline-offset-2 hover:underline'
          >
            Quên mật khẩu?
          </Link>
        </div>

        {formError ? (
          <p
            id='login-form-error'
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
          aria-describedby={formError ? 'login-form-error' : undefined}
          className={cn(
            'h-12 w-full rounded-[22px] bg-gradient-to-r from-[#004C91] to-[#2B313A] text-xs font-bold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(0,64,128,0.25)] hover:from-brand-primary hover:to-[#1F2933]',
            isPending && 'min-w-full'
          )}
        >
          Đăng nhập
        </Button>

        <AuthDivider />

        <GoogleLoginButton />

        <p className='pt-3 text-center text-xs text-slate-600'>
          Bạn chưa có tài khoản?{' '}
          <Link to={ROUTE.PUBLIC.REGISTER} className='font-semibold text-brand-primary underline-offset-2 hover:underline'>
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </Form>
  </motion.div>
)
