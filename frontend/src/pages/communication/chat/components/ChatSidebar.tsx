import { useState } from 'react'

import { MessageSquare, Search } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export interface ConversationItem {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  isOnline?: boolean
  avatar?: string
  unreadCount?: number
}

interface ChatSidebarProps {
  title?: string
  conversations: ConversationItem[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onSearchChange?: (query: string) => void
}

/** Generate a deterministic color from a string for avatar fallbacks */
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-cyan-600',
    'bg-fuchsia-600',
    'bg-teal-600'
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ChatSidebar({
  title,
  conversations,
  activeConversationId,
  onSelectConversation,
  onSearchChange
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChange?.(value)
  }

  const filteredConversations = searchQuery.trim()
    ? conversations.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations

  return (
    <aside className='w-[320px] min-w-[280px] h-full bg-white border-r border-gray-100 flex flex-col overflow-hidden'>
      {/* Header & Search */}
      <div className='p-4 pb-3 border-b border-gray-100'>
        {title && (
          <h2 className='text-base font-semibold text-gray-900 mb-3 tracking-tight'>{title}</h2>
        )}
        <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-[1.01]' : ''}`}>
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
              isSearchFocused ? 'text-brand-primary' : 'text-gray-400'
            }`}
            size={16}
          />
          <input
            type='text'
            placeholder='Tìm kiếm hội thoại...'
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            aria-label='Search conversations'
            className='w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
              focus:bg-white placeholder-gray-400 transition-all duration-200'
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className='flex-1 overflow-y-auto chat-scrollbar'>
        {filteredConversations.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
            <div className='w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4'>
              <MessageSquare className='text-gray-300' size={24} />
            </div>
            <p className='text-sm font-medium text-gray-400'>
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có hội thoại'}
            </p>
            {searchQuery && (
              <p className='text-xs text-gray-300 mt-1'>Thử từ khóa khác</p>
            )}
          </div>
        ) : (
          <ul role='list' className='py-1'>
            {filteredConversations.map((conversation, index) => {
              const isActive = activeConversationId === conversation.id
              const hasUnread = (conversation.unreadCount ?? 0) > 0

              return (
                <li
                  key={conversation.id}
                  className='chat-animate-slideInLeft'
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200
                      ${
                        isActive
                          ? 'bg-brand-primary/5 border-l-[3px] border-brand-primary'
                          : 'border-l-[3px] border-transparent hover:bg-gray-50'
                      }`}
                    aria-label={`Chat with ${conversation.name}`}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {/* Avatar with online indicator */}
                    <div className='relative flex-shrink-0'>
                      <Avatar className='h-11 w-11'>
                        {conversation.avatar && <AvatarImage src={conversation.avatar} alt={conversation.name} />}
                        <AvatarFallback
                          className={`${getAvatarColor(conversation.name)} text-white text-xs font-semibold`}
                        >
                          {getInitials(conversation.name)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online dot */}
                      {conversation.isOnline && (
                        <span
                          className='absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full
                            border-2 border-white chat-online-pulse'
                          aria-label='Online'
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between gap-2'>
                        <h3
                          className={`text-sm truncate ${
                            hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-800'
                          }`}
                        >
                          {conversation.name}
                        </h3>
                        <span
                          className={`text-[11px] flex-shrink-0 ${
                            hasUnread ? 'text-brand-primary font-semibold' : 'text-gray-400'
                          }`}
                        >
                          {conversation.timestamp}
                        </span>
                      </div>
                      <div className='flex items-center justify-between gap-2 mt-0.5'>
                        <p
                          className={`text-xs truncate ${
                            hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'
                          }`}
                        >
                          {conversation.lastMessage}
                        </p>
                        {hasUnread && (
                          <Badge
                            variant='default'
                            className='h-5 min-w-[20px] px-1.5 text-[10px] font-bold flex-shrink-0'
                          >
                            {conversation.unreadCount! > 99 ? '99+' : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
