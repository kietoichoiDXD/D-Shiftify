import { useCallback, useState } from 'react'

import { getCurrentUser } from '@/core/shared/auth'
import { useAuthStore } from '@/core/store/features/auth/authStore'
import { type ConversationItem } from '@/pages/communication/chat/components/ChatSidebar'
import SharedChatLayout from '@/pages/communication/chat/SharedChatLayout'

const MOCK_COMPANIES: ConversationItem[] = [
  {
    id: 'company-1',
    name: 'Tập đoàn công nghệ X',
    lastMessage: 'Chúng tôi đã xem hồ sơ của bạn...',
    timestamp: '10:30 AM',
    isOnline: true,
    unreadCount: 3
  },
  {
    id: 'company-2',
    name: 'Công ty ABC Solutions',
    lastMessage: 'Mời bạn tham gia phỏng vấn...',
    timestamp: '9:15 AM',
    isOnline: false,
    unreadCount: 1
  },
  {
    id: 'company-3',
    name: 'Startup XYZ',
    lastMessage: 'Cảm ơn bạn đã nộp đơn...',
    timestamp: '8:45 AM',
    isOnline: true
  }
]

export default function DisabilityBusinessChat() {
  const storeUser = useAuthStore((state) => state.user)
  const currentUserId = storeUser?.id || getCurrentUser()?.id || ''

  const [activeContactId, setActiveContactId] = useState<string | null>(null)

  const handleSelectContact = useCallback((id: string) => {
    setActiveContactId(id)
  }, [])

  const handleSearch = useCallback((_query: string) => {}, [])

  const handleSendMessage = useCallback((_contactId: string, _text: string) => {}, [])

  const handleCall = useCallback((_contactId: string) => {}, [])

  const handleVideoCall = useCallback((_contactId: string) => {}, [])

  return (
    <SharedChatLayout
      sidebarTitle='Công ty'
      contactList={MOCK_COMPANIES}
      activeContactId={activeContactId}
      currentUserRole='candidate'
      currentUserId={currentUserId}
      onSelectContact={handleSelectContact}
      onSearch={handleSearch}
      onSendMessage={handleSendMessage}
      onCall={handleCall}
      onVideoCall={handleVideoCall}
    />
  )
}
