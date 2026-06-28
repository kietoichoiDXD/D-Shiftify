import { useState } from 'react'

import { useAccessibility } from '@/contexts/useAccessibility'
import { type AccessibilitySettings } from '@/core/accessibility/accessibility.types'

const TOGGLES: Array<{ key: keyof AccessibilitySettings; label: string }> = [
  { key: 'autoTTS', label: 'Đọc to nội dung' },
  { key: 'autoSTT', label: 'Điều khiển bằng giọng nói' },
  { key: 'captions', label: 'Phụ đề' },
  { key: 'haptics', label: 'Rung phản hồi' },
  { key: 'largeTargets', label: 'Nút lớn' },
  { key: 'highContrast', label: 'Tương phản cao' }
]

export default function AccessibilityToolbar() {
  const { settings, setSetting, resetToDetected, profile, announce, haptic } = useAccessibility()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-label='Tuỳ chọn hỗ trợ tiếp cận'
        aria-expanded={open}
        className='fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#CFE3F7] bg-white text-[#004080] shadow-lg transition hover:bg-[#EAF4FF] focus:outline-none focus:ring-4 focus:ring-[#CFE3F7]'
      >
        ♿
      </button>

      {open ? (
        <section
          role='dialog'
          aria-label='Tuỳ chọn hỗ trợ tiếp cận'
          className='fixed bottom-20 left-6 z-50 w-72 max-w-[90vw] rounded-2xl border border-[#CFE3F7] bg-white p-4 shadow-2xl'
        >
          <h2 className='mb-1 text-base font-semibold text-[#004080]'>Hỗ trợ tiếp cận</h2>

          {profile?.autoDetected ? (
            <p className='mb-3 text-xs text-emerald-700'>
              Đã tự bật theo hồ sơ của bạn{profile.disabilityStatus ? ` (${profile.disabilityStatus})` : ''}.
            </p>

          ) : (
            <p className='mb-3 text-xs text-gray-500'>Bật các tính năng hỗ trợ phù hợp với bạn.</p>

          )}

          <ul className='space-y-2'>
            {TOGGLES.map(({ key, label }) => (
              <li key={key} className='flex items-center justify-between'>
                <label htmlFor={`a11y-${key}`} className='text-sm text-gray-800'>
                  {label}
                </label>

                <button
                  id={`a11y-${key}`}
                  type='button'
                  role='switch'
                  aria-checked={settings[key]}
                  onClick={() => {
                    const next = !settings[key]
                    setSetting(key, next)
                    haptic(40, { force: true })
                    announce(`${label} ${next ? 'đã bật' : 'đã tắt'}`, { force: true })
                  }}
                  className={`relative h-6 w-11 rounded-full transition ${settings[key] ? 'bg-[#004080]' : 'bg-gray-300'}`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                      settings[key] ? 'left-[1.375rem]' : 'left-0.5'
                    }`}
                  />
                </button>

              </li>

            ))}
          </ul>

          {profile?.autoDetected ? (
            <button
              type='button'
              onClick={resetToDetected}
              className='mt-3 w-full rounded-xl border border-[#CFE3F7] py-2 text-sm font-medium text-[#004080] hover:bg-[#EAF4FF]'
            >
              Khôi phục thiết lập tự động
            </button>

          ) : null}
        </section>

      ) : null}
    </>

  )
}
