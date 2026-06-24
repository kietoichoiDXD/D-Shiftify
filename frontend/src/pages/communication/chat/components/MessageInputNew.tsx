import { type FormEvent, useRef, useState, useEffect, useCallback } from 'react'

import { Mic, Paperclip, Send, Volume2 } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import EmojiPickerButton from './EmojiPickerButton'

interface MessageInputProps {
  onSendMessage: (text: string) => void
  onReadDraft?: (text: string) => void
  isLoading?: boolean
  isListening?: boolean
  onStartListening?: () => void
}

export default function MessageInputNew({
  onSendMessage,
  onReadDraft,
  isLoading = false,
  isListening = false,
  onStartListening
}: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [sendAnimation, setSendAnimation] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasContent = message.trim().length > 0

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [message])

  const handleSubmit = useCallback(
    (e?: FormEvent<HTMLFormElement>) => {
      e?.preventDefault()
      if (!message.trim()) return

      setSendAnimation(true)
      setTimeout(() => setSendAnimation(false), 200)

      onSendMessage(message)
      setMessage('')

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    },
    [message, onSendMessage]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleReadDraft = () => {
    if (message.trim() && onReadDraft) {
      onReadDraft(message)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    textareaRef.current?.focus()
  }

  return (
    <TooltipProvider delayDuration={300}>
      <form
        onSubmit={handleSubmit}
        aria-label='Send message'
        className='bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2'
      >
        {/* Left action buttons */}
        <div className='flex items-center gap-0.5 pb-0.5'>
          {/* Emoji Picker */}
          <EmojiPickerButton onEmojiSelect={handleEmojiSelect} disabled={isLoading} />

          {/* Attachment (UI placeholder) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                aria-label='Đính kèm tệp'
                disabled={isLoading}
                className='p-2 text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/20'
              >
                <Paperclip size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Đính kèm tệp</TooltipContent>
          </Tooltip>

          {/* Read draft */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                onClick={handleReadDraft}
                aria-label='Đọc bản nháp'
                disabled={!hasContent}
                className='p-2 text-gray-500 hover:text-violet-500 hover:bg-violet-50 rounded-lg
                  transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/20'
              >
                <Volume2 size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Đọc tin nhắn nháp</TooltipContent>
          </Tooltip>
        </div>

        {/* Textarea */}
        <div className='flex-1'>
          <label htmlFor='chat-message-input' className='sr-only'>
            Nhập tin nhắn
          </label>
          <textarea
            ref={textareaRef}
            id='chat-message-input'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Nhập tin nhắn...'
            aria-label='Message input'
            disabled={isLoading}
            rows={1}
            className='w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl resize-none
              focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary focus:bg-white
              placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200
              leading-relaxed'
            style={{ maxHeight: '120px' }}
          />
        </div>

        {/* Right action buttons */}
        <div className='flex items-center gap-0.5 pb-0.5'>
          {/* Microphone */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                onClick={onStartListening}
                aria-label={isListening ? 'Dừng ghi âm' : 'Nhập bằng giọng nói'}
                className={`p-2 rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/20
                  ${
                    isListening
                      ? 'bg-red-50 text-red-500 hover:bg-red-100 chat-online-pulse'
                      : 'text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5'
                  }`}
              >
                <Mic size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              {isListening ? 'Dừng ghi âm' : 'Nhập bằng giọng nói'}
            </TooltipContent>
          </Tooltip>

          {/* Send */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='submit'
                disabled={!hasContent || isLoading}
                aria-label='Gửi tin nhắn'
                className={`p-2.5 rounded-xl transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/30
                  ${
                    hasContent
                      ? 'bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                  ${sendAnimation ? 'chat-send-bounce' : ''}`}
              >
                <Send size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Gửi tin nhắn</TooltipContent>
          </Tooltip>
        </div>
      </form>
    </TooltipProvider>
  )
}
