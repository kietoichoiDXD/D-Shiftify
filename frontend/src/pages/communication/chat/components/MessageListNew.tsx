import { useEffect, useRef } from 'react'

import { AlertCircle, Check, CheckCheck, RefreshCw, Volume2 } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export interface Message {
  id: string
  content: string
  sender: 'user' | 'other'
  timestamp: string
  avatar?: string
  status?: 'sending' | 'sent' | 'error'
}

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  onReadMessage?: (message: Message) => void
  onRetryMessage?: (message: Message) => void
  contactName?: string
}

export default function MessageListNew({
  messages,
  isLoading = false,
  onReadMessage,
  onRetryMessage,
  contactName
}: MessageListProps) {
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  const contactInitial = contactName ? contactName.charAt(0).toUpperCase() : 'A'

  return (
    <section
      className='flex-1 overflow-y-auto bg-gray-50/50 chat-bg-pattern px-6 py-5 space-y-3 chat-scrollbar'
      aria-label='Chat message list'
      aria-live='polite'
      aria-busy={isLoading}
    >
      {/* Loading Skeleton — shimmer effect */}
      {isLoading && (
        <div className='flex flex-col space-y-4 w-full' aria-busy='true'>
          <span className='sr-only'>Đang tải lịch sử trò chuyện...</span>
          {[1, 2, 3, 4].map((skeleton) => (
            <div
              key={skeleton}
              className={`flex ${skeleton % 2 === 0 ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex ${skeleton % 2 === 0 ? 'flex-row-reverse' : 'flex-row'} gap-2.5 max-w-[55%]`}
              >
                {skeleton % 2 !== 0 && (
                  <div className='w-8 h-8 rounded-full chat-animate-shimmer flex-shrink-0' />
                )}
                <div
                  className={`h-12 rounded-2xl chat-animate-shimmer ${
                    skeleton % 3 === 0 ? 'w-56' : skeleton % 3 === 1 ? 'w-40' : 'w-48'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && messages.length === 0 && (
        <div className='flex flex-col items-center justify-center h-full py-20'>
          <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
            <svg
              className='w-8 h-8 text-gray-300'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
              />
            </svg>
          </div>
          <p className='text-sm font-medium text-gray-400'>Chưa có tin nhắn nào</p>
          <p className='text-xs text-gray-300 mt-1'>Hãy bắt đầu cuộc trò chuyện!</p>
        </div>
      )}

      {/* Messages */}
      {!isLoading &&
        messages.map((message, index) => {
          const isUser = message.sender === 'user'
          const isError = message.status === 'error'
          const isSending = message.status === 'sending'
          const isSent = message.status === 'sent' || (!message.status && isUser)

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'} chat-animate-fadeInUp`}
              style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
            >
              <div
                className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2.5 max-w-[70%] items-end`}
              >
                {/* Avatar (other only) */}
                {!isUser && (
                  <Avatar className='h-8 w-8 flex-shrink-0'>
                    <AvatarFallback className='bg-gray-200 text-gray-600 text-xs font-semibold'>
                      {contactInitial}
                    </AvatarFallback>
                  </Avatar>
                )}

                {/* Error indicator (user only) */}
                {isUser && isError && (
                  <div className='flex flex-col items-center gap-1 text-red-500 self-end mb-1'>
                    <AlertCircle size={15} />
                    {onRetryMessage && (
                      <button
                        onClick={() => onRetryMessage(message)}
                        className='text-[10px] flex items-center gap-0.5 hover:text-red-700 transition-colors
                          focus:outline-none focus:underline font-medium'
                        aria-label={`Thử lại gửi tin nhắn: ${message.content}`}
                      >
                        <RefreshCw size={10} />
                        Thử lại
                      </button>
                    )}
                  </div>
                )}

                {/* Message Content */}
                <div className={isUser ? 'items-end flex flex-col' : 'items-start flex flex-col'}>
                  {/* Bubble */}
                  <div
                    className={`px-4 py-2.5 text-sm break-words leading-relaxed ${
                      isUser
                        ? isError
                          ? 'bg-red-500 text-white rounded-2xl rounded-br-md opacity-85'
                          : 'bg-brand-primary text-white rounded-2xl rounded-br-md shadow-sm'
                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                    } ${isSending ? 'opacity-60' : ''}`}
                  >
                    <p>{message.content}</p>
                  </div>

                  {/* Timestamp + Status */}
                  <div className='flex items-center gap-1.5 mt-1 px-1'>
                    <span className='text-[10px] text-gray-400'>{message.timestamp}</span>

                    {/* Read receipts for user messages */}
                    {isUser && isSent && !isError && (
                      <CheckCheck size={13} className='text-blue-400' aria-label='Đã gửi' />
                    )}
                    {isUser && isSending && (
                      <Check size={13} className='text-gray-300' aria-label='Đang gửi' />
                    )}

                    {/* Read aloud button (other messages) */}
                    {!isUser && onReadMessage && (
                      <button
                        onClick={() => onReadMessage(message)}
                        aria-label={`Đọc tin nhắn: ${message.content}`}
                        className='p-0.5 hover:bg-gray-100 rounded transition-colors
                          focus:outline-none focus:ring-2 focus:ring-brand-primary/20'
                      >
                        <Volume2 size={12} className='text-gray-400 hover:text-gray-600' />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

      {/* Auto-scroll anchor */}
      <div ref={endOfMessagesRef} aria-hidden='true' />
    </section>
  )
}
