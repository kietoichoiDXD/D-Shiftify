import axiosClient from '@/core/services/axios-client'

import { type GetConversationMessagesParams } from './types'

export const CHAT_MESSAGE_LIMIT = 30
export const USE_MOCK_CHAT_MESSAGES = import.meta.env.VITE_USE_MOCK_CHAT === 'true'

const API_CHAT_BASE_URL = '/api/v1/chat'

export const getChatConversations = () => {
  console.log('%c🔍 [API/GET] /conversations: Initiating request...', 'color: #3b82f6; font-weight: bold')
  return axiosClient
    .get<unknown, unknown>(`${API_CHAT_BASE_URL}/conversations`)
    .then((response) => {
      const arr = Array.isArray(response)
        ? response
        : response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)
          ? (response as any).data
          : []
      console.log(
        `%c🟢 [API/GET] /conversations: Success! Received ${arr.length} conversations.`,
        'color: #10b981; font-weight: bold',
        response
      )
      return response
    })
    .catch((error) => {
      console.error(
        `%c🔴 [API/GET] /conversations: Failed! Error: ${error.message || error}`,
        'color: #ef4444; font-weight: bold',
        error
      )
      throw error
    })
}

export const getConversationMessages = (
  conversationId: string,
  { cursor, limit = CHAT_MESSAGE_LIMIT }: GetConversationMessagesParams = {}
) => {
  console.log(
    `%c🔍 [API/GET] /conversations/${conversationId}/messages: Initiating request...`,
    'color: #3b82f6; font-weight: bold',
    { cursor, limit }
  )
  return axiosClient
    .get<unknown, unknown>(`${API_CHAT_BASE_URL}/conversations/${conversationId}/messages`, {
      params: {
        ...(cursor ? { cursor } : {}),
        limit
      }
    })
    .then((response) => {
      const arr = Array.isArray(response)
        ? response
        : response && typeof response === 'object' && 'data' in response && Array.isArray((response as any).data)
          ? (response as any).data
          : response &&
              typeof response === 'object' &&
              'data' in response &&
              (response as any).data &&
              typeof (response as any).data === 'object' &&
              'data' in (response as any).data &&
              Array.isArray((response as any).data.data)
            ? (response as any).data.data
            : []
      console.log(
        `%c🟢 [API/GET] /conversations/${conversationId}/messages: Success! Received ${arr.length} messages.`,
        'color: #10b981; font-weight: bold',
        response
      )
      return response
    })
    .catch((error) => {
      console.error(
        `%c🔴 [API/GET] /conversations/${conversationId}/messages: Failed! Error: ${error.message || error}`,
        'color: #ef4444; font-weight: bold',
        error
      )
      throw error
    })
}
