import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().min(1, { message: 'Vui lòng nhập email.' }).email({ message: 'Email không đúng định dạng.' }),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu.' })
})

export const LoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number(),
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    role: z.string().min(1),
    fullName: z.string().nullable()
  })
})

export const ApiErrorSchema = z.object({
  status: z.number(),
  code: z.string(),
  message: z.string()
})
