import { type RefObject } from 'react'

import { type ChatMessage } from '../types'

import MessageBubble from './MessageBubble'

interface MessageListProps {
  messages: ChatMessage[]
  hasAudioControls: boolean
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: string | null
  listRef: RefObject<HTMLElement | null>
  onLoadOlder: () => void
  onReadMessage: (message: ChatMessage) => void
}

export default function MessageList({
  messages,
  hasAudioControls,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  listRef,
  onLoadOlder,
  onReadMessage
}: MessageListProps) {
  return (
    <section
      ref={listRef}
      aria-label='Chat history'
      aria-live='polite'
      className={`flex-1 space-y-5 overflow-y-auto px-4 pt-36 ${hasAudioControls ? 'pb-64' : 'pb-44'}`}
    >
      {hasMore && (
        <button
          type='button'
          disabled={isLoadingMore}
          onClick={onLoadOlder}
          className='w-full border-2 border-black bg-white px-4 py-3 text-base font-black uppercase text-black focus:outline-none focus-visible:ring-4 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isLoadingMore ? 'Loading older messages...' : 'Load older messages'}
        </button>
      )}

      {isLoading && <p className='text-center text-base font-bold text-black'>Loading messages...</p>}

      {!isLoading && error && <p className='text-center text-base font-bold text-black'>Messages are unavailable.</p>}

      {!isLoading && !messages.length && (
        <p className='text-center text-base font-bold text-black'>No messages yet.</p>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onReadMessage={onReadMessage} />
      ))}
    </section>
  )
}
