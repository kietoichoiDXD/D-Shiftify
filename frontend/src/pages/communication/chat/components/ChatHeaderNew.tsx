import { Phone, Video } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface ChatHeaderProps {
  conversationTitle: string
  isOnline?: boolean
  avatar?: string
  onCall?: () => void
  onVideoCall?: () => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ChatHeader({
  conversationTitle,
  isOnline = false,
  avatar,
  onCall,
  onVideoCall
}: ChatHeaderProps) {
  return (
    <div className='h-16 bg-white border-b border-gray-100 px-5 flex items-center justify-between'>
      {/* Left Side: Contact Info */}
      <div className='flex items-center gap-3 min-w-0'>
        <div className='relative flex-shrink-0'>
          <Avatar className='h-10 w-10'>
            {avatar && <AvatarImage src={avatar} alt={conversationTitle} />}
            <AvatarFallback className='bg-brand-primary text-white text-xs font-semibold'>
              {getInitials(conversationTitle)}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span
              className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full
                border-2 border-white chat-online-pulse'
              aria-label='Online'
            />
          )}
        </div>

        <div className='flex flex-col min-w-0'>
          <h2 className='font-semibold text-gray-900 text-sm truncate leading-tight'>
            {conversationTitle}
          </h2>
          <div className='flex items-center gap-1.5 mt-0.5'>
            {isOnline ? (
              <>
                <span className='w-1.5 h-1.5 bg-green-500 rounded-full' />
                <span className='text-[11px] text-green-600 font-medium'>Đang hoạt động</span>
              </>
            ) : (
              <span className='text-[11px] text-gray-400'>Ngoại tuyến</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Action Buttons */}
      <TooltipProvider delayDuration={300}>
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCall}
                aria-label='Gọi điện thoại'
                className='inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary
                  bg-brand-primary/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/30'
              >
                <Phone size={16} />
                <span className='hidden lg:inline'>Gọi điện</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Gọi điện thoại</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onVideoCall}
                aria-label='Gọi video'
                className='inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white
                  bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/30'
              >
                <Video size={16} />
                <span className='hidden lg:inline'>Video call</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Gọi video</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
