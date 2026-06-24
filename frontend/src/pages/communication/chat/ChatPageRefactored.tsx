import { MessageSquare, Wifi, WifiOff } from 'lucide-react'

import ChatSidebar from './components/ChatSidebar'
import ChatWindow from './components/ChatWindow'
import TopNavigation from './components/TopNavigation'
import './chat.css'
import { useChat } from './useChat'

export default function ChatPageRefactored() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    isConnected,
    isConnecting,
    isLoadingConversations,
    isLoadingMessages,
    error,
    selectConversation,
    sendMessage,
    clearError
  } = useChat()

  const readText = (text: string) => {
    if (!window.speechSynthesis || !text.trim()) {
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'vi-VN'
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className='h-screen flex flex-col bg-white overflow-hidden'>
      <TopNavigation />

      <div className='border-b border-gray-100 px-5 py-2 flex items-center justify-between bg-white'>
        <div className='flex items-center gap-2 text-xs font-medium text-gray-500'>
          {isConnected ? (
            <>
              <Wifi size={15} className='text-green-500' />
              <span>Realtime đã kết nối</span>
            </>
          ) : (
            <>
              <WifiOff size={15} className={isConnecting ? 'text-amber-500' : 'text-gray-400'} />
              <span>{isConnecting ? 'Đang kết nối realtime...' : 'Realtime chưa kết nối'}</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div role='alert' className='bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-3 text-sm'>
          <div className='flex items-center justify-between gap-4'>
            <span>{error}</span>
            <button
              type='button'
              onClick={clearError}
              className='text-xs font-semibold text-red-700 hover:text-red-900 focus:outline-none focus:underline'
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className='flex-1 overflow-hidden flex'>
        <ChatSidebar
          title='Hội thoại'
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={selectConversation}
        />

        {isLoadingConversations ? (
          <div className='w-full flex-1 bg-white flex items-center justify-center'>
            <p className='text-sm font-medium text-gray-400'>Đang tải danh sách hội thoại...</p>
          </div>
        ) : activeConversation ? (
          <ChatWindow
            conversationId={activeConversation.id}
            conversationTitle={activeConversation.name}
            messages={messages}
            isOnline={isConnected}
            isLoading={isLoadingMessages}
            onSendMessage={sendMessage}
            onReadMessage={readText}
          />
        ) : (
          <div className='w-full flex-1 bg-white flex flex-col items-center justify-center text-center px-6'>
            <div className='w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4'>
              <MessageSquare className='text-gray-300' size={28} />
            </div>
            <p className='text-sm font-semibold text-gray-600'>
              {conversations.length ? 'Chọn một hội thoại để bắt đầu' : 'Chưa có hội thoại nào'}
            </p>
            <p className='text-xs text-gray-400 mt-1'>
              Tin nhắn sẽ được tải qua REST API và cập nhật realtime bằng Socket.IO.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
