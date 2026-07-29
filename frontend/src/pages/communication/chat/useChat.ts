import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSocketContext } from '@/contexts/useSocketContext'
import { getCurrentUser } from '@/core/shared/auth'
import { useAuthStore } from '@/core/store/features/auth/authStore'

import { type ConversationItem } from './components/ChatSidebar'
import { type Message } from './components/MessageListNew'
import {
  dedupeMessagesById,
  formatChatTime,
  normalizeConversationsResponse,
  normalizeMessage,
  normalizeMessagesResponse,
  sortMessagesByCreatedAt
} from './message.adapter'
import { getChatConversations, getConversationMessages } from './message.service'
import { SOCKET_EVENTS, type ReceiveMessagePayload, type SendMessagePayload } from './socket.types'
import { type NormalizedConversation, type RawConversationMessage } from './types'

const toConversationItem = (conversation: NormalizedConversation): ConversationItem => ({
  id: conversation.id,
  name: conversation.name,
  lastMessage: conversation.lastMessage,
  timestamp: conversation.timestamp,
  isOnline: false
})

const toUiMessage = (message: ReturnType<typeof normalizeMessage>): Message => ({
  id: message.id,
  content: message.content,
  sender: message.isMine ? 'user' : 'other',
  timestamp: formatChatTime(message.createdAt),
  status: message.isMine ? 'sent' : undefined
})

export const useChat = () => {
  const storeUser = useAuthStore((state) => state.user)
  const currentUser = getCurrentUser()
  const currentUserId = storeUser?.id || currentUser?.id || ''
  const currentUserRole = storeUser?.role || currentUser?.role || ''
  const { socket, isConnected, isConnecting } = useSocketContext()

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [readyToJoinConversationId, setReadyToJoinConversationId] = useState<string | null>(null)

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations]
  )

  const updateConversationPreview = useCallback((conversationId: string, content: string, createdAt?: string) => {
    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: content,
              timestamp: formatChatTime(createdAt || new Date().toISOString())
            }
          : conversation
      )
    )
  }, [])

  useEffect(() => {
    let isRequestActive = true

    const loadConversations = async () => {
      setIsLoadingConversations(true)
      setError(null)

      try {
        const response = await getChatConversations()
        const normalizedConversations = normalizeConversationsResponse(response, currentUserId, currentUserRole)

        if (!isRequestActive) {
          return
        }

        setConversations(normalizedConversations.map(toConversationItem))
      } catch (conversationError) {
        if (import.meta.env.DEV) {
          console.warn('Unable to load chat conversations', conversationError)
        }

        if (isRequestActive) {
          setError('Không thể tải danh sách hội thoại.')
          setConversations([])
        }
      } finally {
        if (isRequestActive) {
          setIsLoadingConversations(false)
        }
      }
    }

    void loadConversations()

    return () => {
      isRequestActive = false
    }
  }, [currentUserId, currentUserRole])

  const selectConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId)
      setMessages([])
      setReadyToJoinConversationId(null)
      setIsLoadingMessages(true)
      setError(null)

      try {
        const response = await getConversationMessages(conversationId)
        const normalizedResponse = normalizeMessagesResponse(response, currentUserId, conversationId)
        const nextMessages = sortMessagesByCreatedAt(
          dedupeMessagesById(normalizedResponse.data.map((message) => toUiMessage(message)))
        )

        setMessages(nextMessages)
        setReadyToJoinConversationId(conversationId)

        const latestMessage = nextMessages[nextMessages.length - 1]
        if (latestMessage) {
          updateConversationPreview(conversationId, latestMessage.content)
        }
      } catch (messagesError) {
        if (import.meta.env.DEV) {
          console.warn('Unable to load conversation messages', messagesError)
        }

        setMessages([])
        setError('Không thể tải lịch sử tin nhắn.')
      } finally {
        setIsLoadingMessages(false)
      }
    },
    [currentUserId, updateConversationPreview]
  )

  useEffect(() => {
    if (!socket || !isConnected || !readyToJoinConversationId) {
      return
    }

    const payload = {
      conversationId: readyToJoinConversationId
    }
    socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, payload)
  }, [isConnected, readyToJoinConversationId, socket])

  useEffect(() => {
    if (!socket || !isConnected) {
      return
    }

    const handleReceiveMessage = (payload: unknown) => {
      const receivePayload = payload as ReceiveMessagePayload
      const normalizedMessage = normalizeMessage(
        receivePayload as RawConversationMessage,
        currentUserId,
        receivePayload.conversationId
      )
      const uiMessage = toUiMessage(normalizedMessage)

      setMessages((currentMessages) => {
        if (normalizedMessage.conversationId !== activeConversationId) {
          return currentMessages
        }

        return sortMessagesByCreatedAt(dedupeMessagesById([...currentMessages, uiMessage]))
      })
      updateConversationPreview(normalizedMessage.conversationId, normalizedMessage.content, normalizedMessage.createdAt)
    }

    const handleSocketError = (socketError: unknown) => {
      const message =
        socketError && typeof socketError === 'object' && 'message' in socketError
          ? String((socketError as { message?: unknown }).message)
          : 'Socket.IO error'

      setError(message)
    }

    socket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)
    socket.on(SOCKET_EVENTS.ERROR, handleSocketError)

    return () => {
      socket.off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage)
      socket.off(SOCKET_EVENTS.ERROR, handleSocketError)
    }
  }, [activeConversationId, currentUserId, isConnected, socket, updateConversationPreview])

  const sendMessage = useCallback(
    (content: string) => {
      const cleanContent = content.trim()

      if (!socket || !isConnected || !activeConversationId || !cleanContent) {
        setError('Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối Socket.IO.')
        return
      }

      const payload: SendMessagePayload = {
        conversationId: activeConversationId,
        content: cleanContent
      }

      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, payload)
    },
    [activeConversationId, isConnected, socket]
  )

  return {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    isConnected,
    isConnecting,
    isLoadingConversations,
    isLoadingMessages,
    error,
    selectConversation,
    sendMessage,
    clearError: () => setError(null)
  }
}
