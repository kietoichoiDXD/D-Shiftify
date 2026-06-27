import config from '@/core/configs/env'
import axiosClient from '@/core/services/axios-client'

type ApiResponse<T> = {
  status: string
  data: T
}

export type VoiceCommand = {
  intent: string
  query: string | null
  matched: string | null
  raw: string
}

type Transcription = {
  transcript: string
  confidence: number | null
  languageCode: string
  command?: VoiceCommand | null
}

type SpeechAudio = {
  audioBase64: string
  mimeType: string
  languageCode: string
  characterCount: number
}

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Không thể đọc dữ liệu ghi âm'))
    reader.onloadend = () => {
      const result = String(reader.result || '')
      resolve(result.includes(',') ? result.split(',')[1] : result)
    }
    reader.readAsDataURL(blob)
  })

export const speechApi = {
  async transcribe(blob: Blob): Promise<Transcription> {
    const audioBase64 = await blobToBase64(blob)
    const encoding = blob.type.includes('ogg') ? 'OGG_OPUS' : 'WEBM_OPUS'
    const response = (await axiosClient.post('/api/v1/ai/speech/transcribe', {
      audioBase64,
      encoding,
      languageCode: 'vi-VN',
      model: 'latest_long'
    })) as ApiResponse<Transcription>
    return response.data
  },

  async synthesize(text: string): Promise<SpeechAudio> {
    const response = (await axiosClient.post('/api/v1/ai/speech/synthesize', {
      text,
      languageCode: 'vi-VN',
      gender: 'NEUTRAL'
    })) as ApiResponse<SpeechAudio>
    return response.data
  }
}

const browserSpeak = (text: string) => {
  if (!('speechSynthesis' in window)) return false
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'vi-VN'
  window.speechSynthesis.speak(utterance)
  return true
}

export const speakAccessibleText = async (text: string) => {
  const cleanText = text.trim()
  if (!cleanText) return

  if (!config.baseUrl) {
    browserSpeak(cleanText)
    return
  }

  try {
    const result = await speechApi.synthesize(cleanText)
    const audio = new Audio(`data:${result.mimeType};base64,${result.audioBase64}`)
    await audio.play()
  } catch {
    browserSpeak(cleanText)
  }
}
