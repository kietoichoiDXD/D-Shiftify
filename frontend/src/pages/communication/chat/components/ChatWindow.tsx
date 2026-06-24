import { useState, useEffect } from 'react'

import ChatHeaderNew from './ChatHeaderNew'
import MessageInputNew from './MessageInputNew'
import MessageListNew, { type Message } from './MessageListNew'
import TypingIndicator from './TypingIndicator'

interface ChatWindowProps {
  conversationId: string
  conversationTitle: string
  messages: Message[]
  isOnline?: boolean
  isLoading?: boolean
  onSendMessage: (text: string) => void
  onCall?: () => void
  onVideoCall?: () => void
  onReadMessage?: (text: string) => void
  onRetryMessage?: (message: Message) => void
}

export default function ChatWindow({
  conversationId,
  conversationTitle,
  messages,
  isOnline = false,
  isLoading = false,
  onSendMessage,
  onCall,
  onVideoCall,
  onReadMessage,
  onRetryMessage
}: ChatWindowProps) {
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // Simulate typing indicator when a new message is sent
  // In production, this would come from socket events
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.sender === 'user') {
        setIsTyping(true)
        const timer = setTimeout(() => setIsTyping(false), 2500)
        return () => clearTimeout(timer)
      }
    }
  }, [messages.length])

  // Reset typing when conversation changes
  useEffect(() => {
    setIsTyping(false)
  }, [conversationId])

  const handleStartListening = () => {
    setIsListening(!isListening)
    // Implement speech-to-text here if needed
  }

  const handleReadDraft = (text: string) => {
    if (!window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'vi-VN'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className='w-full flex-1 bg-white flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='shrink-0'>
        <ChatHeaderNew
          conversationTitle={conversationTitle}
          isOnline={isOnline}
          onCall={onCall}
          onVideoCall={onVideoCall}
        />
      </div>

      {/* Message List */}
      <div className='flex-1 overflow-y-auto'>
        <MessageListNew
          messages={messages}
          isLoading={isLoading}
          onReadMessage={(msg) => onReadMessage?.(msg.content)}
          onRetryMessage={onRetryMessage}
          contactName={conversationTitle}
        />

        {/* Typing Indicator */}
        {isTyping && !isLoading && (
          <TypingIndicator contactName={conversationTitle} />
        )}
      </div>

      {/* Message Input */}
      <div className='shrink-0'>
        <MessageInputNew
          onSendMessage={onSendMessage}
          onReadDraft={handleReadDraft}
          isLoading={isLoading}
          isListening={isListening}
          onStartListening={handleStartListening}
        />
      </div>
    </div>
  )
}
