import { useEffect, useRef, useState } from 'react'

import { MessageSquare, Plus, ThumbsUp, Volume2 } from 'lucide-react'

import { cn } from '@/core/lib/utils'
import axiosClient from '@/core/services/axios-client'
import { speakAccessibleText } from '@/core/services/speech.service'

type Post = {
  id: string
  authorName: string
  authorRole: string
  content: string
  topic: string
  createdAt: string
  likeCount: number
  commentCount: number
  liked?: boolean
}

type ApiEnvelope = { data: Post[]; meta?: { total: number } }

const TOPICS = ['Tất cả', 'Kinh nghiệm tìm việc', 'Tâm sự & Chia sẻ', 'Hỏi & Đáp', 'Tin tức NKT', 'Hướng nghiệp'] as const
type Topic = (typeof TOPICS)[number]

// TODO(backend): replace with GET /api/v1/community/posts
const MOCK_POSTS: Post[] = [
  {
    id: 'p1', authorName: 'Nguyễn Văn An', authorRole: 'Khiếm thị',
    content: 'Mình vừa nhận được offer sau 3 tháng tìm việc. Bí quyết là dùng tính năng TTS của D-Shiftify để tự học hỏi và luyện tập phỏng vấn mỗi ngày. Cảm ơn cộng đồng đã động viên!',
    topic: 'Kinh nghiệm tìm việc', createdAt: '2026-07-28', likeCount: 24, commentCount: 8, liked: false
  },
  {
    id: 'p2', authorName: 'Trần Thị Bảo', authorRole: 'Khiếm thính',
    content: 'Ai có kinh nghiệm phỏng vấn bằng ngôn ngữ ký hiệu không? Mình đang chuẩn bị cho buổi phỏng vấn tuần sau và khá lo lắng. Công ty có nói họ sẽ bố trí phiên dịch nhưng mình chưa biết nên chuẩn bị gì thêm.',
    topic: 'Hỏi & Đáp', createdAt: '2026-07-27', likeCount: 12, commentCount: 15, liked: false
  },
  {
    id: 'p3', authorName: 'Lê Quốc Cường', authorRole: 'Khuyết tật vận động',
    content: 'Chia sẻ list 10 công ty ở TP.HCM mình biết có chính sách tuyển dụng NKT rất tốt, có chỗ ngồi thuận tiện xe lăn và cho phép làm remote 3/5 ngày. DM mình nếu bạn cần thông tin chi tiết.',
    topic: 'Tin tức NKT', createdAt: '2026-07-26', likeCount: 47, commentCount: 22, liked: true
  },
  {
    id: 'p4', authorName: 'Phạm Minh Đức', authorRole: 'Tự kỷ chức năng cao',
    content: 'Thật ra mình cũng rất lo lắng về việc có nên tiết lộ tình trạng khuyết tật khi phỏng vấn không. Sau nhiều lần thử, mình thấy tốt nhất là nên nói thẳng và tập trung vào những gì mình làm được thay vì những gì không làm được.',
    topic: 'Tâm sự & Chia sẻ', createdAt: '2026-07-25', likeCount: 38, commentCount: 31, liked: false
  },
  {
    id: 'p5', authorName: 'Hoàng Thị Em', authorRole: 'Khiếm thị',
    content: 'Mình mới hoàn thành khóa lập trình web trên D-Shiftify. Muốn hỏi: các bạn lập trình viên NKT dùng NVDA hay JAWS? Cài thêm gì để code hiệu quả hơn không?',
    topic: 'Hướng nghiệp', createdAt: '2026-07-24', likeCount: 19, commentCount: 10, liked: false
  }
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase()

export default function DisabilityCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTopic, setActiveTopic] = useState<Topic>('Tất cả')
  const [isComposing, setIsComposing] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newTopic, setNewTopic] = useState<Topic>('Kinh nghiệm tìm việc')
  const [isPosting, setIsPosting] = useState(false)
  const composeRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    let active = true
    void (axiosClient.get('/api/v1/community/posts') as Promise<ApiEnvelope>)
      .then((res) => active && setPosts(res.data))
      .catch(() => active && setPosts(MOCK_POSTS))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [])

  const filtered = activeTopic === 'Tất cả' ? posts : posts.filter((p) => p.topic === activeTopic)

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    )
    // TODO(backend): POST/DELETE /api/v1/community/posts/:id/like
  }

  const handlePost = async () => {
    if (!newContent.trim()) return
    setIsPosting(true)
    try {
      // TODO(backend): POST /api/v1/community/posts
      const newPost: Post = {
        id: `p-${Date.now()}`,
        authorName: 'Bạn',
        authorRole: 'Thành viên',
        content: newContent.trim(),
        topic: newTopic,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        liked: false
      }
      setPosts((prev) => [newPost, ...prev])
      setNewContent('')
      setIsComposing(false)
      void speakAccessibleText('Bài viết của bạn đã được đăng thành công!')
    } catch {
      void speakAccessibleText('Không thể đăng bài. Vui lòng thử lại.')
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className='mx-auto w-full max-w-[860px] px-4 py-10 sm:px-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-balance text-3xl font-black text-[#004080] sm:text-[34px]'>Cộng đồng NKT</h1>
          <p className='mt-2 text-pretty text-[15px] leading-7 text-[#33506E]'>
            Chia sẻ kinh nghiệm tìm việc, đặt câu hỏi và kết nối với những người cùng hành trình.
          </p>
        </div>
        <button
          type='button'
          aria-label='Nghe giới thiệu trang cộng đồng'
          onClick={() => void speakAccessibleText('Trang cộng đồng NKT. Chia sẻ kinh nghiệm và đặt câu hỏi để nhận hỗ trợ từ cộng đồng.')}
          className='inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
        >
          <Volume2 className='size-5' />
        </button>
      </div>

      {/* Compose Button */}
      <button
        type='button'
        onClick={() => { setIsComposing(true); setTimeout(() => composeRef.current?.focus(), 100) }}
        className='mt-6 inline-flex w-full items-center gap-2 border border-dashed border-[#004080] bg-white px-5 py-3 text-sm font-bold text-[#004080] transition hover:bg-[#EAF4FF]'
      >
        <Plus className='size-4' aria-hidden='true' /> Đăng bài chia sẻ
      </button>

      {/* Compose Form */}
      {isComposing ? (
        <div className='mt-4 border border-[#004080] bg-white p-5 shadow-md'>
          <h2 className='mb-3 text-sm font-black text-[#004080]'>Bài viết mới</h2>
          <div className='mb-3'>
            <label htmlFor='postTopic' className='block text-xs font-bold text-[#33506E]'>Chủ đề</label>
            <select
              id='postTopic'
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value as Topic)}
              className='mt-1 w-full border border-[#CFE3F7] bg-white px-3 py-2 text-sm text-[#102033] outline-none focus:border-[#004080]'
            >
              {TOPICS.filter((t) => t !== 'Tất cả').map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <textarea
            ref={composeRef}
            rows={5}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder='Chia sẻ kinh nghiệm, đặt câu hỏi hoặc hỏi thăm cộng đồng...'
            aria-label='Nội dung bài viết'
            className='w-full resize-none border border-[#CFE3F7] bg-white px-4 py-3 text-[15px] text-[#102033] outline-none focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/20'
          />
          <div className='mt-3 flex gap-2'>
            <button
              type='button'
              disabled={isPosting || !newContent.trim()}
              onClick={handlePost}
              className='bg-[#004080] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#003466] disabled:opacity-60'
            >
              {isPosting ? 'Đang đăng...' : 'Đăng bài'}
            </button>
            <button
              type='button'
              onClick={() => { setIsComposing(false); setNewContent('') }}
              className='border border-[#CFE3F7] px-5 py-2 text-sm font-bold text-[#33506E] transition hover:border-[#004080]'
            >
              Hủy
            </button>
          </div>
        </div>
      ) : null}

      {/* Topic Filters */}
      <div className='mt-6 flex flex-wrap gap-2'>
        {TOPICS.map((topic) => (
          <button
            key={topic}
            type='button'
            onClick={() => setActiveTopic(topic)}
            aria-pressed={activeTopic === topic}
            className={cn(
              'border px-3 py-1.5 text-xs font-bold transition',
              activeTopic === topic
                ? 'border-[#004080] bg-[#004080] text-white'
                : 'border-[#CFE3F7] bg-white text-[#33506E] hover:border-[#004080]'
            )}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className='mt-6 space-y-4' aria-busy={isLoading}>
        {isLoading ? (
          <div className='py-16 text-center text-[#33506E]'>Đang tải bài viết...</div>
        ) : filtered.length === 0 ? (
          <div className='border border-dashed border-[#CFE3F7] bg-white p-12 text-center'>
            <MessageSquare className='mx-auto size-12 text-[#CFE3F7]' aria-hidden='true' />
            <p className='mt-4 font-bold text-[#33506E]'>Chưa có bài viết nào trong chủ đề này.</p>
          </div>
        ) : (
          filtered.map((post) => (
            <article
              key={post.id}
              className='border border-[#CFE3F7] bg-white p-5 shadow-sm transition hover:border-[#004080]/40'
            >
              {/* Author */}
              <div className='flex items-center gap-3'>
                <div
                  aria-hidden='true'
                  className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[#004080] text-xs font-black text-white'
                >
                  {getInitials(post.authorName)}
                </div>
                <div>
                  <p className='text-sm font-black text-[#102033]'>{post.authorName}</p>
                  <p className='text-xs text-[#5A718B]'>{post.authorRole} · {formatDate(post.createdAt)}</p>
                </div>
                <span className='ml-auto rounded-full bg-[#EAF4FF] px-2.5 py-1 text-xs font-semibold text-[#004080]'>
                  {post.topic}
                </span>
              </div>

              {/* Content */}
              <p className='mt-3 text-[15px] leading-7 text-[#102033]'>{post.content}</p>

              {/* Actions */}
              <div className='mt-4 flex items-center gap-4 border-t border-[#EAF4FF] pt-4'>
                <button
                  type='button'
                  aria-label={`${post.liked ? 'Bỏ thích' : 'Thích'} bài viết của ${post.authorName}`}
                  aria-pressed={post.liked}
                  onClick={() => void handleLike(post.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 text-sm font-bold transition',
                    post.liked ? 'text-[#004080]' : 'text-[#5A718B] hover:text-[#004080]'
                  )}
                >
                  <ThumbsUp className={cn('size-4', post.liked && 'fill-[#004080]')} aria-hidden='true' />
                  {post.likeCount}
                </button>

                <button
                  type='button'
                  aria-label={`${post.commentCount} bình luận cho bài của ${post.authorName}`}
                  onClick={() =>
                    void speakAccessibleText(`Bài của ${post.authorName}: ${post.content}. Có ${post.commentCount} bình luận.`)
                  }
                  className='inline-flex items-center gap-1.5 text-sm font-bold text-[#5A718B] transition hover:text-[#004080]'
                >
                  <MessageSquare className='size-4' aria-hidden='true' />
                  {post.commentCount}
                </button>

                <button
                  type='button'
                  aria-label={`Đọc to bài viết của ${post.authorName}`}
                  onClick={() => void speakAccessibleText(`${post.authorName} chia sẻ: ${post.content}`)}
                  className='ml-auto inline-flex size-8 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
                >
                  <Volume2 className='size-4' />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
