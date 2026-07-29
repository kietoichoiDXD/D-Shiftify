import { useEffect, useState } from 'react'

import { BookOpen, CalendarDays, Loader2, MapPin, Search, Volume2 } from 'lucide-react'

import { cn } from '@/core/lib/utils'
import axiosClient from '@/core/services/axios-client'
import { speakAccessibleText } from '@/core/services/speech.service'

type Course = {
  id: string
  title: string
  center: string
  centerAddress?: string
  durationType: 'short_term' | 'medium_term' | 'long_term'
  startDate: string
  endDate: string
  mode: 'online' | 'offline' | 'hybrid'
  certificateOutput: string
  description?: string
  enrolledCount?: number
  supportForDisabled?: boolean
}

type ApiEnvelope = { data: Course[]; meta?: { total: number } }

const DURATION_LABELS: Record<Course['durationType'], string> = {
  short_term: 'Ngắn hạn',
  medium_term: 'Trung hạn',
  long_term: 'Dài hạn'
}

const MODE_LABELS: Record<Course['mode'], string> = {
  online: 'Trực tuyến',
  offline: 'Trực tiếp',
  hybrid: 'Kết hợp'
}

const MODE_COLORS: Record<Course['mode'], string> = {
  online: 'bg-sky-100 text-sky-700',
  offline: 'bg-amber-100 text-amber-700',
  hybrid: 'bg-emerald-100 text-emerald-700'
}

// TODO(backend): replace with GET /api/v1/courses when backend is wired
const MOCK_COURSES: Course[] = [
  {
    id: 'c1', title: 'Kỹ năng tin học văn phòng cho NKT',
    center: 'Trung tâm Dạy nghề Hòa nhập Hà Nội',
    centerAddress: 'Hà Nội',
    durationType: 'short_term', startDate: '2026-08-01', endDate: '2026-10-31',
    mode: 'hybrid', certificateOutput: 'Chứng chỉ IC3',
    description: 'Khóa học kỹ năng sử dụng máy tính cơ bản, phù hợp cho người khiếm thị và khiếm thính.',
    enrolledCount: 14, supportForDisabled: true
  },
  {
    id: 'c2', title: 'Lập trình web căn bản',
    center: 'Trường Cao đẳng CNTT TP.HCM',
    centerAddress: 'TP. Hồ Chí Minh',
    durationType: 'medium_term', startDate: '2026-09-01', endDate: '2027-02-28',
    mode: 'online', certificateOutput: 'Chứng nhận kỹ năng nghề CNTT',
    description: 'Học HTML, CSS, JavaScript căn bản. Giảng viên có kinh nghiệm hỗ trợ NKT.',
    enrolledCount: 8, supportForDisabled: true
  },
  {
    id: 'c3', title: 'Kỹ năng giao tiếp & hội nhập nghề nghiệp',
    center: 'Tổ chức Việc làm NKT Việt Nam',
    centerAddress: 'Đà Nẵng',
    durationType: 'short_term', startDate: '2026-09-15', endDate: '2026-11-30',
    mode: 'offline', certificateOutput: 'Chứng nhận tham dự',
    description: 'Phát triển kỹ năng giao tiếp, phỏng vấn và thích nghi với môi trường công sở hòa nhập.',
    enrolledCount: 22, supportForDisabled: true
  },
  {
    id: 'c4', title: 'Thiết kế đồ họa cơ bản',
    center: 'Trung tâm Đào tạo Sáng tạo Hội An',
    centerAddress: 'Hội An, Quảng Nam',
    durationType: 'medium_term', startDate: '2026-10-01', endDate: '2027-03-31',
    mode: 'hybrid', certificateOutput: 'Chứng chỉ Adobe Associate',
    description: 'Photoshop, Illustrator, Canva. Hỗ trợ thiết bị trợ năng và phiên dịch ngôn ngữ ký hiệu.',
    enrolledCount: 11, supportForDisabled: true
  }
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function DisabilityCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modeFilter, setModeFilter] = useState<Course['mode'] | 'all'>('all')

  useEffect(() => {
    let active = true
    void (axiosClient.get('/api/v1/courses') as Promise<ApiEnvelope>)
      .then((res) => active && setCourses(res.data))
      .catch(() => active && setCourses(MOCK_COURSES))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [])

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.center.toLowerCase().includes(search.toLowerCase())
    const matchMode = modeFilter === 'all' || c.mode === modeFilter
    return matchSearch && matchMode
  })

  const announceSearch = () => {
    const msg = filtered.length
      ? `Tìm thấy ${filtered.length} khóa học. ${filtered.map((c) => c.title).join(', ')}.`
      : 'Không tìm thấy khóa học phù hợp.'
    void speakAccessibleText(msg)
  }

  return (
    <div className='mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-balance text-3xl font-black text-[#004080] sm:text-[34px]'>Khóa học hòa nhập</h1>
          <p className='mt-2 text-pretty text-[15px] leading-7 text-[#33506E]'>
            Các khóa đào tạo nghề và kỹ năng dành riêng cho người khuyết tật, có hỗ trợ thiết bị trợ năng.
          </p>
        </div>
        <button
          type='button'
          aria-label='Nghe giới thiệu trang khóa học'
          onClick={() => void speakAccessibleText('Trang khóa học hòa nhập. Chọn khóa học phù hợp với nhu cầu của bạn.')}
          className='inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
        >
          <Volume2 className='size-5' />
        </button>
      </div>

      {/* Search & Filter */}
      <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative flex-1'>
          <Search className='absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#5A718B]' aria-hidden='true' />
          <input
            type='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && announceSearch()}
            placeholder='Tìm theo tên khóa học hoặc trung tâm...'
            aria-label='Tìm kiếm khóa học'
            className='w-full border border-[#CFE3F7] bg-white py-3 pl-10 pr-4 text-sm text-[#102033] outline-none transition focus:border-[#004080] focus:ring-2 focus:ring-[#004080]/20'
          />
        </div>
        <div className='flex gap-2'>
          {(['all', 'online', 'offline', 'hybrid'] as const).map((m) => (
            <button
              key={m}
              type='button'
              onClick={() => setModeFilter(m)}
              aria-pressed={modeFilter === m}
              className={cn(
                'border px-3 py-2 text-xs font-bold transition',
                modeFilter === m
                  ? 'border-[#004080] bg-[#004080] text-white'
                  : 'border-[#CFE3F7] bg-white text-[#33506E] hover:border-[#004080]'
              )}
            >
              {m === 'all' ? 'Tất cả' : MODE_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className='mt-4 text-sm text-[#5A718B]'>
          Hiển thị <span className='font-bold text-[#004080]'>{filtered.length}</span> khóa học
        </p>
      )}

      {/* Grid */}
      <div className='mt-4' aria-busy={isLoading}>
        {isLoading ? (
          <div className='flex justify-center py-16 text-[#004080]'>
            <Loader2 className='size-7 animate-spin' aria-label='Đang tải khóa học' />
          </div>
        ) : filtered.length === 0 ? (
          <div className='border border-dashed border-[#CFE3F7] bg-white p-14 text-center'>
            <BookOpen className='mx-auto size-12 text-[#CFE3F7]' aria-hidden='true' />
            <p className='mt-4 font-bold text-[#33506E]'>Không tìm thấy khóa học phù hợp.</p>
            <button
              type='button'
              onClick={() => { setSearch(''); setModeFilter('all') }}
              className='mt-2 text-sm font-bold text-[#004080] underline'
            >
              Xem tất cả khóa học
            </button>
          </div>
        ) : (
          <ul className='grid gap-4 md:grid-cols-2'>
            {filtered.map((course) => (
              <li key={course.id}>
                <article className='flex h-full flex-col border border-[#CFE3F7] bg-white p-5 shadow-sm transition hover:border-[#004080] hover:shadow-md'>
                  <div className='flex items-start justify-between gap-2'>
                    <h2 className='text-balance text-base font-black leading-snug text-[#102033]'>{course.title}</h2>
                    <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-bold', MODE_COLORS[course.mode])}>
                      {MODE_LABELS[course.mode]}
                    </span>
                  </div>

                  <p className='mt-2 font-semibold text-sm text-[#004080]'>{course.center}</p>

                  {course.centerAddress ? (
                    <p className='mt-1 inline-flex items-center gap-1 text-xs text-[#5A718B]'>
                      <MapPin className='size-3' aria-hidden='true' /> {course.centerAddress}
                    </p>
                  ) : null}

                  {course.description ? (
                    <p className='mt-3 text-sm leading-6 text-[#33506E] line-clamp-2'>{course.description}</p>
                  ) : null}

                  <div className='mt-3 flex items-center gap-1.5 text-xs text-[#5A718B]'>
                    <CalendarDays className='size-3.5' aria-hidden='true' />
                    {formatDate(course.startDate)} – {formatDate(course.endDate)}
                    <span className='text-[#CFE3F7]'>·</span>
                    {DURATION_LABELS[course.durationType]}
                  </div>

                  <div className='mt-3 rounded bg-[#EAF4FF] px-3 py-2'>
                    <p className='text-xs font-bold text-[#004080]'>🎓 {course.certificateOutput}</p>
                  </div>

                  {course.supportForDisabled ? (
                    <p className='mt-2 text-xs font-bold text-emerald-600'>♿ Hỗ trợ thiết bị trợ năng</p>
                  ) : null}

                  <div className='mt-auto flex items-center justify-between border-t border-[#EAF4FF] pt-4'>
                    {course.enrolledCount != null ? (
                      <p className='text-xs text-[#5A718B]'>
                        <span className='font-black text-[#004080]'>{course.enrolledCount}</span> học viên đã đăng ký
                      </p>
                    ) : <span />}

                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        aria-label={`Nghe thông tin khóa học ${course.title}`}
                        onClick={() =>
                          void speakAccessibleText(
                            `Khóa học ${course.title} tại ${course.center}. Hình thức ${MODE_LABELS[course.mode]}. Từ ${formatDate(course.startDate)} đến ${formatDate(course.endDate)}. Chứng chỉ: ${course.certificateOutput}.`
                          )
                        }
                        className='inline-flex size-8 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
                      >
                        <Volume2 className='size-4' />
                      </button>
                      <button
                        type='button'
                        onClick={() =>
                          void speakAccessibleText(`Đã ghi danh khóa học ${course.title}. Chúng tôi sẽ liên hệ sớm.`)
                        }
                        className='bg-[#004080] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#003466]'
                      >
                        Đăng ký học
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
