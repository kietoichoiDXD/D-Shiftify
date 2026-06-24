import {
  type ChatParticipant,
  type ChatMessage,
  type ConversationRole,
  type NormalizedConversation,
  type NormalizedMessage,
  type NormalizedMessagesResponse,
  type RawConversation,
  type RawConversationMessage
} from './types'

const getStringValue = (value: unknown): string => (typeof value === 'string' ? value : '')

const formatMessageTime = (createdAt: string) => {
  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatChatTime = formatMessageTime

const extractArrayPayload = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[]
  }

  if (!response || typeof response !== 'object') {
    return []
  }

  const responseRecord = response as Record<string, unknown>

  if (Array.isArray(responseRecord.data)) {
    return responseRecord.data as T[]
  }

  if (responseRecord.data && typeof responseRecord.data === 'object') {
    const nestedData = (responseRecord.data as Record<string, unknown>).data

    if (Array.isArray(nestedData)) {
      return nestedData as T[]
    }
  }

  return []
}

export const normalizeMessage = (
  rawMessage: RawConversationMessage,
  currentUserId: string,
  fallbackConversationId = ''
): NormalizedMessage => {
  const senderId = getStringValue(rawMessage.sender_id ?? rawMessage.senderId)
  const createdAt = getStringValue(rawMessage.created_at ?? rawMessage.createdAt)
  const content = getStringValue(rawMessage.content)
  const conversationId = getStringValue(rawMessage.conversation_id ?? rawMessage.conversationId) || fallbackConversationId
  const voiceUrl = getStringValue(rawMessage.voice_url ?? rawMessage.voiceUrl) || null

  const providedId = getStringValue(rawMessage.message_id ?? rawMessage.id)
  // Temporary fallback while the backend contract is still settling. Replace this once message_id is guaranteed.
  const fallbackId = [senderId || 'unknown-sender', createdAt || 'unknown-time', content || 'empty-message'].join('-')

  return {
    id: providedId || fallbackId,
    conversationId,
    content,
    voiceUrl,
    senderId,
    createdAt,
    isMine: Boolean(currentUserId && senderId && senderId === currentUserId)
  }
}

const normalizeRawMessages = (response: unknown): RawConversationMessage[] =>
  extractArrayPayload<RawConversationMessage>(response)

const normalizeNextCursor = (response: unknown): string | null => {
  if (!response || typeof response !== 'object') {
    return null
  }

  const responseRecord = response as Record<string, unknown>
  const directCursor = responseRecord.next_cursor ?? responseRecord.nextCursor

  if (typeof directCursor === 'string') {
    return directCursor
  }

  if (responseRecord.data && typeof responseRecord.data === 'object') {
    const nestedCursor = (responseRecord.data as Record<string, unknown>).next_cursor

    if (typeof nestedCursor === 'string') {
      return nestedCursor
    }
  }

  return null
}

export const normalizeMessagesResponse = (
  response: unknown,
  currentUserId: string,
  conversationId: string
): NormalizedMessagesResponse => ({
  nextCursor: normalizeNextCursor(response),
  data: normalizeRawMessages(response).map((message) => normalizeMessage(message, currentUserId, conversationId))
})

const getCurrentUserRole = (role?: string | null): ConversationRole =>
  role?.toLowerCase() === 'recruiter' || role?.toLowerCase() === 'business' ? 'recruiter' : 'candidate'

const getOtherParticipant = (
  participants: ChatParticipant[] | null | undefined,
  currentUserId: string
): ChatParticipant | null => {
  if (!Array.isArray(participants)) {
    return null
  }

  return (
    participants.find((participant) => {
      const participantUserId = getStringValue(participant.userId ?? participant.id)
      return participantUserId && participantUserId !== currentUserId
    }) || null
  )
}

export const normalizeConversationsResponse = (
  response: unknown,
  currentUserId: string,
  currentUserRole?: string | null
): NormalizedConversation[] => {
  const userRole = getCurrentUserRole(currentUserRole)

  return extractArrayPayload<RawConversation>(response)
    .map((conversation) => {
      const otherParticipant = getOtherParticipant(conversation.participants, currentUserId)
      const fullName = getStringValue(otherParticipant?.fullName ?? conversation.fullName)
      const companyName = getStringValue(otherParticipant?.companyName ?? conversation.companyName)
      const participantRole: ConversationRole = userRole === 'candidate' ? 'recruiter' : 'candidate'
      const name =
        userRole === 'candidate'
          ? companyName || fullName || getStringValue(otherParticipant?.name) || 'Nhà tuyển dụng'
          : fullName || companyName || getStringValue(otherParticipant?.name) || 'Ứng viên'
      const updatedAt = getStringValue(conversation.updatedAt ?? conversation.updated_at ?? conversation.createdAt ?? conversation.created_at)

      return {
        id: getStringValue(conversation.id ?? conversation.conversationId),
        name,
        participantRole,
        lastMessage: getStringValue(conversation.lastMessage ?? conversation.latestMessage) || 'Chưa có tin nhắn',
        timestamp: formatMessageTime(updatedAt),
        updatedAt,
        fullName,
        companyName,
        participantId: otherParticipant ? getStringValue(otherParticipant.userId ?? otherParticipant.id) : ''
      }
    })
    .filter((conversation) => Boolean(conversation.id))
}

export const sortMessagesByCreatedAt = <T extends { createdAt?: string; timestamp?: string }>(messages: T[]): T[] =>
  [...messages].sort((firstMessage, secondMessage) => {
    const firstTime = new Date(firstMessage.createdAt || firstMessage.timestamp || '').getTime()
    const secondTime = new Date(secondMessage.createdAt || secondMessage.timestamp || '').getTime()

    return (Number.isNaN(firstTime) ? 0 : firstTime) - (Number.isNaN(secondTime) ? 0 : secondTime)
  })

export const dedupeMessagesById = <T extends { id: string }>(messages: T[]): T[] => {
  const seenMessageIds = new Set<string>()

  return messages.filter((message) => {
    if (seenMessageIds.has(message.id)) {
      return false
    }

    seenMessageIds.add(message.id)
    return true
  })
}

export const toChatMessage = (message: NormalizedMessage, participantRole: ConversationRole): ChatMessage => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  createdAt: message.createdAt,
  voiceUrl: message.voiceUrl,
  isMine: message.isMine,
  sender: message.isMine
    ? participantRole === 'candidate'
      ? 'recruiter'
      : 'candidate'
    : participantRole,
  text: message.content,
  timestamp: formatMessageTime(message.createdAt),
  hasAudio: true
})
