import { type ReactNode, useEffect, useRef, useState } from 'react'

import { CheckCircle2, ChevronDown, FileUp, Loader2, Mic, Volume2, X } from 'lucide-react'

import { cn } from '@/core/lib/utils'
import { speakAccessibleText } from '@/core/services/speech.service'

import { AnimatedButton } from './interactive'

function FieldIcons({
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
    <span className='absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-3 text-[#666]'>
      {select ? (
        <ChevronDown className='h-4 w-4' aria-hidden='true' />
      ) : (
        <button
          type='button'
          onClick={onMicClick}
          aria-label='Nhập bằng giọng nói'
          className={cn('rounded-full p-1 transition hover:bg-black/5 hover:text-black', isListening && 'animate-pulse bg-red-50 text-red-500')}
        >
          <Mic className='h-4 w-4' aria-hidden='true' />
        </button>
      )}
      <button type='button' onClick={onSpeakClick} aria-label='Đọc nội dung' className='rounded-full p-1 transition hover:bg-black/5 hover:text-black'>
        <Volume2 className='h-4 w-4' aria-hidden='true' />
      </button>
    </span>
  )
}

export function FigmaField({
  label,
  placeholder,
  textarea,
  select,
  options,
  className,
  value: propValue,
  onChange: propOnChange,
  name
}: {
  label: string
  placeholder?: string
  textarea?: boolean
  select?: boolean
  options?: string[]
  className?: string
  value?: string
  onChange?: (val: string) => void
  name?: string
}) {
  const [value, setValue] = useState(propValue || '')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (propValue !== undefined) setValue(propValue)
  }, [propValue])

  const handleChange = (val: string) => {
    setValue(val)
    propOnChange?.(val)
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
    <label className={cn('block', className)}>
      {label ? (
        <span className='mb-2 flex items-center gap-1.5 text-[12px] font-black text-black'>
          {label}
          <button type='button' onClick={handleSpeakLabel} aria-label={`Đọc nhãn ${label}`} className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'>
            <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
          </button>
        </span>
      ) : null}
      <span className='relative block'>
        {textarea ? (
          <textarea
            name={name}
            placeholder={placeholder}
            aria-label={label || placeholder}
            value={value}
            onChange={(event) => handleChange(event.target.value)}
            className='min-h-[130px] w-full resize-none border border-[#CFE3F7] bg-white px-4 py-4 pr-16 text-[13px] outline-none placeholder:text-[#767676] focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/10'
          />
        ) : select && options ? (
          <select
            name={name}
            aria-label={label || placeholder}
            value={value}
            onChange={(event) => handleChange(event.target.value)}
            className='h-12 w-full border border-[#CFE3F7] bg-white px-4 pr-16 text-[13px] outline-none appearance-none focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/10'
          >
            {placeholder && <option value="" disabled hidden>{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            placeholder={placeholder}
            aria-label={label || placeholder}
            value={value}
            onChange={(event) => handleChange(event.target.value)}
            className='h-12 w-full border border-[#CFE3F7] bg-white px-4 pr-16 text-[13px] outline-none placeholder:text-[#767676] focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/10'
          />
        )}
        <FieldIcons select={select} isListening={isListening} onMicClick={handleMicClick} onSpeakClick={handleSpeakValue} />
      </span>
    </label>
  )
}

export function UploadBox({
  title,
  action,
  value,
  onFileSelect,
  accept = '*/*',
  uploading = false
}: {
  title: string
  action: string
  value?: string
  onFileSelect?: (file: File) => void
  accept?: string
  uploading?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onFileSelect) {
      onFileSelect(file)
    }
  }

  const isImage = value && (
    value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ||
    value.startsWith('blob:') ||
    value.startsWith('data:') ||
    value.includes('media/upload') ||
    value.includes('logoUrl') ||
    value.includes('logo_url') ||
    value.includes('logo')
  )

  return (
    <div className='relative w-full'>
      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className='hidden'
      />
      <AnimatedButton
        type='button'
        onClick={handleClick}
        disabled={uploading}
        aria-label={`${title}: ${value ? 'Đã tải lên' : action}`}
        className='flex aspect-square min-h-[190px] w-full flex-col items-center justify-center border border-[#CFE3F7] bg-white text-center hover:border-black hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] relative overflow-hidden'
      >
        {uploading ? (
          <div className='flex flex-col items-center justify-center gap-2'>
            <Loader2 className='h-7 w-7 animate-spin text-black' />
            <span className='text-[11px] font-black uppercase text-black'>Đang tải lên...</span>
          </div>
        ) : value ? (
          isImage ? (
            <img src={value} alt={title} className='absolute inset-0 h-full w-full object-contain p-2' />
          ) : (
            <div className='flex flex-col items-center justify-center p-4'>
              <CheckCircle2 className='h-7 w-7 text-green-600' />
              <span className='mt-2 text-[11px] font-black uppercase text-black'>{title}</span>
              <span className='mt-1 text-[10px] text-[#555] max-w-full truncate' title={value}>{value.split('/').pop()}</span>
              <span className='mt-2 border-b border-[#777] text-[10px] font-medium text-[#555] hover:text-black'>Thay đổi tệp</span>
            </div>
          )
        ) : (
          <>
            <FileUp className='h-7 w-7 text-[#555]' aria-hidden='true' />
            <span className='mt-4 text-[11px] font-black uppercase text-black'>{title}</span>
            <span className='mt-1 border-b border-[#777] text-[11px] font-medium text-[#555]'>{action}</span>
          </>
        )}
      </AnimatedButton>
    </div>
  )
}

export function Chip({
  children,
  removable = false,
  onRemove
}: {
  children: ReactNode
  removable?: boolean
  onRemove?: () => void
}) {
  return (
    <span className='inline-flex items-center gap-2 bg-[#004080] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-white'>
      {children}
      {removable ? (
        <button type='button' onClick={onRemove} aria-label='Xóa' className='hover:opacity-75 focus:outline-none'>
          <X className='h-3 w-3' aria-hidden='true' />
        </button>
      ) : null}
    </span>
  )
}

export function PrimaryAction({
  children = 'Hoàn tất',
  type = 'button',
  onClick,
  disabled = false
}: {
  children?: ReactNode
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <AnimatedButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      className='mt-8 h-14 w-full bg-[#004080] text-[12px] font-black uppercase tracking-[0.24em] text-white shadow-[0_14px_24px_rgba(0,64,128,0.18)] hover:bg-[#003466]'
    >
      {children}
    </AnimatedButton>
  )
}
