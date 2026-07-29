import { useCallback, useEffect, useMemo, useState } from 'react'

import { getAccessTokenFromLS } from '@/core/shared/storage'
import { useAuthStore } from '@/core/store/features/auth/authStore'

import ChatSidebar, { type ConversationItem } from './components/ChatSidebar'
import ChatWindow from './components/ChatWindow'
import { type Message } from './components/MessageListNew'
import { formatChatTime, normalizeMessagesResponse, normalizeConversationsResponse } from './message.adapter'
import { getConversationMessages, getChatConversations } from './message.service'
import { type SocketMessage } from './socket.types'
import { useAutoScroll } from './useAutoScroll'
import { useSocketMessages } from './useSocketMessages'
import './chat.css'

export type UserRole = 'candidate' | 'business' | 'educator'

interface SharedChatLayoutProps {
  sidebarTitle: string
  contactList: ConversationItem[]
  activeContactId: string | null
  currentUserRole: UserRole
  currentUserId: string
  onSelectContact: (id: string) => void
  onSearch?: (query: string) => void
  onSendMessage?: (contactId: string, text: string) => void
  onCall?: (contactId: string) => void
  onVideoCall?: (contactId: string) => void
  initialMessages?: Message[]
  isLoading?: boolean
  pageTitle?: string
}

const EMPTY_MESSAGES: Message[] = []

export default function SharedChatLayout({
  sidebarTitle,
  contactList,
  activeContactId,
  currentUserRole,
  currentUserId,
  onSelectContact,
  onSearch,
  onSendMessage,
  onCall,
  onVideoCall,
  initialMessages = EMPTY_MESSAGES,
  isLoading = false,
  pageTitle
}: SharedChatLayoutProps) {
  // State
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [socketError, setSocketError] = useState<string | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const storeToken = useAuthStore((state) => state.accessToken)
  const token = storeToken || getAccessTokenFromLS()
  const isSocketEnabled = Boolean(token)

  // Auto-scroll
  useAutoScroll(messages.length)

  // Get active contact
  const activeContact = useMemo(() => contactList.find((c) => c.id === activeContactId), [contactList, activeContactId])

  // Map contact ID to live conversation ID from API
  useEffect(() => {
    const mapContactToConversation = async () => {
      if (!activeContactId) {
        setActiveConversationId(null)
        return
      }

      try {
        const response = await getChatConversations()
        const normalized = normalizeConversationsResponse(response, currentUserId, currentUserRole)

        // 1. Check if the activeContactId matches a conversation.id
        const directMatch = normalized.find((c) => c.id === activeContactId)
        if (directMatch) {
          setActiveConversationId(activeContactId)
          return
        }

        // 2. Check if the activeContactId matches the participantId
        const participantMatch = normalized.find((c) => c.participantId === activeContactId)
        if (participantMatch) {
          setActiveConversationId(participantMatch.id)
          return
        }

        // Fallback
        setActiveConversationId(activeContactId)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Failed to map contact to conversation ID', error)
        }
        setActiveConversationId(activeContactId)
      }
    }

    void mapContactToConversation()
  }, [activeContactId, currentUserId, currentUserRole])

  /**
   * Handle incoming messages from socket
   */
  const handleMessageReceived = useCallback(
    (socketMessage: SocketMessage) => {
      if (socketMessage.conversationId !== activeConversationId) {
        return
      }

      const message: Message = {
        id: socketMessage.id,
        content: socketMessage.content,
        sender: socketMessage.isMine ? 'user' : 'other',
        timestamp: new Date(socketMessage.createdAt).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) {
          return prev
        }

        // Deduplicate: replace optimistic local message having matching content
        if (socketMessage.isMine) {
          const localIndex = prev.findIndex(
            (m) =>
              m.sender === 'user' &&
              m.content === message.content &&
              (m.id.startsWith('msg-local-') || m.status === 'sent')
          )
          if (localIndex !== -1) {
            const updated = [...prev]
            updated[localIndex] = message
            return updated
          }
        }

        return [...prev, message]
      })
    },
    [activeConversationId]
  )

  // Socket integration
  const {
    sendMessage: socketSendMessage,
    isConnected,
    isConnecting
  } = useSocketMessages({
    conversationId: activeConversationId || '',
    currentUserId,
    onMessageReceived: handleMessageReceived,
    onError: (error) => setSocketError(error.message)
  })

  // Load messages from the API when active conversation changes
  useEffect(() => {
    let isRequestActive = true

    const loadMessages = async () => {
      if (!activeConversationId) {
        setMessages([])
        return
      }

      try {
        const response = await getConversationMessages(activeConversationId)
        const normalized = normalizeMessagesResponse(response, currentUserId, activeConversationId)

        if (!isRequestActive) {
          return
        }

        const apiMessages: Message[] = normalized.data.map((msg) => ({
          id: msg.id,
          content: msg.content,
          sender: msg.isMine ? 'user' : 'other',
          timestamp: formatChatTime(msg.createdAt),
          status: msg.isMine ? 'sent' : undefined
        }))

        setMessages(apiMessages)
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Unable to load conversation messages from API', error)
        }
        if (isRequestActive) {
          setMessages([])
          setSocketError('Không thể tải lịch sử tin nhắn.')
        }
      }
    }

    void loadMessages()

    return () => {
      isRequestActive = false
    }
  }, [activeConversationId, currentUserId])

  /**
   * Handle sending a message
   */
  const handleSendMessage = useCallback(
    (text: string) => {
      if (!activeConversationId) {
        setSocketError('Invalid conversation')
        return
      }

      if (!isConnected) {
        setSocketError('Cannot connect to chat server')
        return
      }

      const tempId = `msg-local-${Date.now()}`
      const userMsg: Message = {
        id: tempId,
        content: text,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: 'sending'
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === tempId)) return prev
        return [...prev, userMsg]
      })

      const success = socketSendMessage(text)

      if (success) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'sent' } : m)))
        onSendMessage?.(activeConversationId, text)
        setSocketError(null)
      } else {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, status: 'error' } : m)))
        setSocketError('Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối mạng.')
      }
    },
    [activeConversationId, isConnected, socketSendMessage, onSendMessage]
  )

  /**
   * Handle retrying a failed message
   */
  const handleRetryMessage = useCallback(
    (message: Message) => {
      if (!activeConversationId) {
        setSocketError('Invalid conversation')
        return
      }

      if (!isConnected) {
        setSocketError('Cannot connect to chat server')
        return
      }

      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status: 'sending' } : m)))

      const success = socketSendMessage(message.content)

      if (success) {
        setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status: 'sent' } : m)))
        setSocketError(null)
      } else {
        setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status: 'error' } : m)))
        setSocketError('Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối mạng.')
      }
    },
    [activeConversationId, isConnected, socketSendMessage]
  )

  /**
   * Handle reading message aloud
   */
  const handleReadMessage = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'vi-VN'
    window.speechSynthesis.speak(utterance)
  }, [])

  /**
   * Handle search
   */
  const handleSearch = useCallback(
    (query: string) => {
      onSearch?.(query)
    },
    [onSearch]
  )

  /**
   * Handle contact selection
   */
  const handleSelectContact = useCallback(
    (id: string) => {
      onSelectContact(id)
      setSocketError(null)
    },
    [onSelectContact]
  )

  /**
   * Handle call
   */
  const handleCall = useCallback(() => {
    if (activeContactId) {
      onCall?.(activeContactId)
    }
  }, [activeContactId, onCall])

  /**
   * Handle video call
   */
  const handleVideoCall = useCallback(() => {
    if (activeContactId) {
      onVideoCall?.(activeContactId)
    }
  }, [activeContactId, onVideoCall])

  return (
    <div className='h-full flex flex-col bg-white overflow-hidden'>
      {/* Page Header (Optional) */}
      {pageTitle && (
        <div className='px-6 py-4 border-b border-gray-100'>
          <h1 className='text-xl font-semibold text-gray-900 tracking-tight'>{pageTitle}</h1>
        </div>
      )}

      {/* Main Content: 2-Column Layout */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Left Sidebar */}
        <ChatSidebar
          title={sidebarTitle}
          conversations={contactList}
          activeConversationId={activeContactId}
          onSelectConversation={handleSelectContact}
          onSearchChange={handleSearch}
        />

        {/* Right Chat Column */}
        <div className='flex-1 flex flex-col relative h-full overflow-hidden bg-gray-50/30'>
          {/* Connection Warning Banner */}
          {isSocketEnabled && !isConnecting && !isConnected && (
            <div
              role='alert'
              aria-live='assertive'
              className='bg-amber-50/90 backdrop-blur-sm border-b border-amber-100 text-amber-800
                px-5 py-2.5 text-xs flex items-center gap-3 shrink-0 z-10 chat-animate-fadeInUp'
            >
              <div className='w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0'>
                <span className='text-amber-700 text-xs font-bold'>!</span>
              </div>
              <span className='flex-1'>
                <strong className='font-semibold'>Đang kết nối lại...</strong>
                <span className='text-amber-700 ml-1'>
                  Bạn vẫn có thể nhắn tin, hệ thống sẽ tự đồng bộ khi kết nối lại.
                </span>
                {socketError ? <span className='ml-1 text-amber-600 italic'>({socketError})</span> : null}
              </span>
              <button
                onClick={() => setSocketError(null)}
                className='text-amber-500 hover:text-amber-700 p-1 rounded transition-colors
                  focus:outline-none focus:ring-2 focus:ring-amber-300'
                aria-label='Đóng thông báo'
              >
                ✕
              </button>
            </div>
          )}

          {/* Right Chat Window Container */}
          {activeContact ? (
            <ChatWindow
              conversationId={activeContact.id}
              conversationTitle={activeContact.name}
              messages={messages}
              isOnline={activeContact.isOnline}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onCall={handleCall}
              onVideoCall={handleVideoCall}
              onReadMessage={handleReadMessage}
              onRetryMessage={handleRetryMessage}
            />
          ) : (
            <div className='w-full h-full bg-white/50 flex items-center justify-center chat-bg-pattern'>
              <div className='text-center chat-animate-fadeInUp'>
                {/* Chat illustration */}
                <div className='w-20 h-20 mx-auto mb-5 rounded-2xl bg-brand-primary/5 flex items-center justify-center'>
                  <svg
                    className='w-10 h-10 text-brand-primary/40'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.2}
                      d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    />
                  </svg>
                </div>
                <h3 className='text-base font-semibold text-gray-500 mb-1'>Chào mừng bạn!</h3>
                <p className='text-sm text-gray-400'>Chọn một cuộc hội thoại để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


