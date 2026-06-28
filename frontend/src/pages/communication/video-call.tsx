import { useEffect, useRef } from 'react'

import { useNavigate, useSearchParams } from 'react-router-dom'

import { speakAccessibleText } from '@/core/services/speech.service'

import { useWebRTCCall, type CallStatus } from './useWebRTCCall'

const STATUS_LABEL: Record<CallStatus, string> = {
  idle: 'Đang chuẩn bị…',
  connecting: 'Đang truy cập camera & micro…',
  ringing: 'Đang kết nối, chờ người kia tham gia…',
  connected: 'Đã kết nối – đang trong cuộc gọi video',
  ended: 'Cuộc gọi đã kết thúc',
  error: 'Không thể kết nối'
}

export default function VideoCallPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const roomId = searchParams.get('room') || 'demo-room'
  const peerName = searchParams.get('name') || 'Đối phương'

  const {
    status,
    error,
    localStream,
    remoteStream,
    micEnabled,
    cameraEnabled,
    remotePresent,
    toggleMic,
    toggleCamera,
    hangUp
  } = useWebRTCCall({ roomId, video: true })

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream
  }, [localStream])

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream
  }, [remoteStream])

  const statusText = STATUS_LABEL[status]
  useEffect(() => {
    speakAccessibleText(statusText)
  }, [statusText])

  const handleHangUp = () => {
    hangUp()
    navigate(-1)
  }

  return (
    <section
      aria-labelledby='video-call-title'
      className='mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col gap-6 px-4 py-8'
    >
      <header className='flex items-center justify-between'>
        <h1 id='video-call-title' className='text-2xl font-semibold text-[#004080]'>
          Cuộc gọi video với {peerName}
        </h1>

        <p className='text-sm text-gray-600' role='status' aria-live='polite'>
          {statusText}
        </p>

      </header>

      {error ? (
        <p className='rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600' role='alert'>
          {error}
        </p>

      ) : null}

      <div className='relative overflow-hidden rounded-3xl border border-[#CFE3F7] bg-[#0B1B2B]'>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          aria-label={`Hình ảnh của ${peerName}`}
          className='aspect-video w-full bg-[#0B1B2B] object-cover'
        />
        {!remotePresent ? (
          <div className='absolute inset-0 flex items-center justify-center text-center text-white/80'>
            <p>Đang chờ {peerName} tham gia…</p>

          </div>

        ) : null}

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          aria-label='Hình ảnh của bạn'
          className='absolute bottom-4 right-4 h-32 w-44 rounded-xl border-2 border-white/70 object-cover shadow-lg'
        />
      </div>

      <div className='flex items-center justify-center gap-5'>
        <button
          type='button'
          onClick={toggleMic}
          aria-pressed={!micEnabled}
          aria-label={micEnabled ? 'Tắt micro' : 'Bật micro'}
          className={`flex h-14 w-14 items-center justify-center rounded-full border text-sm font-medium transition ${
            micEnabled
              ? 'border-[#CFE3F7] bg-white text-[#004080] hover:bg-[#EAF4FF]'
              : 'border-transparent bg-[#004080] text-white'
          }`}
        >
          {micEnabled ? 'Mic' : 'Tắt'}
        </button>

        <button
          type='button'
          onClick={toggleCamera}
          aria-pressed={!cameraEnabled}
          aria-label={cameraEnabled ? 'Tắt camera' : 'Bật camera'}
          className={`flex h-14 w-14 items-center justify-center rounded-full border text-sm font-medium transition ${
            cameraEnabled
              ? 'border-[#CFE3F7] bg-white text-[#004080] hover:bg-[#EAF4FF]'
              : 'border-transparent bg-[#004080] text-white'
          }`}
        >
          {cameraEnabled ? 'Cam' : 'Tắt'}
        </button>

        <button
          type='button'
          onClick={handleHangUp}
          aria-label='Kết thúc cuộc gọi'
          className='flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white shadow-lg transition hover:bg-red-700'
        >
          Kết thúc
        </button>

      </div>

    </section>

  )
}
