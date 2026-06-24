import React, { type ReactNode, useEffect, useRef, useState } from 'react'

import {
  ChevronDown,
  Mic,
  Pause,
  Repeat2,
  SkipBack,
  SkipForward,
  Volume2
} from 'lucide-react'

import { cn } from '@/core/lib/utils'
import { speakAccessibleText } from '@/core/services/speech.service'

export interface VoiceFieldProps {
  label: string
  placeholder?: string
  value?: string
  textarea?: boolean
  select?: boolean
  faded?: boolean
  active?: boolean
  name?: string
  onChange?: (val: string) => void
}

export const commonInputClassName =
  'w-full border border-[#E4E4E4] bg-white px-4 pr-16 text-[13px] font-medium text-[#111] outline-none transition placeholder:text-[#B8B8B8] focus:border-black focus:ring-2 focus:ring-black/5'

export function FieldIcons({
  select,
  isListening,
  onMicClick,
  onSpeakClick
}: {
  select?: boolean
  isListening: boolean
  onMicClick: () => void
  onSpeakClick: () => void
}) {
  return (
    <span className='absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-3 text-[#777]'>
      {select ? (
        <ChevronDown className='h-4 w-4' />
      ) : (
        <button
          type='button'
          onClick={onMicClick}
          aria-label='Nhập bằng giọng nói'
          className={cn('rounded-full p-1 transition hover:bg-black/5 hover:text-black', isListening && 'animate-pulse bg-red-50 text-red-500')}
        >
          <Mic className='h-4 w-4' />
        </button>
      )}
      <button
        type='button'
        onClick={onSpeakClick}
        aria-label='Đọc nội dung'
        className='rounded-full p-1 transition hover:bg-black/5 hover:text-black'
      >
        <Volume2 className='h-4 w-4' />
      </button>
    </span>
  )
}

export function VoiceField({
  label,
  placeholder,
  value: propValue,
  textarea,
  select,
  faded,
  active,
  name,
  onChange
}: VoiceFieldProps) {
  const [value, setValue] = useState(propValue || '')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (propValue !== undefined) setValue(propValue)
  }, [propValue])

  const handleChange = (val: string) => {
    setValue(val)
    onChange?.(val)
  }

  const handleSpeakValue = () => {
    const textToSpeak = value || placeholder || label || ''
    if (textToSpeak) speakAccessibleText(textToSpeak)
  }

  const handleSpeakLabel = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (label) speakAccessibleText(label)
  }

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'vi-VN'
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event: any) => handleChange(event.results[0][0].transcript)
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event)
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    recognition.start()
  }

  return (
    <label className={cn('block', faded && 'opacity-25 blur-[0.4px]', active && 'rounded-md bg-white p-5 shadow-sm')}>
      <span className='mb-2 flex items-center gap-2 text-[12px] font-bold text-[#222]'>
        {label}
        <button
          type='button'
          onClick={handleSpeakLabel}
          aria-label={`Đọc nhãn ${label}`}
          className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
        >
          <Volume2 className='h-3.5 w-3.5 text-[#777]' />
        </button>
      </span>
      <span className='relative block'>
        {textarea ? (
          <textarea
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={cn(commonInputClassName, 'min-h-[132px] resize-none py-4')}
          />
        ) : (
          <input
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className={cn(commonInputClassName, 'h-12')}
          />
        )}
        <FieldIcons select={select} isListening={isListening} onMicClick={handleMicClick} onSpeakClick={handleSpeakValue} />
      </span>
    </label>
  )
}

export function OptionRow({
  children,
  muted,
  selected,
  onClick
}: {
  children: React.ReactNode
  muted?: boolean
  selected?: boolean
  onClick?: () => void
}) {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (typeof children === 'string') {
      speakAccessibleText(children)
    }
  }

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'flex h-12 w-full items-center justify-between border px-4 text-left text-[13px] font-medium transition',
        selected ? 'border-black bg-slate-50' : 'border-[#E4E4E4] bg-white',
        muted && 'text-[#A8A8A8]'
      )}
    >
      <span>{children}</span>
      <button
        type='button'
        onClick={handleSpeak}
        aria-label={`Đọc lựa chọn ${children}`}
        className='rounded-full p-1 transition hover:bg-black/5 hover:text-black'
      >
        <Volume2 className='h-4 w-4 text-[#777]' />
      </button>
    </button>
  )
}

export function BottomVoiceAction({
  label = 'Hoàn tất',
  wide = false,
  onClick,
  instructionText
}: {
  label?: string
  wide?: boolean
  onClick?: () => void
  instructionText?: string
}) {
  const handleSpeakInstruction = () => {
    if (instructionText) {
      speakAccessibleText(instructionText)
    }
  }

  return (
    <footer className='sticky bottom-0 z-30 mt-10 border-t border-[#E4E4E4] bg-white/95 px-5 py-5 backdrop-blur'>
      <div className={cn('mx-auto flex h-16 w-full items-center gap-7', wide ? 'max-w-[672px]' : 'max-w-[760px]')}>
        <button
          type='button'
          onClick={handleSpeakInstruction}
          aria-label='Đọc hướng dẫn'
          className='flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-[#F5F5F5] text-black hover:bg-[#eaeaea] transition'
        >
          <Volume2 className='h-7 w-7' />
        </button>
        <button
          type='button'
          onClick={onClick}
          className='h-14 flex-1 bg-black text-[12px] font-black uppercase tracking-[0.24em] text-white shadow-[0_12px_20px_rgba(0,0,0,0.14)] transition hover:bg-[#222]'
        >
          {label}
        </button>
      </div>
    </footer>
  )
}

export function PlaybackControls({
  onPlayField,
  onPause,
  onNextField,
  onPrevField,
  isPlaying
}: {
  onPlayField?: () => void
  onPause?: () => void
  onNextField?: () => void
  onPrevField?: () => void
  isPlaying?: boolean
}) {
  return (
    <div className='mx-auto grid h-16 max-w-[420px] grid-cols-4 items-center text-[#555]'>
      {[
        { label: 'Trước', icon: SkipBack, onClick: onPrevField },
        { label: isPlaying ? 'Dừng' : 'Đọc', icon: Pause, active: isPlaying, onClick: isPlaying ? onPause : onPlayField },
        { label: 'Tiếp', icon: SkipForward, onClick: onNextField },
        { label: 'Lặp lại', icon: Repeat2, onClick: onPlayField }
      ].map((item) => {
        const Icon = item.icon

        return (
          <button
            key={item.label}
            type='button'
            onClick={item.onClick}
            className={cn(
              'flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.12em] transition hover:bg-black/5',
              item.active && 'border-x border-black bg-[#F5F5F5] text-black'
            )}
          >
            <Icon className='h-5 w-5' />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className='mb-10'>
      <div className='mb-5 flex items-center gap-3'>
        <Volume2 className='h-4 w-4 text-black' />
        <h2 className='text-[17px] font-black uppercase tracking-[0.02em]'>{title}</h2>
        <span className='h-px flex-1 bg-[#DADADA]' />
      </div>
      {children}
    </section>
  )
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className='inline-flex bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white'>{children}</span>
}
