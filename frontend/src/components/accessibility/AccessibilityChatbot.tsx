import { useCallback, useEffect, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { useAccessibility } from '@/contexts/useAccessibility'
import { useAutoSTT, type VoiceIntent } from '@/hooks/accessibility/useAutoSTT'

interface BotLine {
  id: number
  from: 'bot' | 'user'
  text: string
}

const HELP_TEXT =
  'Bạn có thể nói: "tìm việc làm", "tin nhắn", "thông báo", "hồ sơ", "trang chủ", hoặc "trợ giúp". Nói "dừng" để tắt nghe.'

let lineSeq = 0

export default function AccessibilityChatbot() {
  const navigate = useNavigate()
  const { settings, profile, announce, haptic } = useAccessibility()
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState<BotLine[]>([])
  const greetedRef = useRef(false)

  const pushLine = useCallback((from: BotLine['from'], text: string) => {
    setLines((prev) => [...prev.slice(-30), { id: ++lineSeq, from, text }])
  }, [])

  const botSay = useCallback(
    (text: string, opts?: { force?: boolean }) => {
      pushLine('bot', text)
      announce(text, opts)
      haptic(40)
    },
    [pushLine, announce, haptic]
  )

  const handleIntent = useCallback(
    (intent: VoiceIntent) => {
      switch (intent.kind) {
        case 'navigate':
          botSay(`Đang mở ${intent.label}.`, { force: true })
          haptic([30, 40, 30], { force: true })
          break
        case 'help':
          botSay(HELP_TEXT, { force: true })
          break
        case 'stop':
          botSay('Đã tắt chế độ nghe. Mở lại bằng nút micro.', { force: true })
          break
        case 'unknown':
          botSay(`Tôi chưa hiểu "${intent.transcript}". Nói "trợ giúp" để nghe các lệnh.`)
          break
      }
    },
    [botSay, haptic]
  )

  const { supported, listening, start, stop } = useAutoSTT({
    enabled: settings.autoSTT,
    onIntent: handleIntent,
    onTranscript: (t) => pushLine('user', t)
  })

  useEffect(() => {
    const assistive = settings.autoSTT || settings.captions
    if (assistive && !greetedRef.current) {
      greetedRef.current = true
      setOpen(true)
      const needWord = profile?.needs.includes('hearing') ? 'phụ đề' : 'giọng nói'
      botSay(`Xin chào, trợ lý Shiftify đã sẵn sàng hỗ trợ bạn bằng ${needWord}. ${HELP_TEXT}`, { force: true })
      haptic([60, 50, 60], { force: true })
    }
  }, [settings.autoSTT, settings.captions, profile, botSay, haptic])

  if (!settings.autoSTT && !settings.captions) return null

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng trợ lý hỗ trợ' : 'Mở trợ lý hỗ trợ'}
        className='fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#004080] text-white shadow-xl transition hover:bg-[#003466] focus:outline-none focus:ring-4 focus:ring-[#CFE3F7]'
      >
        <span className='text-sm font-semibold'>{listening ? '● Nghe' : 'Trợ lý'}</span>

      </button>

      {open ? (
        <section
          role='dialog'
          aria-label='Trợ lý hỗ trợ tiếp cận'
          className='fixed bottom-24 right-6 z-50 flex h-[26rem] w-[22rem] max-w-[90vw] flex-col overflow-hidden rounded-3xl border border-[#CFE3F7] bg-white shadow-2xl'
        >
          <header className='flex items-center justify-between bg-[#004080] px-4 py-3 text-white'>
            <p className='font-semibold'>Trợ lý Shiftify</p>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                listening ? 'bg-emerald-500' : 'bg-white/20'
              }`}
              aria-live='polite'
            >
              {listening ? 'Đang nghe' : settings.autoSTT ? 'Tạm dừng' : 'Phụ đề'}
            </span>

          </header>

          <div className='flex-1 space-y-2 overflow-y-auto px-4 py-3' aria-live='polite'>
            {lines.map((line) => (
              <p
                key={line.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  line.from === 'bot'
                    ? 'bg-[#EAF4FF] text-[#004080]'
                    : 'ml-auto bg-[#004080] text-white'
                }`}
              >
                {line.text}
              </p>

            ))}
            {!lines.length ? <p className='text-sm text-gray-500'>{HELP_TEXT}</p> : null}

          </div>

          <div className='grid grid-cols-2 gap-2 border-t border-[#CFE3F7] p-3'>
            {[
              { label: 'Tìm việc', route: ROUTE.DISABILITY.JOBS },
              { label: 'Tin nhắn', route: ROUTE.COMMON_PRIVATE.CHAT },
              { label: 'Thông báo', route: ROUTE.DISABILITY.NOTIFICATIONS },
              { label: 'Hồ sơ', route: ROUTE.DISABILITY.PROFILE }
            ].map((cmd) => (
              <button
                key={cmd.route}
                type='button'
                onClick={() => {
                  haptic([30, 40, 30], { force: true })
                  navigate(cmd.route)
                }}
                className='rounded-xl border border-[#CFE3F7] px-3 py-2 text-sm font-medium text-[#004080] transition hover:bg-[#EAF4FF]'
              >
                {cmd.label}
              </button>

            ))}
          </div>

          {settings.autoSTT && supported ? (
            <button
              type='button'
              onClick={() => (listening ? stop() : start())}
              className='m-3 mt-0 rounded-xl bg-[#004080] py-2 text-sm font-semibold text-white transition hover:bg-[#003466]'
            >
              {listening ? 'Tắt nghe' : 'Bật nghe'}
            </button>

          ) : null}
          {settings.autoSTT && !supported ? (
            <p className='m-3 mt-0 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700'>
              Trình duyệt không hỗ trợ nhận giọng nói. Hãy dùng các nút lệnh nhanh ở trên.
            </p>

          ) : null}
        </section>

      ) : null}
    </>

  )
}
