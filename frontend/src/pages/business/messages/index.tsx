import { useCallback, useState } from 'react'

import { getCurrentUser } from '@/core/shared/auth'
import { useAuthStore } from '@/core/store/features/auth/authStore'
import { type ConversationItem } from '@/pages/communication/chat/components/ChatSidebar'
import SharedChatLayout from '@/pages/communication/chat/SharedChatLayout'

/**
 * Mock data for recruiters messaging with candidates
 */
const MOCK_CANDIDATES: ConversationItem[] = [
  {
    id: 'candidate-1',
    name: 'Nguyễn Văn A',
    lastMessage: 'Tôi sẵn sàng cho buổi phỏng vấn...',
    timestamp: '10:30 AM',
    isOnline: true
  },
  {
    id: 'candidate-2',
    name: 'Trần Thị B',
    lastMessage: 'Cảm ơn vì cơ hội...',
    timestamp: '9:15 AM',
    isOnline: true
  },
  {
    id: 'candidate-3',
    name: 'Lê Văn C',
    lastMessage: 'Tôi đã hoàn thành bài tập...',
    timestamp: '8:45 AM',
    isOnline: false
  },
  {
    id: 'candidate-4',
    name: 'Phạm Thị D',
    lastMessage: 'Khi nào có kết quả phỏng vấn?',
    timestamp: '7:30 AM',
    isOnline: true
  }
]

export default function BusinessMessagesPage() {
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
    <div className='h-screen w-full flex flex-col bg-white overflow-hidden'>
      <SharedChatLayout
        sidebarTitle='Ứng viên'
        contactList={MOCK_CANDIDATES}
        activeContactId={activeContactId}
        currentUserRole='business'
        currentUserId={currentUserId}
        onSelectContact={handleSelectContact}
        onSearch={handleSearch}
        onSendMessage={handleSendMessage}
        onCall={handleCall}
        onVideoCall={handleVideoCall}
        pageTitle='Tin nhắn với Ứng viên'
      />
    </div>
  )
}
