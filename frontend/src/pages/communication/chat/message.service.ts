import axiosClient from '@/core/services/axios-client'

import { type GetConversationMessagesParams } from './types'

export const CHAT_MESSAGE_LIMIT = 30
export const USE_MOCK_CHAT_MESSAGES = import.meta.env.VITE_USE_MOCK_CHAT === 'true'

const API_CHAT_BASE_URL = '/api/v1/chat'

export const getChatConversations = () => {
  return axiosClient.get<unknown, unknown>(`${API_CHAT_BASE_URL}/conversations`)
}

export const getConversationMessages = (
  conversationId: string,
  { cursor, limit = CHAT_MESSAGE_LIMIT }: GetConversationMessagesParams = {}
) => {
  return axiosClient.get<unknown, unknown>(`${API_CHAT_BASE_URL}/conversations/${conversationId}/messages`, {
    params: {
      ...(cursor ? { cursor } : {}),
      limit
    }
  })
}
