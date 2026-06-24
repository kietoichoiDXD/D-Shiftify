import { useCallback, useEffect, useRef } from 'react'

import { useSocketContext } from '@/contexts/useSocketContext'

import { SOCKET_EVENTS, type ReceiveMessagePayload, type SendMessagePayload, type SocketMessage } from './socket.types'

interface UseSocketMessagesOptions {
  conversationId: string
  currentUserId: string
  onMessageReceived: (message: SocketMessage) => void
  onError?: (error: Error) => void
}

/**
 * Custom hook to handle socket-based message sending and receiving
 * Manages event listeners and cleanup to prevent memory leaks
 */
export const useSocketMessages = ({
  conversationId,
  currentUserId,
  onMessageReceived,
  onError
}: UseSocketMessagesOptions) => {
  const { socket, isConnected, isConnecting } = useSocketContext()
  const eventListenersRef = useRef<Array<{ event: string; handler: (...args: unknown[]) => void }>>([])

  /**
   * Handles incoming messages from the socket server
   */
  const handleReceiveMessage = useCallback(
    (payload: ReceiveMessagePayload) => {
      console.log('%c🟣 [Socket] Message received: ' + payload.content, 'color: #a855f7; font-weight: bold')
      // Only process messages for the current conversation
      if (payload.conversationId !== conversationId) {
        return
      }

      const message: SocketMessage = {
        id: payload.id,
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        content: payload.content,
        createdAt: payload.createdAt,
        isMine: payload.senderId === currentUserId
      }

      onMessageReceived(message)
    },
    [conversationId, currentUserId, onMessageReceived]
  )

  /**
   * Handles socket connection errors
   */
  const handleSocketError = useCallback(
    (error: unknown) => {
      if (onError) {
        onError(error instanceof Error ? error : new Error((error as { message?: string })?.message || 'Socket error'))
      }
    },
    [onError]
  )

  const receiveMessageListener = useCallback(
    (...args: unknown[]) => {
      handleReceiveMessage(args[0] as ReceiveMessagePayload)
    },
    [handleReceiveMessage]
  )

  const socketErrorListener = useCallback(
    (...args: unknown[]) => {
      handleSocketError(args[0])
    },
    [handleSocketError]
  )

  /**
   * Set up socket event listeners
   */
  useEffect(() => {
    if (!socket || !isConnected || !conversationId) {
      return
    }

    // Register event listeners
    socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, { conversationId })
    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, receiveMessageListener)
    socket.on(SOCKET_EVENTS.ERROR, socketErrorListener)

    // Track listeners for cleanup
    eventListenersRef.current = [
      { event: SOCKET_EVENTS.RECEIVE_MESSAGE, handler: receiveMessageListener },
      { event: SOCKET_EVENTS.ERROR, handler: socketErrorListener }
    ]

    // Cleanup function to remove event listeners
    return () => {
      if (!socket) {
        return
      }

      eventListenersRef.current.forEach(({ event, handler }) => {
        socket.off(event, handler as any)
      })

      eventListenersRef.current = []
    }
  }, [socket, isConnected, conversationId, receiveMessageListener, socketErrorListener])

  /**
   * Send message through socket
   */
  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !isConnected || !conversationId) {
        if (onError) {
          onError(new Error('Socket is not connected'))
        }
        return false
      }

      if (!content.trim()) {
        return false
      }

      const payload: SendMessagePayload = {
        conversationId,
        content: content.trim(),
        timestamp: new Date().toISOString()
      }

      try {
        console.log('%c🔵 [Socket] Message sent: ' + content, 'color: #3b82f6; font-weight: bold')
        socket.emit(SOCKET_EVENTS.SEND_MESSAGE, payload, (acknowledgment?: unknown) => {
          if (import.meta.env.DEV) {
            console.log('Message sent successfully:', acknowledgment)
          }
        })
        return true
      } catch (error) {
        if (onError) {
          onError(error instanceof Error ? error : new Error('Failed to send message'))
        }
        return false
      }
    },
    [socket, isConnected, conversationId, onError]
  )

  return {
    sendMessage,
    isConnected,
    isConnecting
  }
}
