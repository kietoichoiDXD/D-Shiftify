import { useCallback, useState } from 'react'

import { getCurrentUser } from '@/core/shared/auth'
import { useAuthStore } from '@/core/store/features/auth/authStore'
import { type ConversationItem } from '@/pages/communication/chat/components/ChatSidebar'
import SharedChatLayout from '@/pages/communication/chat/SharedChatLayout'

/**
 * Mock data for candidates messaging with companies and training centers
 */
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

/**
 * DisabilityMessagesPage - Messages page for Candidates with Disabilities
 * Allows candidates to message companies and training centers
 */
export default function DisabilityMessagesPage() {
  const storeUser = useAuthStore((state) => state.user)
  const currentUserId = storeUser?.id || getCurrentUser()?.id || ''

  const [activeTab, setActiveTab] = useState<'companies' | 'training'>('companies')
  const [activeContactId, setActiveContactId] = useState<string | null>(null)

  const currentContactList = activeTab === 'companies' ? MOCK_COMPANIES : MOCK_TRAINING_CENTERS
  const displayedContactId =
    activeContactId && currentContactList.some((c) => c.id === activeContactId) ? activeContactId : null

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

  const switchTab = (tab: 'companies' | 'training') => {
    setActiveTab(tab)
    setActiveContactId(null)
  }

  return (
    <div className='h-screen flex flex-col bg-white'>
      {/* Tab Navigation */}
      <div className='px-6 py-3 border-b border-gray-100 flex items-center gap-4'>
        <h1 className='text-lg font-semibold text-gray-900 tracking-tight'>Tin nhắn</h1>
        <div className='flex gap-1.5 ml-auto'>
          <button
            onClick={() => switchTab('companies')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'companies'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Công ty
          </button>
          <button
            onClick={() => switchTab('training')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'training'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            Cơ sở đào tạo
          </button>
        </div>
      </div>

      {/* Chat Layout */}
      <SharedChatLayout
        sidebarTitle={activeTab === 'companies' ? 'Công ty' : 'Cơ sở đào tạo'}
        contactList={currentContactList}
        activeContactId={displayedContactId}
        currentUserRole='candidate'
        currentUserId={currentUserId}
        onSelectContact={handleSelectContact}
        onSearch={handleSearch}
        onSendMessage={handleSendMessage}
        onCall={handleCall}
        onVideoCall={handleVideoCall}
      />
    </div>
  )
}
