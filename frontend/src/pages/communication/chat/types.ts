export type SenderRole = 'candidate' | 'recruiter' | 'admin' | 'training_facility'

export type ConversationRole = SenderRole

export type MockConversation = {
  id: string
  contactName: string
  title: string
  participantRole: ConversationRole
  messages: ChatMessage[]
}

export type ChatMessage = {
  id: string
  conversationId?: string
  senderId?: string
  createdAt?: string
  voiceUrl?: string | null
  isMine?: boolean
  sender: SenderRole
  text: string
  timestamp: string
  hasAudio?: boolean
}

export type NormalizedMessage = {
  id: string
  conversationId: string
  content: string
  voiceUrl: string | null
  senderId: string
  createdAt: string
  isMine: boolean
}

export type RawConversationMessage = {
  message_id?: string | null
  id?: string | null
  conversation_id?: string | null
  conversationId?: string | null
  content?: string | null
  voice_url?: string | null
  voiceUrl?: string | null
  sender_id?: string | null
  senderId?: string | null
  created_at?: string | null
  createdAt?: string | null
  [key: string]: unknown
}

export type ChatParticipant = {
  userId?: string | null
  id?: string | null
  role?: string | null
  fullName?: string | null
  companyName?: string | null
  name?: string | null
}

export type RawConversation = {
  id?: string | null
  conversationId?: string | null
  fullName?: string | null
  companyName?: string | null
  lastMessage?: string | null
  latestMessage?: string | null
  updatedAt?: string | null
  updated_at?: string | null
  createdAt?: string | null
  created_at?: string | null
  participants?: ChatParticipant[] | null
  [key: string]: unknown
}

export type NormalizedConversation = {
  id: string
  name: string
  participantRole: ConversationRole
  lastMessage: string
  timestamp: string
  updatedAt: string
  fullName: string
  companyName: string
  participantId: string
}

export type GetConversationMessagesParams = {
  cursor?: string | null
  limit?: number
}

export type NormalizedMessagesResponse = {
  nextCursor: string | null
  data: NormalizedMessage[]
}

export type AudioDirection = 'previous' | 'next'

export type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

export type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export type SpeechRecognitionResultEvent = {
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: {
        transcript: string
      }
    }
  }
}
