import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { getCurrentUser } from '@/core/shared/auth'
import { useAuthStore } from '@/core/store/features/auth/authStore'

import AudioControlBar from './components/AudioControlBar'
import ChatHeader from './components/ChatHeader'
import MessageInput from './components/MessageInput'
import MessageList from './components/MessageList'
import {
  dedupeMessagesById,
  normalizeMessagesResponse,
  sortMessagesByCreatedAt,
  toChatMessage
} from './message.adapter'
import { getConversationMessages, USE_MOCK_CHAT_MESSAGES } from './message.service'
import { getRoleLabel } from './role-labels'
import { canUseSpeechSynthesis, getSpeechRecognition } from './speech'
import { type AudioDirection, type ChatMessage, type MockConversation, type SpeechRecognitionInstance } from './types'

interface ChatContainerProps {
  conversation: MockConversation
  onBackToList: () => void
}

export default function ChatContainer({ conversation, onBackToList }: ChatContainerProps) {
  const storeUser = useAuthStore((state) => state.user)
  const currentUserId = storeUser?.id || getCurrentUser()?.id || ''
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messageListRef = useRef<HTMLElement | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const shouldScrollToLatestRef = useRef(false)
  const restoreScrollRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null)

  const mergeMessages = useCallback(
    (currentMessages: ChatMessage[], incomingMessages: ChatMessage[]) =>
      sortMessagesByCreatedAt(dedupeMessagesById([...currentMessages, ...incomingMessages])),
    []
  )

  const getFallbackMessages = useCallback(
    () => sortMessagesByCreatedAt(dedupeMessagesById(conversation.messages)),
    [conversation.messages]
  )

  const activeMessage = useMemo(
    () => messages.find((message) => message.id === activeMessageId) || null,
    [activeMessageId, messages]
  )

  useEffect(() => {
    let isRequestActive = true

    const loadMessages = async () => {
      setMessages([])
      setNextCursor(null)
      setError(null)
      setActiveMessageId(null)

      if (!conversation.id) {
        return
      }

      setIsLoading(true)
      shouldScrollToLatestRef.current = true

      try {
        const response = await getConversationMessages(conversation.id)
        const normalizedResponse = normalizeMessagesResponse(response, currentUserId, conversation.id)
        const chatMessages = normalizedResponse.data.map((message) => toChatMessage(message, conversation.participantRole))

        if (!isRequestActive) {
          return
        }

        setMessages(sortMessagesByCreatedAt(dedupeMessagesById(chatMessages)))
        setNextCursor(normalizedResponse.nextCursor)
      } catch (apiError) {
        if (import.meta.env.DEV) {
          console.warn('Unable to load conversation messages', apiError)
        }

        if (!isRequestActive) {
          return
        }

        setError('Unable to load messages')
        setMessages(USE_MOCK_CHAT_MESSAGES ? getFallbackMessages() : [])
      } finally {
        if (isRequestActive) {
          setIsLoading(false)
        }
      }
    }

    void loadMessages()

    return () => {
      isRequestActive = false
    }
  }, [conversation.id, conversation.participantRole, currentUserId, getFallbackMessages])

  useLayoutEffect(() => {
    const messageList = messageListRef.current

    if (!messageList) {
      return
    }

    if (restoreScrollRef.current) {
      const { scrollHeight, scrollTop } = restoreScrollRef.current
      messageList.scrollTop = messageList.scrollHeight - scrollHeight + scrollTop
      restoreScrollRef.current = null
      return
    }

    if (shouldScrollToLatestRef.current && !isLoading) {
      messageList.scrollTop = messageList.scrollHeight
      shouldScrollToLatestRef.current = false
    }
  }, [isLoading, messages.length])

  const loadOlderMessages = async () => {
    if (!conversation.id || !nextCursor || isLoadingMore) {
      return
    }

    const messageList = messageListRef.current
    restoreScrollRef.current = messageList
      ? { scrollHeight: messageList.scrollHeight, scrollTop: messageList.scrollTop }
      : null

    setIsLoadingMore(true)
    setError(null)

    try {
      const response = await getConversationMessages(conversation.id, { cursor: nextCursor })
      const normalizedResponse = normalizeMessagesResponse(response, currentUserId, conversation.id)
      const olderMessages = normalizedResponse.data.map((message) => toChatMessage(message, conversation.participantRole))

      setMessages((currentMessages) => mergeMessages(currentMessages, olderMessages))
      setNextCursor(normalizedResponse.nextCursor)
    } catch (apiError) {
      if (import.meta.env.DEV) {
        console.warn('Unable to load older conversation messages', apiError)
      }

      restoreScrollRef.current = null
      setError('Unable to load older messages')
    } finally {
      setIsLoadingMore(false)
    }
  }

  const readText = (text: string, messageId?: string) => {
    const cleanText = text.trim()

    if (!cleanText || !canUseSpeechSynthesis()) {
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onstart = () => {
      setIsPlaying(true)
      if (messageId) {
        setActiveMessageId(messageId)
      }
    }

    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  const handleReadMessage = (message: ChatMessage) => {
    readText(message.text, message.id)
  }

  const togglePlayback = () => {
    if (!activeMessage || !canUseSpeechSynthesis()) {
      return
    }

    if (isPlaying) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
      return
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsPlaying(true)
      return
    }

    readText(activeMessage.text, activeMessage.id)
  }

  const repeatActiveMessage = () => {
    if (activeMessage) {
      readText(activeMessage.text, activeMessage.id)
    }
  }

  const readAdjacentMessage = (direction: AudioDirection) => {
    if (!activeMessageId) {
      return
    }

    const currentIndex = messages.findIndex((message) => message.id === activeMessageId)
    const nextIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1
    const nextMessage = messages[nextIndex]

    if (nextMessage) {
      readText(nextMessage.text, nextMessage.id)
    }
  }

  const handleSpeechInput = () => {
    const Recognition = getSpeechRecognition()

    if (!Recognition) {
      readText('Speech input is not available in this browser.')
      return
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length })
        .map((_, index) => event.results[index][0].transcript)
        .join(' ')
        .trim()

      if (transcript) {
        setDraft((currentDraft) => (currentDraft ? `${currentDraft} ${transcript}` : transcript))
      }
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }

  const sendMessage = () => {
    const cleanDraft = draft.trim()

    if (!cleanDraft) {
      return
    }

    const sentMessage: ChatMessage = {
      id: `message-${Date.now()}`,
      conversationId: conversation.id,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      voiceUrl: null,
      isMine: true,
      sender: 'candidate',
      text: cleanDraft,
      timestamp: new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date()),
      hasAudio: true
    }

    setMessages((currentMessages) => [...currentMessages, sentMessage])
    setDraft('')
  }

  const participantLabel = getRoleLabel(conversation.participantRole)

  return (
    <main className='min-h-screen w-full bg-white text-black'>
      <section className='mx-auto flex min-h-screen w-full max-w-md flex-col bg-white'>
        <ChatHeader
          title={conversation.title}
          participantLabel={participantLabel}
          onBack={onBackToList}
          onReadTitle={() => readText(`D-SHIFTIFY chat. ${conversation.title}. ${participantLabel}.`)}
        />

        <MessageList
          messages={messages}
          hasAudioControls={Boolean(activeMessage)}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={Boolean(nextCursor)}
          error={error}
          listRef={messageListRef}
          onLoadOlder={loadOlderMessages}
          onReadMessage={handleReadMessage}
        />

        {activeMessage && (
          <AudioControlBar
            isPlaying={isPlaying}
            onPrevious={() => readAdjacentMessage('previous')}
            onTogglePlayback={togglePlayback}
            onNext={() => readAdjacentMessage('next')}
            onRepeat={repeatActiveMessage}
          />
        )}

        <MessageInput
          value={draft}
          isListening={isListening}
          onChange={setDraft}
          onSubmit={sendMessage}
          onStartSpeechInput={handleSpeechInput}
          onReadDraft={() => readText(draft)}
        />
      </section>
    </main>
  )
}
