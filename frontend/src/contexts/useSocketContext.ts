import { useContext } from 'react'

import { SocketContext } from './socket-context'

export const useSocketContext = () => {
  const context = useContext(SocketContext)

  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }

  return context
}
