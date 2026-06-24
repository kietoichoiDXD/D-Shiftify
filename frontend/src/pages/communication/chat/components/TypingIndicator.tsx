interface TypingIndicatorProps {
  contactName?: string
}

export default function TypingIndicator({ contactName }: TypingIndicatorProps) {
  return (
    <div className='flex items-start gap-2 px-6 py-2 chat-animate-fadeInUp' aria-live='polite'>
      <div className='flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-2xl rounded-bl-md'>
        <div className='flex items-center gap-1'>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className='w-[6px] h-[6px] rounded-full bg-gray-400'
              style={{
                animation: `chatPulseDot 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
        {contactName && (
          <span className='text-[11px] text-gray-400 ml-1'>{contactName} đang nhập...</span>
        )}
      </div>
    </div>
  )
}
