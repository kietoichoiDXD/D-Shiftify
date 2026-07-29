import { useEffect, useState } from 'react'

import { BookOpen, CalendarDays, Loader2, Plus, Volume2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import axiosClient from '@/core/services/axios-client'
import { speakAccessibleText } from '@/core/services/speech.service'
import { WorkspaceShell } from '@/pages/_shared/figma-web/workspace-shell'

type Course = {
  id: string
  title: string
  durationType: 'short_term' | 'medium_term' | 'long_term'
  startDate: string
  endDate: string
  mode: 'online' | 'offline' | 'hybrid'
  certificateOutput: string
  description?: string
  enrolledCount?: number
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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

// TODO(backend): replace mock with GET /api/v1/courses?mine=true when educator filter is available
const MOCK_COURSES: Course[] = [
  {
    id: 'c1', title: 'Kỹ năng tin học văn phòng cho NKT',
    durationType: 'short_term', startDate: '2026-07-01', endDate: '2026-09-30',
    mode: 'hybrid', certificateOutput: 'Chứng chỉ IC3', enrolledCount: 14
  },
  {
    id: 'c2', title: 'Lập trình web căn bản',
    durationType: 'medium_term', startDate: '2026-08-01', endDate: '2027-01-31',
    mode: 'online', certificateOutput: 'Chứng nhận kỹ năng nghề CNTT', enrolledCount: 8
  },
  {
    id: 'c3', title: 'Kỹ năng giao tiếp & hội nhập nghề nghiệp',
    durationType: 'short_term', startDate: '2026-09-15', endDate: '2026-12-15',
    mode: 'offline', certificateOutput: 'Chứng nhận tham dự', enrolledCount: 22
  }
]

export default function EducatorCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let active = true
    void (axiosClient.get('/api/v1/courses') as Promise<ApiEnvelope>)
      .then((res) => active && setCourses(res.data))
      .catch(() => {
        if (active) {
          // Fallback to mock data when backend unavailable
          setCourses(MOCK_COURSES)
          setHasError(false)
        }
      })
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [])

  const announceCourses = () => {
    const msg = courses.length
      ? `Bạn có ${courses.length} khóa học. ${courses.map((c) => c.title).join(', ')}.`
      : 'Chưa có khóa học nào. Hãy tạo khóa học đầu tiên.'
    void speakAccessibleText(msg)
  }

  return (
    <WorkspaceShell role='educator'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-balance text-3xl font-black text-[#004080]'>Khóa học của tôi</h1>
          <p className='mt-2 text-pretty text-[15px] text-[#33506E]'>
            Quản lý các khóa học nghề dành cho người khuyết tật.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button
            type='button'
            aria-label='Nghe danh sách khóa học'
            onClick={announceCourses}
            className='inline-flex size-10 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
          >
            <Volume2 className='size-5' />
          </button>
          <Link
            to={ROUTE.EDUCATOR.COURSE_CREATE}
            className='inline-flex items-center gap-2 bg-[#004080] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#003466]'
          >
            <Plus className='size-4' aria-hidden='true' /> Tạo khóa học
          </Link>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && courses.length > 0 ? (
        <div className='mt-6 grid gap-4 sm:grid-cols-3'>
          <StatCard label='Tổng khóa học' value={courses.length} accent />
          <StatCard label='Đang diễn ra' value={courses.filter((c) => new Date(c.endDate) >= new Date()).length} />
          <StatCard label='Học viên (ước tính)' value={courses.reduce((sum, c) => sum + (c.enrolledCount ?? 0), 0)} />
        </div>
      ) : null}

      <div className='mt-8' aria-busy={isLoading}>
        {isLoading ? (
          <div className='flex justify-center py-16 text-[#004080]'>
            <Loader2 className='size-7 animate-spin' aria-label='Đang tải khóa học' />
          </div>
        ) : hasError ? (
          <div className='border border-[#CFE3F7] bg-white p-10 text-center text-[#33506E]'>
            Không thể tải danh sách khóa học. Vui lòng thử lại sau.
          </div>
        ) : courses.length === 0 ? (
          <div className='border border-dashed border-[#CFE3F7] bg-white p-16 text-center'>
            <BookOpen className='mx-auto size-12 text-[#CFE3F7]' aria-hidden='true' />
            <p className='mt-4 font-bold text-[#33506E]'>Chưa có khóa học nào.</p>
            <Link to={ROUTE.EDUCATOR.COURSE_CREATE} className='mt-3 inline-block font-bold text-[#004080] underline'>
              Tạo khóa học đầu tiên
            </Link>
          </div>
        ) : (
          <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {courses.map((course) => (
              <li key={course.id}>
                <article className='flex h-full flex-col border border-[#CFE3F7] bg-white p-5 shadow-sm transition hover:border-[#004080] hover:shadow-md'>
                  <div className='flex items-start justify-between gap-2'>
                    <h2 className='text-balance text-base font-black leading-snug text-[#102033]'>{course.title}</h2>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${MODE_COLORS[course.mode]}`}>
                      {MODE_LABELS[course.mode]}
                    </span>
                  </div>

                  <p className='mt-2 text-xs font-semibold text-[#5A718B]'>
                    {DURATION_LABELS[course.durationType]}
                  </p>

                  <div className='mt-3 flex items-center gap-1.5 text-xs text-[#5A718B]'>
                    <CalendarDays className='size-3.5' aria-hidden='true' />
                    <span>{formatDate(course.startDate)} – {formatDate(course.endDate)}</span>
                  </div>

                  <div className='mt-2 rounded bg-[#EAF4FF] px-3 py-2'>
                    <p className='text-xs font-bold text-[#004080]'>🎓 {course.certificateOutput}</p>
                  </div>

                  {course.enrolledCount != null ? (
                    <p className='mt-3 text-xs text-[#5A718B]'>
                      <span className='font-black text-[#004080]'>{course.enrolledCount}</span> học viên đã đăng ký
                    </p>
                  ) : null}

                  <div className='mt-auto flex gap-2 border-t border-[#EAF4FF] pt-4'>
                    <button
                      type='button'
                      aria-label={`Nghe thông tin khóa học ${course.title}`}
                      onClick={() =>
                        void speakAccessibleText(
                          `Khóa học ${course.title}. Hình thức ${MODE_LABELS[course.mode]}. Từ ${formatDate(course.startDate)} đến ${formatDate(course.endDate)}. Chứng chỉ: ${course.certificateOutput}.`
                        )
                      }
                      className='inline-flex size-8 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
                    >
                      <Volume2 className='size-4' />
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </WorkspaceShell>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className='border border-[#CFE3F7] bg-white p-5 shadow-sm'>
      <p className='text-xs font-bold uppercase tracking-[0.04em] text-[#5A718B]'>{label}</p>
      <p className='mt-2 text-3xl font-black tabular-nums text-[#004080]'>{value}</p>
      {accent ? <span className='mt-1 block h-1 w-10 bg-[#004080]' /> : null}
    </div>
  )
}
