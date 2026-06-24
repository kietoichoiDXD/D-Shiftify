import { type z } from 'zod'

import { type RegisterSchema } from '@/core/zod'

export type RegisterFormValues = z.infer<typeof RegisterSchema>
export type RegisterRole = RegisterFormValues['role']
