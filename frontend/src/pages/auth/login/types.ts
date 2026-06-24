import { type z } from 'zod'

import { type LoginSchema } from '@/core/zod'

export type LoginFormValues = z.infer<typeof LoginSchema>

export type LoginRouteState = {
  from?: {
    pathname?: string
  }
}
