import { z } from 'zod'

import { numberConstants } from '@/core/configs/consts'

import { validator } from '../helpers/validator'

export const RegisterSchema = z
  .object({
    name: z.string().min(numberConstants.TWO, {
      message: 'Họ và tên phải có ít nhất 2 ký tự.'
    }).optional(),
    full_name: z.string().min(numberConstants.TWO, {
      message: 'Họ và tên phải có ít nhất 2 ký tự.'
    }).optional(),
    email: z.string().email({
      message: 'Email không hợp lệ.'
    }),
    phone: z.string().min(numberConstants.TEN, {
      message: 'Số điện thoại phải có ít nhất 10 ký tự.'
    }),
    password: z
      .string()
      .min(numberConstants.ONE, {
        message: 'Vui lòng nhập mật khẩu.'
      })
      .regex(validator.passwordRegex, {
        message: 'Mật khẩu phải có ít nhất 5 ký tự, một chữ in hoa và một số.'
      }),
    confirmPassword: z.string().min(numberConstants.ONE, {
      message: 'Vui lòng nhập lại mật khẩu.'
    }),
    role: z.enum(['candidate', 'educator', 'business'], {
      required_error: 'Vui lòng chọn vai trò.'
    }).optional()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp.',
    path: ['confirmPassword']
  })
