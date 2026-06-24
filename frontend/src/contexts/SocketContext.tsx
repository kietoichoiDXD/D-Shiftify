import { type ReactNode } from 'react'

import config from '@/core/configs/env'
import { getAccessTokenFromLS } from '@/core/shared/storage'
import { useAuthStore } from '@/core/store/features/auth/authStore'
import { useSocket } from '@/hooks/socket/useSocket'

import { SocketContext } from './socket-context'

interface SocketProviderProps {
  children: ReactNode
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const storeToken = useAuthStore((state) => state.access_token)
  const storeUser = useAuthStore((state) => state.user)
  const token = storeToken || getAccessTokenFromLS()
  const userId = storeUser?.id || ''

  const socketState = useSocket({
    token,
    userId,
    enabled: Boolean(token) && !config.useMockChat
  })

  return <SocketContext.Provider value={socketState}>{children}</SocketContext.Provider>
}
