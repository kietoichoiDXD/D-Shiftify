import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { type z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ROUTE } from '@/core/constants/path'
import { ForgotPasswordSchema } from '@/core/zod'
import { useForgotPassword } from '@/hooks/tanstack-query/auth/use-query-auth'

import { AuthFooter } from './components/auth-footer'
import { AuthHeader } from './components/auth-header'
import { DecorativeWave } from './components/decorative-wave'

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [countdown, setCountdown] = useState(0)
  const forgotPasswordMutation = useForgotPassword()
  const isPending = forgotPasswordMutation.isPending

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: () => {
        setIsSuccess(true)
        setSubmittedEmail(values.email)
        setCountdown(60)
      }
    })
  }

  const handleResend = () => {
    if (countdown > 0 || isPending) return
    forgotPasswordMutation.mutate(
      { email: submittedEmail },
      {
        onSuccess: () => {
          setCountdown(60)
        }
      }
    )
  }

  return (
    <main className='relative min-h-screen overflow-x-hidden bg-[#F4FAFF] font-sans text-brand-primary flex flex-col justify-between'>
      <DecorativeWave />
      <AuthHeader />

      <section className='relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 pb-8 pt-2 sm:px-8 lg:min-h-[calc(100vh-140px)] lg:px-6 lg:pb-10'>
        <AnimatePresence mode='wait'>
          {!isSuccess ? (
            <motion.div
              key='forgot-password-form'
              className='w-full rounded-[28px] bg-white px-6 py-8 shadow-[0_18px_48px_rgba(0,64,128,0.14)] ring-1 ring-slate-200/80 sm:max-w-[420px] sm:px-8'
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-brand-primary'>Quên mật khẩu</h2>
                <Link
                  to={ROUTE.PUBLIC.LOGIN}
                  className='inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-primary hover:bg-brand-bg-end transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
                  aria-label='Quay lại đăng nhập'
                >
                  <ArrowLeft className='h-4 w-4' />
                </Link>
              </div>

              <p className='mb-6 text-xs leading-5 text-slate-600'>
                Nhập địa chỉ email tài khoản của bạn để nhận liên kết xác thực đặt lại mật khẩu mới từ hệ thống.
              </p>

              <Form {...form}>
                <form className='space-y-5' onSubmit={form.handleSubmit(onSubmit)} noValidate>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-xs font-semibold text-slate-700'>Địa chỉ email</FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Mail className='absolute left-3 top-3.5 h-4 w-4 text-slate-400' />
                            <Input
                              type='email'
                              autoComplete='email'
                              placeholder='Nhập email của bạn (Ví dụ: name@domain.com)'
                              className='h-12 rounded-[2px] border-[#8A8A8A] bg-white  pr-3 text-xs focus-visible:ring-brand-primary transition-all'
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className='text-xs text-red-500 font-medium' />
                      </FormItem>
                    )}
                  />

                  <Button
                    type='submit'
                    disabled={isPending}
                    className='h-12 w-full rounded-[22px] bg-gradient-to-r from-[#004C91] to-[#2B313A] text-xs font-bold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(0,64,128,0.25)] hover:from-brand-primary hover:to-[#1F2933] transition-all duration-300'
                  >
                    {isPending ? (
                      <span className='flex items-center justify-center gap-2'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        Đang xử lý...
                      </span>
                    ) : (
                      'Gửi yêu cầu'
                    )}
                  </Button>
                </form>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key='forgot-password-success'
              className='w-full rounded-[28px] bg-white px-6 py-8 shadow-[0_18px_48px_rgba(0,64,128,0.14)] ring-1 ring-slate-200/80 sm:max-w-[420px] sm:px-8 text-center'
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500'
              >
                <CheckCircle2 className='h-10 w-10' />
              </motion.div>

              <h2 className='mb-3 text-xl font-bold text-brand-primary'>Kiểm tra hộp thư của bạn</h2>
              <p className='mb-6 text-xs leading-5 text-slate-600'>
                Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến địa chỉ email: <br />
                <span className='font-semibold text-slate-900 break-all'>{submittedEmail}</span>
              </p>

              <div className='space-y-4'>
                <Button
                  onClick={() => navigate(ROUTE.PUBLIC.LOGIN)}
                  className='h-12 w-full rounded-[22px] bg-gradient-to-r from-[#004C91] to-[#2B313A] text-xs font-bold uppercase tracking-wide text-white shadow-[0_10px_20px_rgba(0,64,128,0.25)] hover:from-brand-primary hover:to-[#1F2933] transition-all duration-300'
                >
                  Quay lại đăng nhập
                </Button>

                <div className='text-xs text-slate-500'>
                  Không nhận được email?{' '}
                  {countdown > 0 ? (
                    <span className='font-semibold text-brand-primary'>Gửi lại sau {countdown}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={isPending}
                      className='font-semibold text-brand-primary hover:underline hover:text-brand-primary-hover focus:outline-none focus:underline'
                    >
                      Gửi lại ngay
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <AuthFooter />
    </main>
  )
}
