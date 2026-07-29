import { useMutation } from '@tanstack/react-query'
import { type AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'
import { type z } from 'zod'

import { ROUTE } from '@/core/constants/path'
import { handleError } from '@/core/helpers/error-handler'
import { MUTATION_KEYS } from '@/core/helpers/key-tanstack'
import toastifyCommon from '@/core/lib/toastify-common'
import { authApi } from '@/core/services/auth.service'
import { type ForgotPasswordSchema } from '@/core/zod/forgot-password.zod'
import { LoginResponseSchema, type LoginSchema } from '@/core/zod/login.zod'
import { type RegisterSchema } from '@/core/zod/register.zod'
import { type VerifyAccountEmailSchema } from '@/core/zod/verify-account-email.zod'

const RESEND_COUNTDOWN = 60

export const useLoginAuth = () => {
  return useMutation({
    mutationKey: [MUTATION_KEYS.login],
    mutationFn: async (data: z.infer<typeof LoginSchema>) => {
      const response = await authApi.login(data)
      return LoginResponseSchema.parse(response)
    }
  })
}

export const useRegisterAuth = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationKey: [MUTATION_KEYS.register],
    mutationFn: ({ confirmPassword: _confirmPassword, ...data }: z.infer<typeof RegisterSchema>) => {
      if (!data.role || !data.full_name) {
        return Promise.reject(new Error('Role và họ tên là bắt buộc'))
      }
      return authApi.register({ ...data, role: data.role, full_name: data.full_name })
    },
    onSuccess: () => {
      navigate(ROUTE.PUBLIC.LOGIN)
      toastifyCommon.success('Đăng ký thành công, vui lòng đăng nhập!')
    },
    onError: (error: AxiosError) => {
      handleError(error, 'Đăng ký thất bại')
    }
  })
}

export const useVerifyAccountEmail = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationKey: [MUTATION_KEYS.verifyEmail],
    mutationFn: (data: z.infer<typeof VerifyAccountEmailSchema>) => authApi.verifyEmail(data),
    onSuccess: () => {
      toastifyCommon.success('Xác thực email thành công')
      navigate(ROUTE.PUBLIC.LOGIN)
    },
    onError: (error: AxiosError) => handleError(error, 'Xác thực email thất bại')
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationKey: [MUTATION_KEYS.forgotPassword],
    mutationFn: (data: z.infer<typeof ForgotPasswordSchema>) => authApi.forgotPassword(data),
    onError: (error: AxiosError) => handleError(error, 'Gửi yêu cầu khôi phục mật khẩu thất bại')
  })
}

export const useResendVerificationCode = ({
  setCountdown,
  setCanResend
}: {
  setCountdown: (countdown: number) => void
  setCanResend: (canResend: boolean) => void
}) => {
  return useMutation({
    mutationKey: [MUTATION_KEYS.resendCode],
    mutationFn: (email: string) => authApi.resendVerificationCode(email),
    onSuccess: () => {
      toastifyCommon.success('Đã gửi lại mã xác thực')
      setCountdown(RESEND_COUNTDOWN)
      setCanResend(false)
    },
    onError: (error: AxiosError) => handleError(error, 'Gửi lại mã xác thực thất bại')
  })
}
