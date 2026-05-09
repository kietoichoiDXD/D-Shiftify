import { useCallback, useRef, useState } from 'react'
import { aiApi, type ChatResponse } from '@/core/services/ai.service'

type State = {
  isRecording: boolean
  isLoading: boolean
  response: ChatResponse | null
  error: string | null
}

/**
 * Records mic audio → encodes to base64 → sends to POST /ai/voice
 * Returns TTS audio_base64 which can be played directly via <audio src="data:audio/mp3;base64,...">
 */
export const useVoiceChat = (sessionId: string) => {
  const [state, setState] = useState<State>({
    isRecording: false,
    isLoading: false,
    response: null,
    error: null,
  })

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      chunksRef.current = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setState((s) => ({ ...s, isRecording: false, isLoading: true }))

        try {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve((reader.result as string).split(',')[1])
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })

          const result = await aiApi.voice(sessionId, base64)
          setState({ isRecording: false, isLoading: false, response: result, error: null })
        } catch (err) {
          setState((s) => ({ ...s, isLoading: false, error: (err as Error).message }))
        }
      }

      recorder.start()
      mediaRef.current = recorder
      setState((s) => ({ ...s, isRecording: true, error: null }))
    } catch (err) {
      setState((s) => ({ ...s, error: (err as Error).message }))
    }
  }, [sessionId])

  const stopRecording = useCallback(() => {
    mediaRef.current?.stop()
  }, [])

  /** Play the TTS audio returned from the server */
  const playResponse = useCallback((response: ChatResponse) => {
    if (!response.audio_base64) return
    const audio = new Audio(`data:audio/mp3;base64,${response.audio_base64}`)
    audio.play()
  }, [])

  return { ...state, startRecording, stopRecording, playResponse }
}
