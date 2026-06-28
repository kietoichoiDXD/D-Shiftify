import { useCallback, useEffect, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { getSpeechRecognition } from '@/pages/communication/chat/speech'
import { type SpeechRecognitionInstance, type SpeechRecognitionResultEvent } from '@/pages/communication/chat/types'

export type VoiceIntent =
  | { kind: 'navigate'; route: string; label: string }
  | { kind: 'help' }
  | { kind: 'stop' }
  | { kind: 'unknown'; transcript: string }

interface IntentRule {
  keywords: string[]
  build: () => VoiceIntent
}

const RULES: IntentRule[] = [
  { keywords: ['trang chủ', 'về nhà', 'dashboard'], build: () => ({ kind: 'navigate', route: ROUTE.DISABILITY.DASHBOARD, label: 'trang chủ' }) },
  { keywords: ['việc làm', 'tìm việc', 'công việc'], build: () => ({ kind: 'navigate', route: ROUTE.DISABILITY.JOBS, label: 'tìm việc làm' }) },
  { keywords: ['tin nhắn', 'trò chuyện', 'nhắn tin', 'chat'], build: () => ({ kind: 'navigate', route: ROUTE.COMMON_PRIVATE.CHAT, label: 'tin nhắn' }) },
  { keywords: ['thông báo'], build: () => ({ kind: 'navigate', route: ROUTE.DISABILITY.NOTIFICATIONS, label: 'thông báo' }) },
  { keywords: ['hồ sơ', 'trang cá nhân', 'profile'], build: () => ({ kind: 'navigate', route: ROUTE.DISABILITY.PROFILE, label: 'hồ sơ' }) },
  { keywords: ['trợ giúp', 'giúp đỡ', 'hướng dẫn', 'làm gì'], build: () => ({ kind: 'help' }) },
  { keywords: ['dừng', 'tắt', 'im lặng', 'ngừng nghe'], build: () => ({ kind: 'stop' }) }
]

export const parseVoiceIntent = (transcript: string): VoiceIntent => {
  const text = transcript.toLowerCase().normalize('NFC').trim()
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) return rule.build()
  }
  return { kind: 'unknown', transcript }
}

export interface UseAutoSTTOptions {
  enabled: boolean
  onIntent: (intent: VoiceIntent) => void
  onTranscript?: (transcript: string) => void
}

export interface UseAutoSTTReturn {
  supported: boolean
  listening: boolean
  transcript: string
  start: () => void
  stop: () => void
}

export const useAutoSTT = ({ enabled, onIntent, onTranscript }: UseAutoSTTOptions): UseAutoSTTReturn => {
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const wantListeningRef = useRef(false)

  const supported = getSpeechRecognition() !== null

  const onIntentRef = useRef(onIntent)
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    onIntentRef.current = onIntent
    onTranscriptRef.current = onTranscript
  }, [onIntent, onTranscript])

  const stop = useCallback(() => {
    wantListeningRef.current = false
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const start = useCallback(() => {
    const Recognition = getSpeechRecognition()
    if (!Recognition) return
    if (recognitionRef.current) return

    const recognition = new Recognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'vi-VN'

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const last = event.results[event.results.length - 1]
      const said = last?.[0]?.transcript ?? ''
      if (!said) return
      setTranscript(said)
      onTranscriptRef.current?.(said)
      const intent = parseVoiceIntent(said)
      if (intent.kind === 'navigate') navigate(intent.route)
      if (intent.kind === 'stop') stop()
      onIntentRef.current(intent)
    }

    recognition.onerror = () => {

    }

    recognition.onend = () => {
      recognitionRef.current = null
      setListening(false)

      if (wantListeningRef.current) {
        setTimeout(() => start(), 400)
      }
    }

    recognitionRef.current = recognition
    wantListeningRef.current = true
    try {
      recognition.start()
      setListening(true)
    } catch {
      recognitionRef.current = null
    }
  }, [navigate, stop])

  useEffect(() => {
    if (enabled) start()
    else stop()
    return () => stop()
  }, [enabled, start, stop])

  return { supported, listening, transcript, start, stop }
}
