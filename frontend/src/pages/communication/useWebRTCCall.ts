import { useCallback, useEffect, useRef, useState } from 'react'

import { useSocketContext } from '@/contexts/useSocketContext'

const CALL_EVENTS = {
  JOIN: 'call_join',
  READY: 'call_ready',
  PEER_JOINED: 'call_peer_joined',
  SIGNAL: 'call_signal',
  LEAVE: 'call_leave',
  PEER_LEFT: 'call_peer_left'
} as const

const ICE_SERVERS: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'connected' | 'ended' | 'error'

type SignalPayload =
  | { type: 'offer' | 'answer'; sdp: RTCSessionDescriptionInit }
  | { type: 'ice'; candidate: RTCIceCandidateInit }

export interface UseWebRTCCallOptions {
  roomId: string
  video: boolean
}

export interface UseWebRTCCallReturn {
  status: CallStatus
  error: string | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  micEnabled: boolean
  cameraEnabled: boolean
  remotePresent: boolean
  toggleMic: () => void
  toggleCamera: () => void
  hangUp: () => void
}

export const useWebRTCCall = ({ roomId, video }: UseWebRTCCallOptions): UseWebRTCCallReturn => {
  const { socket, isConnected } = useSocketContext()

  const [status, setStatus] = useState<CallStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(video)
  const [remotePresent, setRemotePresent] = useState(false)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const pendingCandidates = useRef<RTCIceCandidateInit[]>([])

  const cleanup = useCallback(() => {
    pcRef.current?.getSenders().forEach((sender) => sender.track?.stop())
    pcRef.current?.close()
    pcRef.current = null
    localStreamRef.current?.getTracks().forEach((track) => track.stop())
    localStreamRef.current = null
    setLocalStream(null)
    setRemoteStream(null)
    setRemotePresent(false)
  }, [])

  const sendSignal = useCallback(
    (data: SignalPayload) => {
      socket?.emit(CALL_EVENTS.SIGNAL, { data })
    },
    [socket]
  )

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: 'ice', candidate: event.candidate.toJSON() })
      }
    }

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0] ?? null)
      setRemotePresent(true)
      setStatus('connected')
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setStatus((prev) => (prev === 'ended' ? prev : 'error'))
      }
    }

    localStreamRef.current?.getTracks().forEach((track) => {
      if (localStreamRef.current) pc.addTrack(track, localStreamRef.current)
    })

    pcRef.current = pc
    return pc
  }, [sendSignal])

  const flushCandidates = useCallback(async (pc: RTCPeerConnection) => {
    const candidates = pendingCandidates.current
    pendingCandidates.current = []
    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch {

      }
    }
  }, [])

  useEffect(() => {
    if (!socket || !isConnected || !roomId) return undefined

    let disposed = false
    setStatus('connecting')
    setError(null)

    navigator.mediaDevices
      .getUserMedia({ audio: true, video })
      .then((stream) => {
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        localStreamRef.current = stream
        setLocalStream(stream)
        socket.emit(CALL_EVENTS.JOIN, { roomId })
        setStatus('ringing')
      })
      .catch((mediaError: Error) => {
        if (disposed) return
        setError(
          mediaError.name === 'NotAllowedError'
            ? 'Bạn cần cấp quyền micro/camera để thực hiện cuộc gọi.'
            : 'Không truy cập được thiết bị micro/camera.'
        )
        setStatus('error')
      })

    return () => {
      disposed = true
    }
  }, [socket, isConnected, roomId, video])

  useEffect(() => {
    if (!socket) return undefined

    const handleReady = async ({ shouldOffer }: { shouldOffer: boolean }) => {
      if (!shouldOffer) return
      const pc = createPeerConnection()
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      sendSignal({ type: 'offer', sdp: offer })
    }

    const handlePeerJoined = () => setRemotePresent(true)

    const handleSignal = async ({ data }: { data: SignalPayload }) => {
      try {
        if (data.type === 'offer') {
          const pc = pcRef.current ?? createPeerConnection()
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          await flushCandidates(pc)
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          sendSignal({ type: 'answer', sdp: answer })
        } else if (data.type === 'answer') {
          const pc = pcRef.current
          if (!pc) return
          await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          await flushCandidates(pc)
        } else if (data.type === 'ice') {
          const pc = pcRef.current
          if (pc?.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
          } else {
            pendingCandidates.current.push(data.candidate)
          }
        }
      } catch {
        setError('Lỗi thiết lập kết nối cuộc gọi.')
        setStatus('error')
      }
    }

    const handlePeerLeft = () => {
      setRemotePresent(false)
      setRemoteStream(null)
      setStatus('ended')
    }

    socket.on(CALL_EVENTS.READY, handleReady)
    socket.on(CALL_EVENTS.PEER_JOINED, handlePeerJoined)
    socket.on(CALL_EVENTS.SIGNAL, handleSignal)
    socket.on(CALL_EVENTS.PEER_LEFT, handlePeerLeft)

    return () => {
      socket.off(CALL_EVENTS.READY, handleReady)
      socket.off(CALL_EVENTS.PEER_JOINED, handlePeerJoined)
      socket.off(CALL_EVENTS.SIGNAL, handleSignal)
      socket.off(CALL_EVENTS.PEER_LEFT, handlePeerLeft)
    }
  }, [socket, createPeerConnection, sendSignal, flushCandidates])

  useEffect(() => cleanup, [cleanup])

  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMicEnabled(track.enabled)
  }, [])

  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setCameraEnabled(track.enabled)
  }, [])

  const hangUp = useCallback(() => {
    socket?.emit(CALL_EVENTS.LEAVE)
    cleanup()
    setStatus('ended')
  }, [socket, cleanup])

  return {
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
  }
}
