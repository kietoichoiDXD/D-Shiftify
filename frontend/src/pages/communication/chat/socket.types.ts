/**
 * Socket event types for chat messaging
 */

export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  JOIN_CONVERSATION: 'join_conversation',
  JOIN_CONVERSATION_SUCCESS: 'join_conversation_success',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  ERROR: 'error'
} as const

export interface SocketMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
  isMine: boolean
}

export interface SendMessagePayload {
  conversationId: string
  content: string
  timestamp?: string
}

export interface ReceiveMessagePayload {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export interface SocketError {
  code: string
  message: string
}
