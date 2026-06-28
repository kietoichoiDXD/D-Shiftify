import { useEffect, useMemo, useRef } from 'react'

import { useNavigate, useSearchParams } from 'react-router-dom'

import { speakAccessibleText } from '@/core/services/speech.service'

import { useWebRTCCall, type CallStatus } from './useWebRTCCall'

const STATUS_LABEL: Record<CallStatus, string> = {
  idle: 'Đang chuẩn bị…',
  connecting: 'Đang truy cập micro…',
  ringing: 'Đang kết nối, chờ người kia tham gia…',
  connected: 'Đã kết nối – đang trong cuộc gọi',
  ended: 'Cuộc gọi đã kết thúc',
  error: 'Không thể kết nối'
}

export default function CallPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const roomId = searchParams.get('room') || 'demo-room'
  const peerName = searchParams.get('name') || 'Đối phương'

  const { status, error, remoteStream, micEnabled, remotePresent, toggleMic, hangUp } = useWebRTCCall({
    roomId,
    video: false
  })

  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const statusText = STATUS_LABEL[status]
  useEffect(() => {
    speakAccessibleText(statusText)
  }, [statusText])

  const handleHangUp = () => {
    hangUp()
    navigate(-1)
  }

  const initials = useMemo(() => peerName.trim().charAt(0).toUpperCase() || '?', [peerName])

  return (
    <section
      aria-labelledby='call-page-title'
      className='mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center gap-8 rounded-3xl bg-gradient-to-b from-[#F8FBFF] to-[#EAF4FF] px-6 py-12'
    >
      <h1 id='call-page-title' className='sr-only'>
        Cuộc gọi thoại với {peerName}
      </h1>

      <div
        className='flex h-32 w-32 items-center justify-center rounded-full bg-[#004080] text-5xl font-semibold text-white shadow-lg'
        aria-hidden='true'
      >
        {initials}
      </div>

      <div className='text-center'>
        <p className='text-2xl font-semibold text-[#004080]'>{peerName}</p>

        <p className='mt-2 text-base text-gray-600' role='status' aria-live='polite'>
          {statusText}
        </p>

        {error ? (
          <p className='mt-2 text-sm font-medium text-red-600' role='alert'>
            {error}
          </p>

        ) : null}
      </div>

      {status === 'connected' && remotePresent ? (
        <span className='inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700'>
          <span className='h-2 w-2 animate-pulse rounded-full bg-emerald-500' /> Đang nói chuyện
        </span>

      ) : null}

      <div className='flex items-center gap-6'>
        <button
          type='button'
          onClick={toggleMic}
          aria-pressed={!micEnabled}
          aria-label={micEnabled ? 'Tắt micro' : 'Bật micro'}
          className={`flex h-16 w-16 items-center justify-center rounded-full border text-sm font-medium transition ${
            micEnabled
              ? 'border-[#CFE3F7] bg-white text-[#004080] hover:bg-[#EAF4FF]'
              : 'border-transparent bg-[#004080] text-white'
          }`}
        >
          {micEnabled ? 'Mic' : 'Tắt'}
        </button>

        <button
          type='button'
          onClick={handleHangUp}
          aria-label='Kết thúc cuộc gọi'
          className='flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-base font-semibold text-white shadow-lg transition hover:bg-red-700'
        >
          Kết thúc
        </button>

      </div>

      <audio ref={remoteAudioRef} autoPlay className='hidden' />
    </section>

  )
}
