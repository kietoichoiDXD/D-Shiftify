import { useMemo, useState } from 'react'

import { ChevronLeft, ChevronRight, Search, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/core/lib/utils'
import { speakAccessibleText } from '@/core/services/speech.service'
import { WorkspaceShell } from '@/pages/_shared/figma-web/workspace-shell'

type Candidate = {
  id: string
  name: string
  title: string
  mode: string
  salary: string
  birthday: string
  phone: string
  summary: string
  score: number
}

// TODO(backend): replace with the applied/recommended candidates API.
const CANDIDATES: Candidate[] = [
  {
    id: 'tran-van-a',
    name: 'Trần Văn A',
    title: 'Senior Backend Developer',
    mode: 'Remote',
    salary: '$3,000+',
    birthday: '12/3/2000',
    phone: '093######',
    summary: 'Chuyên gia hệ thống phân tán với hơn 8 năm kinh nghiệm tại các tập đoàn đa quốc gia. Thành thạo Go, Rust, và kiến trúc Microservices.',
    score: 98
  },
  {
    id: 'le-thi-b',
    name: 'Lê Thị B',
    title: 'Fullstack Developer',
    mode: 'Hybrid',
    salary: '$2,800+',
    birthday: '05/08/1998',
    phone: '098######',
    summary: 'Hơn 5 năm kinh nghiệm phát triển ứng dụng web hiện đại sử dụng React, Node.js và AWS. Đam mê tối ưu hóa trải nghiệm người dùng.',
    score: 94
  },
  {
    id: 'nguyen-van-c',
    name: 'Nguyễn Văn C',
    title: 'Cloud Architect',
    mode: 'Onsite',
    salary: '$4,200+',
    birthday: '22/11/1995',
    phone: '091######',
    summary: 'Chuyên gia về giải pháp đám mây với chứng chỉ AWS Solution Architect. Đã dẫn dắt nhiều dự án di chuyển hạ tầng lên Cloud quy mô lớn.',
    score: 92
  }
]

const scoreFilters = ['Trên 90%', '60% - 80%', 'Trên 50%']
const timeFilters = ['24 giờ qua', '7 ngày qua', 'Tháng này']

function FilterGroup({ title, options }: { title: string; options: string[] }) {
  return (
    <div className='border-b border-[#E3E8F0] pb-5'>
      <div className='mb-3 flex items-center gap-2'>
        <h3 className='text-[12px] font-black uppercase tracking-[0.04em] text-[#004080]'>{title}</h3>
        <button type='button' aria-label={`Đọc ${title}`} onClick={() => void speakAccessibleText(title)} className='text-[#94A3B8] hover:text-[#004080]'>
          <Volume2 className='size-3.5' />
        </button>
      </div>
      <div className='space-y-2'>
        {options.map((option) => (
          <label key={option} className='flex cursor-pointer items-center gap-2 text-[13px] text-[#334155]'>
            <input type='checkbox' className='size-4 rounded-sm border-[#CFE3F7] text-[#004080] focus:ring-[#004080]' />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}

export function CandidateListPage({ defaultTab = 'applied' }: { defaultTab?: 'applied' | 'suggested' } = {}) {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'applied' | 'suggested'>(defaultTab)
  const [page, setPage] = useState(1)

  const candidates = useMemo(() => CANDIDATES, [])

  return (
    <WorkspaceShell role='business' className='py-8'>
      <div className='grid gap-8 lg:grid-cols-[220px_1fr]'>
        <aside className='space-y-5' aria-label='Bộ lọc ứng viên'>
          <FilterGroup title='Điểm số' options={scoreFilters} />
          <FilterGroup title='Thời gian' options={timeFilters} />
          <div>
            <div className='mb-2 flex items-center gap-2'>
              <h3 className='text-[12px] font-black uppercase tracking-[0.04em] text-[#004080]'>Tên công việc</h3>
            </div>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]' aria-hidden='true' />
              <input
                placeholder='Tìm kiếm vị trí...'
                className='h-10 w-full border border-[#CFE3F7] bg-white pl-9 pr-3 text-[13px] outline-none focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/10'
              />
            </div>
          </div>
        </aside>

        <div>
          <div className='mb-6 flex items-center gap-7 border-b border-[#E3E8F0]'>
            {[
              { key: 'applied' as const, label: 'Ứng viên ứng tuyển' },
              { key: 'suggested' as const, label: 'Gợi ý ứng viên' }
            ].map((item) => (
              <button
                key={item.key}
                type='button'
                onClick={() => setTab(item.key)}
                className={cn(
                  'border-b-2 border-transparent pb-3 text-[13px] font-bold uppercase tracking-[0.04em] text-[#64748B] transition',
                  tab === item.key && 'border-[#004080] text-[#004080]'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className='space-y-4'>
            {candidates.map((candidate) => (
              <article key={candidate.id} className='border border-[#E3E8F0] bg-white p-5 shadow-sm sm:p-6'>
                <div className='flex flex-col gap-4 md:flex-row'>
                  <div className='size-[68px] shrink-0 bg-[#EDF2F9]' aria-hidden='true' />
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h2 className='text-[16px] font-black uppercase text-[#102033]'>{candidate.name}</h2>
                      <span className='bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700'>{candidate.mode}</span>
                      <span className='bg-[#EAF4FF] px-2 py-0.5 text-[10px] font-black text-[#004080]'>{candidate.salary}</span>
                    </div>
                    <p className='mt-1 text-[13px] font-bold uppercase text-[#334155]'>{candidate.title}</p>
                    <p className='mt-1 text-[11px] text-[#94A3B8]'>
                      Ngày sinh: {candidate.birthday} &nbsp; Phone: {candidate.phone}
                    </p>
                    <p className='mt-2 text-pretty text-[13px] leading-6 text-[#64748B]'>{candidate.summary}</p>
                  </div>
                  <div className='flex shrink-0 flex-col items-end gap-3'>
                    <span className='inline-flex items-center gap-1.5 bg-emerald-600 px-3 py-1.5 text-[11px] font-black uppercase text-white'>
                      <Volume2 className='size-3.5' aria-hidden='true' />
                      {candidate.score}% phù hợp
                    </span>
                    <Button
                      type='button'
                      onClick={() => navigate(`/business/candidates/${candidate.id}`)}
                      className='h-10 min-w-[120px] rounded-none bg-black text-[11px] font-black uppercase tracking-[0.08em] text-white hover:bg-slate-800'
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <nav className='mt-8 flex items-center justify-end gap-2' aria-label='Phân trang'>
            <Button type='button' variant='outline' size='icon' className='size-9 rounded-none border-[#CFE3F7]' aria-label='Trang trước' disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className='size-4' />
            </Button>
            {[1, 2, 3].map((item) => (
              <Button
                key={item}
                type='button'
                variant={item === page ? 'default' : 'outline'}
                onClick={() => setPage(item)}
                aria-current={item === page ? 'page' : undefined}
                className={cn('size-9 rounded-none p-0 tabular-nums', item === page ? 'bg-[#004080] text-white' : 'border-[#CFE3F7]')}
              >
                {item}
              </Button>
            ))}
            <span className='px-1 text-[#94A3B8]'>…</span>
            <Button type='button' variant='outline' className='size-9 rounded-none border-[#CFE3F7] p-0 tabular-nums' onClick={() => setPage(12)}>12</Button>
            <Button type='button' variant='outline' size='icon' className='size-9 rounded-none border-[#CFE3F7]' aria-label='Trang sau' onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className='size-4' />
            </Button>
          </nav>
        </div>
      </div>
    </WorkspaceShell>
  )
}
