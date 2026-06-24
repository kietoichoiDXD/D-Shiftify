import { useCallback, useEffect, useMemo, useState } from 'react'

import { io, type Socket } from 'socket.io-client'

import config from '@/core/configs/env'

type SocketEventHandler = (...args: unknown[]) => void
type ServerToClientEvents = Record<string, SocketEventHandler>
type ClientToServerEvents = Record<string, SocketEventHandler>

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>

export interface UseSocketOptions {
  token?: string | null
  url?: string
  enabled?: boolean
  path?: string
  transports?: ('websocket' | 'polling')[]
  userId?: string | null
}

export interface UseSocketReturn {
  socket: AppSocket | null
  isConnected: boolean
  isConnecting: boolean
  error: Error | null
  connect: () => void
  disconnect: () => void
}

const DEFAULT_SOCKET_PATH = '/socket.io'
const DEFAULT_TRANSPORTS: ('websocket' | 'polling')[] = ['websocket', 'polling']

export const useSocket = ({
  token,
  url = config.socketUrl,
  enabled = true,
  path = DEFAULT_SOCKET_PATH,
  transports = DEFAULT_TRANSPORTS,
  userId
}: UseSocketOptions = {}): UseSocketReturn => {
  const [socket, setSocket] = useState<AppSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const socketAuth = useMemo(
    () => ({
      ...(token ? { token, authorization: `Bearer ${token}` } : {})
    }),
    [token]
  )

  useEffect(() => {
    if (!enabled || !url) {
      setSocket(null)
      setIsConnected(false)
      setIsConnecting(false)
      return undefined
    }

    setIsConnecting(true)
    setError(null)

    const socketInstance: AppSocket = io(url, {
      autoConnect: false,
      path,
      transports,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: socketAuth,
      query: {
        ...(userId ? { userId } : {})
      }
    })

    const handleConnect = () => {
      console.log('%c🟢 [Socket] Connected successfully (ID: ' + socketInstance.id + ')', 'color: #10b981; font-weight: bold')
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)
    }

    const handleDisconnect = (reason: string) => {
      console.log('%c🔴 [Socket] Disconnected (Reason: ' + reason + ')', 'color: #ef4444; font-weight: bold')
      setIsConnected(false)
      setIsConnecting(false)
    }

    const handleConnectError = (connectError: Error) => {
      console.log('%c🔴 [Socket] Connection Error: ' + connectError.message, 'color: #ef4444; font-weight: bold')
      setIsConnected(false)
      setIsConnecting(false)
      setError(connectError)
    }

    socketInstance.on('connect', handleConnect)
    socketInstance.on('disconnect', handleDisconnect)
    socketInstance.on('connect_error', handleConnectError)

    // Log reconnect attempts
    socketInstance.io.on('reconnect_attempt', (attempt: number) => {
      console.log('%c🟡 [Socket] Reconnecting (Attempt: ' + attempt + ')', 'color: #eab308; font-weight: bold')
      setIsConnecting(true)
    })

    setSocket(socketInstance)
    setIsConnecting(true)
    console.log('%c🟡 [Socket] Initializing connection...', 'color: #eab308; font-weight: bold')
    socketInstance.connect()

    return () => {
      socketInstance.off('connect', handleConnect)
      socketInstance.off('disconnect', handleDisconnect)
      socketInstance.off('connect_error', handleConnectError)
      socketInstance.io.off('reconnect_attempt')
      socketInstance.disconnect()
      setSocket(null)
      setIsConnected(false)
      setIsConnecting(false)
    }
  }, [enabled, path, socketAuth, transports, url, userId])

  const connect = useCallback(() => {
    if (!socket || socket.connected) {
      return
    }

    setIsConnecting(true)
    socket.connect()
  }, [socket])

  const disconnect = useCallback(() => {
    if (!socket) {
      return
    }

    socket.disconnect()
  }, [socket])

  return {
    socket,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  }
}
