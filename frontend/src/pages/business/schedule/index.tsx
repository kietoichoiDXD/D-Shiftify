import { useMemo } from 'react'

import { Clock, MapPin, Video } from 'lucide-react'

import { WorkspaceShell } from '@/pages/_shared/figma-web/workspace-shell'

type ScheduleEvent = {
  id: string
  title: string
  candidate: string
  date: string
  time: string
  mode: 'online' | 'onsite'
}

// TODO(backend): replace with GET /api/v1/schedule once the endpoint is wired.
const MOCK_EVENTS: ScheduleEvent[] = [
  { id: 's1', title: 'Phỏng vấn vòng kỹ thuật', candidate: 'Trần Văn A', date: '2026-06-30', time: '09:30', mode: 'online' },
  { id: 's2', title: 'Trao đổi văn hóa doanh nghiệp', candidate: 'Lê Thị B', date: '2026-06-30', time: '14:00', mode: 'onsite' },
  { id: 's3', title: 'Phỏng vấn vòng cuối', candidate: 'Nguyễn Văn C', date: '2026-07-02', time: '10:00', mode: 'online' }
]

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })

export default function BusinessSchedulePage() {
  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>()
    for (const event of MOCK_EVENTS) {
      const list = map.get(event.date) ?? []
      list.push(event)
      map.set(event.date, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [])

  return (
    <WorkspaceShell role='business'>
      <h1 className='text-balance text-3xl font-black text-[#004080]'>Lịch trình</h1>
      <p className='mt-2 text-pretty text-[15px] text-[#33506E]'>Lịch phỏng vấn, cuộc gọi và sự kiện tuyển dụng sắp tới.</p>

      <div className='mt-8 space-y-8'>
        {grouped.map(([date, events]) => (
          <section key={date}>
            <h2 className='text-sm font-black uppercase tracking-[0.06em] text-[#004080]'>{formatDay(date)}</h2>
            <ul className='mt-3 space-y-3'>
              {events.map((event) => (
                <li key={event.id}>
                  <article className='flex flex-col gap-3 border border-[#CFE3F7] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                      <h3 className='text-balance text-lg font-black text-[#102033]'>{event.title}</h3>
                      <p className='mt-1 text-sm font-medium text-[#5A718B]'>Ứng viên: {event.candidate}</p>
                    </div>
                    <div className='flex flex-wrap items-center gap-4 text-sm font-semibold text-[#004080]'>
                      <span className='inline-flex items-center gap-1.5'>
                        <Clock className='size-4' aria-hidden='true' /> {event.time}
                      </span>
                      <span className='inline-flex items-center gap-1.5'>
                        {event.mode === 'online' ? <Video className='size-4' aria-hidden='true' /> : <MapPin className='size-4' aria-hidden='true' />}
                        {event.mode === 'online' ? 'Trực tuyến' : 'Tại văn phòng'}
                      </span>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </WorkspaceShell>
  )
}
