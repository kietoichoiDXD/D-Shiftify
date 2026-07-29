import { useMemo, useState } from 'react'

import { Volume2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import toastifyCommon from '@/core/lib/toastify-common'
import { cn } from '@/core/lib/utils'
import { speakAccessibleText } from '@/core/services/speech.service'

type NotificationItem = {
  id: string
  title: string
  snippet: string
  company: string
  unread?: boolean
  body: string[]
}

// TODO(backend): replace with the notifications API once the endpoint is wired.
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'noti-1',
    title: 'Nhà tuyển dụng A',
    snippet: 'Chào bạn, chúng tôi đã nhận được CV...',
    company: 'Doanh nghiệp A',
    unread: true,
    body: [
      'Chúng tôi rất vui được mời bạn tham gia vào đội ngũ sắp tới của chúng tôi. Đây là cơ hội để bạn đóng góp và phát triển cùng một môi trường làm việc hòa nhập, tôn trọng sự đa dạng.',
      'Mục tiêu của chúng tôi là xây dựng một quy trình làm việc minh bạch, hỗ trợ tối đa cho người lao động. Vui lòng xem xét lời mời và phản hồi để chúng tôi sắp xếp buổi trao đổi tiếp theo.',
      'Vui lòng xác nhận ý định tham gia của bạn trước cuối ngày làm việc 15 tháng này. Cảm ơn bạn!'
    ]
  },
  {
    id: 'noti-2',
    title: 'Cơ sở đào tạo B',
    snippet: 'Lịch khai giảng khóa học D-Shift đã được cập nhật...',
    company: 'Cơ sở đào tạo B',
    body: ['Khóa học mới đã sẵn sàng. Tài liệu có hỗ trợ screen reader và transcript đầy đủ.']
  },
  {
    id: 'noti-3',
    title: 'Nhà tuyển dụng B',
    snippet: 'Xác nhận tham gia buổi phỏng vấn trực tuyến...',
    company: 'Doanh nghiệp B',
    body: ['Vui lòng xác nhận khung giờ phỏng vấn trực tuyến phù hợp với bạn.']
  },
  {
    id: 'noti-4',
    title: 'Cơ sở đào tạo A',
    snippet: 'Lịch khai giảng khóa học D-Shift đã được cập nhật...',
    company: 'Cơ sở đào tạo A',
    body: ['Lịch khai giảng đã được cập nhật, vui lòng kiểm tra email của bạn.']
  }
]

export function NotificationLetterPage() {
  const [selectedId, setSelectedId] = useState(NOTIFICATIONS[0]?.id ?? '')
  const [resolved, setResolved] = useState<Record<string, 'accepted' | 'rejected'>>({})

  const selected = useMemo(() => NOTIFICATIONS.find((item) => item.id === selectedId) ?? null, [selectedId])

  const handleResolve = (status: 'accepted' | 'rejected') => {
    if (!selected) return
    setResolved((current) => ({ ...current, [selected.id]: status }))
    toastifyCommon.success(status === 'accepted' ? 'Đã chấp nhận lời mời.' : 'Đã từ chối lời mời.')
  }

  const letterSpeech = selected ? `Thư mời từ ${selected.company}. ${selected.body.join(' ')}` : ''
  const status = selected ? resolved[selected.id] : undefined

  return (
    <section className='mx-auto w-full max-w-[1280px] px-5 py-8 text-[#102033] sm:px-6'>
      <nav className='mb-6 text-[11px] font-black uppercase tracking-[0.12em] text-[#64748B]' aria-label='Breadcrumb'>
        Thông tin doanh nghiệp <span className='mx-2 text-[#CBD5E1]'>|</span>
        <span className='text-[#004080]'>Chi tiết công việc</span>
      </nav>

      <div className='grid gap-6 lg:grid-cols-[320px_1fr]'>
        <aside className='space-y-2 bg-[#EAF4FF] p-3' aria-label='Danh sách thông báo'>
          {NOTIFICATIONS.map((item) => {
            const isActive = item.id === selectedId
            return (
              <button
                key={item.id}
                type='button'
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  'flex w-full items-start gap-3 border-l-4 bg-white p-3 text-left transition',
                  isActive ? 'border-[#004080] shadow-sm' : 'border-transparent hover:border-[#CFE3F7]'
                )}
              >
                <span className='mt-0.5 size-9 shrink-0 bg-[#D9E2F0]' aria-hidden='true' />
                <span className='min-w-0 flex-1'>
                  <span className='flex items-center gap-1.5'>
                    {item.unread ? <span className='size-2 shrink-0 rounded-full bg-[#004080]' aria-hidden='true' /> : null}
                    <span className='truncate text-[13px] font-black uppercase text-[#004080]'>{item.title}</span>
                  </span>
                  <span className='mt-1 block truncate text-[12px] text-[#64748B]'>{item.snippet}</span>
                </span>
                <span
                  role='button'
                  tabIndex={0}
                  aria-label={`Đọc ${item.title}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    void speakAccessibleText(`${item.title}. ${item.snippet}`)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.stopPropagation()
                      void speakAccessibleText(`${item.title}. ${item.snippet}`)
                    }
                  }}
                  className='mt-0.5 text-[#94A3B8] hover:text-[#004080]'
                >
                  <Volume2 className='size-4' />
                </span>
              </button>
            )
          })}
        </aside>

        {selected ? (
          <article className='bg-white p-8 sm:p-10'>
            <div className='mb-6 flex items-center gap-3'>
              <h1 className='text-[34px] font-black uppercase leading-none text-[#102033]'>Thư mời!</h1>
              <button type='button' aria-label='Đọc thư mời' onClick={() => void speakAccessibleText(letterSpeech)} className='text-[#004080] hover:text-[#003466]'>
                <Volume2 className='size-5' />
              </button>
            </div>

            <h2 className='mb-4 text-[18px] font-black text-[#004080]'>{selected.company}</h2>

            <div className='space-y-4 text-[14px] leading-7 text-[#334155]'>
              {selected.body.map((paragraph, index) => (
                <p key={index} className='text-pretty'>{paragraph}</p>
              ))}
            </div>

            <div className='mt-10 grid grid-cols-2 gap-4 sm:max-w-[520px]'>
              <Button
                type='button'
                variant='outline'
                disabled={Boolean(status)}
                onClick={() => handleResolve('rejected')}
                className='h-14 rounded-none border-[#CFE3F7] text-[12px] font-black uppercase tracking-[0.12em] text-[#334155] hover:bg-[#F8FBFF] disabled:opacity-60'
              >
                {status === 'rejected' ? 'Đã từ chối' : 'Từ chối'}
              </Button>
              <Button
                type='button'
                disabled={Boolean(status)}
                onClick={() => handleResolve('accepted')}
                className='h-14 rounded-none bg-[#004080] text-[12px] font-black uppercase tracking-[0.12em] text-white hover:bg-[#003466] disabled:opacity-60'
              >
                {status === 'accepted' ? 'Đã chấp nhận' : 'Chấp nhận'}
              </Button>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  )
}
