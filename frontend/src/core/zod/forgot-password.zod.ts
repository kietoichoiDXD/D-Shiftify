import { z } from 'zod'

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Vui lòng nhập email.' })
    .email({ message: 'Email không đúng định dạng.' })
})
