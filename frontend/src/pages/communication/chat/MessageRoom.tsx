import { useCallback, useEffect, useMemo, useState } from 'react'

import { getCurrentUser } from '@/core/shared/auth'
import { useAuthStore } from '@/core/store/features/auth/authStore'

import AudioControlBar from './components/AudioControlBar'
import ChatHeader from './components/ChatHeader'
import MessageInput from './components/MessageInput'
import MessageList from './components/MessageList'
import { type SocketMessage } from './socket.types'
import { type ChatMessage } from './types'
import { useAutoScroll } from './useAutoScroll'
import { useSocketMessages } from './useSocketMessages'

interface MessageRoomProps {
  conversationId: string
  conversationTitle: string
  participantRole: string
  onBackToList: () => void
  initialMessages: ChatMessage[]
  isLoading?: boolean
}

/**
 * MessageRoom Component - Handles real-time message display and sending via Socket.IO
 *
 * Features:
 * - Real-time message receiving via socket
 * - Message sending with socket emission
 * - Auto-scroll to newest message
 * - Accessibility support (aria-labels, semantic HTML)
 * - Error handling and connection state management
 */
export default function MessageRoom({
  conversationId,
  conversationTitle,
  participantRole,
  onBackToList,
  initialMessages,
  isLoading = false
}: MessageRoomProps) {
  const storeUser = useAuthStore((state) => state.user)
  const currentUserId = storeUser?.id || getCurrentUser()?.id || ''

  // Message state
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [socketError, setSocketError] = useState<string | null>(null)

  // Speech recognition state
  const [isListening, setIsListening] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)

  // Auto-scroll ref
  const messagesEndRef = useAutoScroll(messages.length)

  /**
   * Handle incoming messages from socket
   */
  const handleMessageReceived = useCallback(
    (socketMessage: SocketMessage) => {
      // Convert socket message to ChatMessage format
      const chatMessage: ChatMessage = {
        id: socketMessage.id,
        conversationId: socketMessage.conversationId,
        senderId: socketMessage.senderId,
        text: socketMessage.content,
        timestamp: socketMessage.createdAt,
        createdAt: socketMessage.createdAt,
        isMine: socketMessage.isMine,
        sender: (participantRole as any) || 'candidate'
      }

      // Append message to state
      setMessages((prevMessages) => {
        // Prevent duplicate messages
        if (prevMessages.some((m) => m.id === chatMessage.id)) {
          return prevMessages
        }
        return [...prevMessages, chatMessage]
      })

      setSocketError(null)
    },
    [participantRole]
  )

  /**
   * Handle socket errors
   */
  const handleSocketError = useCallback((err: Error) => {
    setSocketError(err.message)
    if (import.meta.env.DEV) {
      console.error('Socket error:', err)
    }
  }, [])

  // Initialize socket message handler
  const { sendMessage, isConnected } = useSocketMessages({
    conversationId,
    currentUserId,
    onMessageReceived: handleMessageReceived,
    onError: handleSocketError
  })

  /**
   * Handle sending a message
   */
  const handleSendMessage = useCallback(() => {
    if (!draft.trim()) {
      return
    }

    const success = sendMessage(draft)

    if (success) {
      setDraft('')
      setError(null)
    } else {
      setError('Failed to send message. Please try again.')
    }
  }, [draft, sendMessage])

  /**
   * Update initial messages when they change
   */
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  /**
   * Read draft text aloud
   */
  const handleReadDraft = useCallback(() => {
    if (!draft.trim()) {
      return
    }

    if (!window.speechSynthesis) {
      setError('Speech synthesis is not supported in this browser.')
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(draft)
    window.speechSynthesis.speak(utterance)
  }, [draft])

  /**
   * Read message aloud
   */
  const handleReadMessage = useCallback((message: ChatMessage) => {
    if (!message.text.trim()) {
      return
    }

    if (!window.speechSynthesis) {
      setError('Speech synthesis is not supported in this browser.')
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message.text)
    utterance.lang = 'vi-VN'
    utterance.onend = () => {
      setIsPlaying(false)
      setActiveMessageId(null)
    }
    utterance.onerror = () => {
      setIsPlaying(false)
      setActiveMessageId(null)
    }
    setActiveMessageId(message.id)
    setIsPlaying(true)
    window.speechSynthesis.speak(utterance)
  }, [])

  /**
   * Handle speech input (simplified)
   */
  const handleStartSpeechInput = useCallback(() => {
    setIsListening(!isListening)
    // Implement speech-to-text logic here if needed
  }, [isListening])

  const hasAudioControls = isPlaying || isListening

  const activeMessage = useMemo(
    () => messages.find((m) => m.id === activeMessageId) || null,
    [activeMessageId, messages]
  )

  const handleTogglePlayback = useCallback(() => {
    if (!activeMessage) return
    if (isPlaying) {
      window.speechSynthesis?.pause()
      setIsPlaying(false)
    } else {
      if (window.speechSynthesis?.paused) {
        window.speechSynthesis.resume()
        setIsPlaying(true)
      } else {
        handleReadMessage(activeMessage)
      }
    }
  }, [activeMessage, isPlaying, handleReadMessage])

  const handleNextMessage = useCallback(() => {
    if (messages.length === 0) return
    const currentIndex = messages.findIndex((m) => m.id === activeMessageId)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % messages.length
    const nextMsg = messages[nextIndex]
    handleReadMessage(nextMsg)
  }, [messages, activeMessageId, handleReadMessage])

  const handlePreviousMessage = useCallback(() => {
    if (messages.length === 0) return
    const currentIndex = messages.findIndex((m) => m.id === activeMessageId)
    const prevIndex = currentIndex === -1 ? messages.length - 1 : (currentIndex - 1 + messages.length) % messages.length
    const prevMsg = messages[prevIndex]
    handleReadMessage(prevMsg)
  }, [messages, activeMessageId, handleReadMessage])

  const handleRepeatMessage = useCallback(() => {
    if (!activeMessage) return
    handleReadMessage(activeMessage)
  }, [activeMessage, handleReadMessage])

  return (
    <div className='flex flex-col h-screen bg-white dark:bg-gray-900'>
      {/* Chat Header */}
      <ChatHeader
        title={conversationTitle}
        participantLabel={participantRole === 'recruiter' ? 'Nhà tuyển dụng' : participantRole === 'training_facility' ? 'Cơ sở đào tạo' : 'Ứng viên'}
        onBack={onBackToList}
        onReadTitle={useCallback(() => {
          if (!window.speechSynthesis) return
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(conversationTitle)
          utterance.lang = 'vi-VN'
          window.speechSynthesis.speak(utterance)
        }, [conversationTitle])}
      />

      {/* Error Messages */}
      {(error || socketError) && (
        <div
          role='alert'
          className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'
          aria-live='polite'
        >
          {error || socketError}
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div
          role='status'
          className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'
          aria-live='polite'
        >
          Connecting to chat server...
        </div>
      )}

      {/* Message List */}
      <MessageList
        messages={messages}
        hasAudioControls={hasAudioControls}
        isLoading={isLoading}
        isLoadingMore={false}
        hasMore={false}
        error={null}
        listRef={{ current: null }}
        onLoadOlder={() => {}}
        onReadMessage={handleReadMessage}
      />

      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} aria-hidden='true' />

      {/* Audio Control Bar */}
      {hasAudioControls && (
        <AudioControlBar
          isPlaying={isPlaying}
          onTogglePlayback={handleTogglePlayback}
          onNext={handleNextMessage}
          onPrevious={handlePreviousMessage}
          onRepeat={handleRepeatMessage}
        />
      )}

      {/* Message Input */}
      <MessageInput
        value={draft}
        isListening={isListening}
        onChange={setDraft}
        onSubmit={handleSendMessage}
        onStartSpeechInput={handleStartSpeechInput}
        onReadDraft={handleReadDraft}
      />
    </div>
  )
}
