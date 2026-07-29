import { useState, useCallback } from 'react'

import { aiApi, type ChatResponse } from '@/core/services/ai.service'

type State = {
  isLoading: boolean
  response: ChatResponse | null
  error: string | null
}

export const useAiChat = (sessionId: string) => {
  const [state, setState] = useState<State>({ isLoading: false, response: null, error: null })

  const send = useCallback(async (message: string) => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const result = await aiApi.chat(sessionId, message)
      setState({ isLoading: false, response: result, error: null })
      return result
    } catch (err) {
      setState({ isLoading: false, response: null, error: (err as Error).message })
      return null
    }
  }, [sessionId])

  return { ...state, send }
}
