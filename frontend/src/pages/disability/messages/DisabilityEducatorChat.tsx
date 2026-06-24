import { useCallback, useState } from 'react'

import { getCurrentUser } from '@/core/shared/auth'
import { useAuthStore } from '@/core/store/features/auth/authStore'
import { type ConversationItem } from '@/pages/communication/chat/components/ChatSidebar'
import SharedChatLayout from '@/pages/communication/chat/SharedChatLayout'

const MOCK_TRAINING_CENTERS: ConversationItem[] = [
  {
    id: 'center-1',
    name: 'Trung tâm đào tạo Tech Pro',
    lastMessage: 'Khóa học mới sắp bắt đầu...',
    timestamp: '11:00 AM',
    isOnline: true,
    unreadCount: 2
  },
  {
    id: 'center-2',
    name: 'Học viện Kỹ năng Việt',
    lastMessage: 'Chứng chỉ của bạn đã được phê duyệt...',
    timestamp: '10:00 AM',
    isOnline: true
  }
]

export default function DisabilityEducatorChat() {
  const storeUser = useAuthStore((state) => state.user)
  const currentUserId = storeUser?.id || getCurrentUser()?.id || ''

  const [activeContactId, setActiveContactId] = useState<string | null>(null)

  const handleSelectContact = useCallback((id: string) => {
    setActiveContactId(id)
  }, [])

  const handleSearch = useCallback((query: string) => {
    console.log('Search query:', query)
  }, [])

  const handleSendMessage = useCallback((contactId: string, text: string) => {
    console.log(`Message sent to ${contactId}: ${text}`)
  }, [])

  const handleCall = useCallback((contactId: string) => {
    console.log(`Voice call initiated with ${contactId}`)
  }, [])

  const handleVideoCall = useCallback((contactId: string) => {
    console.log(`Video call initiated with ${contactId}`)
  }, [])

  return (
    <SharedChatLayout
      sidebarTitle='Cơ sở đào tạo'
      contactList={MOCK_TRAINING_CENTERS}
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
