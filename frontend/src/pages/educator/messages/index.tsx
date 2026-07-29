import { useCallback, useState } from 'react'

import { getCurrentUser } from '@/core/shared/auth'
import { useAuthStore } from '@/core/store/features/auth/authStore'
import { type ConversationItem } from '@/pages/communication/chat/components/ChatSidebar'
import SharedChatLayout from '@/pages/communication/chat/SharedChatLayout'

/**
 * Mock data for educators messaging with students
 */
const MOCK_STUDENTS: ConversationItem[] = [
  {
    id: 'student-1',
    name: 'Hoàng Văn X',
    lastMessage: 'Em có thắc mắc về bài tập...',
    timestamp: '10:30 AM',
    isOnline: true
  },
  {
    id: 'student-2',
    name: 'Đỗ Thị Y',
    lastMessage: 'Cảm ơn thầy/cô về bài giảng...',
    timestamp: '9:15 AM',
    isOnline: true
  },
  {
    id: 'student-3',
    name: 'Vũ Văn Z',
    lastMessage: 'Em xin phép vắng buổi học mai...',
    timestamp: '8:45 AM',
    isOnline: false
  },
  {
    id: 'student-4',
    name: 'Trương Thị K',
    lastMessage: 'Em đã hoàn thành project...',
    timestamp: '7:30 AM',
    isOnline: true
  },
  {
    id: 'student-5',
    name: 'Đặng Văn L',
    lastMessage: 'Khi nào có các buổi ôn tập?',
    timestamp: '6:30 AM',
    isOnline: false
  }
]

/**
 * EducatorMessagesPage - Messages page for Educators/Training Centers
 * Allows educators to message students about courses and support
 */
export default function EducatorMessagesPage() {
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
      sidebarTitle='Học viên'
      contactList={MOCK_STUDENTS}
      activeContactId={activeContactId}
      currentUserRole='educator'
      currentUserId={currentUserId}
      onSelectContact={handleSelectContact}
      onSearch={handleSearch}
      onSendMessage={handleSendMessage}
      onCall={handleCall}
      onVideoCall={handleVideoCall}
      pageTitle='Tin nhắn với Học viên'
    />
  )
}
