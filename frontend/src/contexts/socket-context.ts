import { createContext } from 'react'

import { type UseSocketReturn } from '@/hooks/socket/useSocket'

export type SocketContextValue = UseSocketReturn

export const SocketContext = createContext<SocketContextValue | undefined>(undefined)
