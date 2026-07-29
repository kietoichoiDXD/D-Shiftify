import { useEffect, useMemo, useState } from 'react'

import { Brain, Filter, Loader2, RefreshCw } from 'lucide-react'

import { cn } from '@/core/lib/utils'
import axiosClient from '@/core/services/axios-client'

type EventType = 'ai_match' | 'tts' | 'stt' | 'audit_jd' | 'chat' | 'skill_gap'

type AiEvent = {
  id: string | number
  event_type: EventType
  user_id?: string
  job_id?: string
  final_score?: number
  semantic_score?: number
  compatibility_score?: number
  filtered_out?: boolean
  filtered_rate?: number
  fairness_tag?: string
  payload?: Record<string, unknown>
  created_at: string
}

type ApiEnvelope = { data: AiEvent[]; meta?: { total: number } }

const EVENT_META: Record<EventType, { label: string; color: string; bg: string; icon: string }> = {
  ai_match:  { label: 'AI Match',    color: 'text-blue-700',    bg: 'bg-blue-100',   icon: '🤖' },
  tts:       { label: 'TTS',         color: 'text-violet-700',  bg: 'bg-violet-100', icon: '🔊' },
  stt:       { label: 'STT',         color: 'text-sky-700',     bg: 'bg-sky-100',    icon: '🎤' },
  audit_jd:  { label: 'Audit JD',    color: 'text-amber-700',   bg: 'bg-amber-100',  icon: '📋' },
  chat:      { label: 'AI Chat',     color: 'text-emerald-700', bg: 'bg-emerald-100', icon: '💬' },
  skill_gap: { label: 'Skill Gap',   color: 'text-rose-700',    bg: 'bg-rose-100',   icon: '📊' }
}

// TODO(backend): replace with GET /api/v1/admin/ai-logs from ai_observability_events table
const MOCK_EVENTS: AiEvent[] = [
  { id: 1, event_type: 'ai_match', user_id: 'u-abc123', job_id: 'j-def456', final_score: 82, semantic_score: 0.78, compatibility_score: 0.85, filtered_out: false, fairness_tag: 'inclusive', created_at: '2026-07-29T14:32:00Z' },
  { id: 2, event_type: 'tts', user_id: 'u-xyz789', payload: { text_length: 240, voice: 'vi-VN-Wavenet-A' }, created_at: '2026-07-29T14:28:00Z' },
  { id: 3, event_type: 'stt', user_id: 'u-abc123', payload: { duration_sec: 12, language: 'vi-VN' }, created_at: '2026-07-29T14:25:00Z' },
  { id: 4, event_type: 'audit_jd', user_id: 'u-emp001', payload: { score: 42, grade: 'D', issues_count: 6 }, created_at: '2026-07-29T13:50:00Z' },
  { id: 5, event_type: 'ai_match', user_id: 'u-cnd002', job_id: 'j-ghi789', final_score: 91, semantic_score: 0.92, compatibility_score: 0.89, filtered_out: false, fairness_tag: 'inclusive', created_at: '2026-07-29T13:45:00Z' },
  { id: 6, event_type: 'chat', user_id: 'u-cnd003', payload: { intent: 'job_search', tokens: 512 }, created_at: '2026-07-29T13:40:00Z' },
  { id: 7, event_type: 'ai_match', user_id: 'u-cnd004', job_id: 'j-jkl000', final_score: 55, filtered_out: true, filtered_rate: 0.3, fairness_tag: 'filtered', created_at: '2026-07-29T13:35:00Z' },
  { id: 8, event_type: 'skill_gap', user_id: 'u-cnd005', job_id: 'j-mno111', payload: { gaps: ['React', 'TypeScript'] }, created_at: '2026-07-29T13:30:00Z' },
  { id: 9, event_type: 'tts', user_id: 'u-xyz789', payload: { text_length: 80, voice: 'vi-VN-Standard-B' }, created_at: '2026-07-29T13:20:00Z' },
  { id: 10, event_type: 'stt', user_id: 'u-cnd002', payload: { duration_sec: 8, language: 'vi-VN' }, created_at: '2026-07-29T13:10:00Z' }
]

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const truncate = (s: string | undefined, n = 20) => (s && s.length > n ? s.slice(0, n) + '...' : s ?? '—')

export default function AdminAiLogsPage() {
  const [events, setEvents] = useState<AiEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all')

  const fetchEvents = async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    try {
      const res = (await axiosClient.get('/api/v1/admin/ai-logs', { params: { page: 1, limit: 100 } })) as ApiEnvelope
      setEvents(res.data)
    } catch {
      setEvents(MOCK_EVENTS)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchEvents()
  }, [])

  const filtered = useMemo(
    () => (typeFilter === 'all' ? events : events.filter((e) => e.event_type === typeFilter)),
    [events, typeFilter]
  )

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: events.length }
    for (const type of Object.keys(EVENT_META) as EventType[]) {
      result[type] = events.filter((e) => e.event_type === type).length
    }
    return result
  }, [events])

  const avgMatchScore = useMemo(() => {
    const matchEvents = events.filter((e) => e.event_type === 'ai_match' && e.final_score != null)
    if (!matchEvents.length) return null
    return Math.round(matchEvents.reduce((sum, e) => sum + (e.final_score ?? 0), 0) / matchEvents.length)
  }, [events])

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-end justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-black text-slate-800'>Nhật ký AI</h1>
          <p className='mt-1 text-[15px] text-slate-500'>
            Theo dõi các sự kiện Gemini AI, TTS, STT và AI Match trong hệ thống.
          </p>
        </div>
        <button
          type='button'
          onClick={() => void fetchEvents(true)}
          disabled={isRefreshing}
          className='inline-flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-400 disabled:opacity-50'
        >
          <RefreshCw className={cn('size-4', isRefreshing && 'animate-spin')} aria-hidden='true' />
          Làm mới
        </button>
      </div>

      {/* Summary Cards */}
      {!isLoading ? (
        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          <SummaryCard label='Tổng sự kiện' value={counts.all} icon='📡' color='bg-slate-100' />
          <SummaryCard label='AI Match' value={counts.ai_match} icon='🤖' color='bg-blue-50' />
          <SummaryCard label='TTS + STT' value={(counts.tts ?? 0) + (counts.stt ?? 0)} icon='🔊' color='bg-violet-50' />
          {avgMatchScore != null ? (
            <SummaryCard label='Điểm Match TB' value={avgMatchScore} suffix='/100' icon='📊' color='bg-emerald-50' />
          ) : (
            <SummaryCard label='Audit JD' value={counts.audit_jd ?? 0} icon='📋' color='bg-amber-50' />
          )}
        </div>
      ) : null}

      {/* Event Type Filter */}
      <div className='flex flex-wrap gap-2'>
        <button
          type='button'
          onClick={() => setTypeFilter('all')}
          className={cn(
            'inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold transition',
            typeFilter === 'all'
              ? 'border-slate-800 bg-slate-800 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
          )}
        >
          <Filter className='size-3' /> Tất cả ({counts.all})
        </button>
        {(Object.keys(EVENT_META) as EventType[]).map((type) => {
          const meta = EVENT_META[type]
          return (
            <button
              key={type}
              type='button'
              onClick={() => setTypeFilter(type)}
              className={cn(
                'inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-bold transition',
                typeFilter === type
                  ? `border-slate-800 bg-slate-800 text-white`
                  : `border-slate-200 bg-white ${meta.color} hover:border-slate-400`
              )}
            >
              {meta.icon} {meta.label} ({counts[type] ?? 0})
            </button>
          )
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className='flex justify-center py-20'>
          <Loader2 className='size-8 animate-spin text-slate-300' />
        </div>
      ) : (
        <div className='overflow-hidden border border-slate-200 bg-white shadow-sm'>
          <div className='border-b border-slate-100 px-5 py-3'>
            <p className='text-sm text-slate-500'>
              Hiển thị <span className='font-black text-slate-800'>{filtered.length}</span> sự kiện
            </p>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50'>
                  {['ID', 'Loại', 'User ID', 'Job ID', 'Score', 'Fairness', 'Thời gian'].map((h) => (
                    <th key={h} className='px-5 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500'>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='px-5 py-10 text-center font-semibold text-slate-400'>
                      Không có sự kiện nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((event) => {
                    const meta = EVENT_META[event.event_type]
                    return (
                      <tr key={event.id} className='hover:bg-slate-50'>
                        <td className='px-5 py-3 font-mono text-xs text-slate-400'>#{event.id}</td>
                        <td className='px-5 py-3'>
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', meta.bg, meta.color)}>
                            {meta.icon} {meta.label}
                          </span>
                        </td>
                        <td className='px-5 py-3 font-mono text-xs text-slate-500'>{truncate(event.user_id, 14)}</td>
                        <td className='px-5 py-3 font-mono text-xs text-slate-500'>{truncate(event.job_id, 14)}</td>
                        <td className='px-5 py-3'>
                          {event.final_score != null ? (
                            <span className={cn(
                              'font-black tabular-nums',
                              event.final_score >= 80 ? 'text-emerald-600' :
                              event.final_score >= 60 ? 'text-amber-600' : 'text-rose-600'
                            )}>
                              {event.final_score}
                            </span>
                          ) : (
                            event.payload ? (
                              <span className='text-xs text-slate-400 font-mono'>
                                {JSON.stringify(event.payload).slice(0, 30)}...
                              </span>
                            ) : <span className='text-slate-300'>—</span>
                          )}
                        </td>
                        <td className='px-5 py-3'>
                          {event.fairness_tag ? (
                            <span className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-bold',
                              event.fairness_tag === 'inclusive' ? 'bg-emerald-100 text-emerald-700' :
                              event.fairness_tag === 'filtered' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                            )}>
                              {event.fairness_tag}
                            </span>
                          ) : (
                            <span className='text-slate-300'>—</span>
                          )}
                        </td>
                        <td className='px-5 py-3 text-xs text-slate-500'>{formatDateTime(event.created_at)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label, value, icon, color, suffix
}: { label: string; value: number; icon: string; color: string; suffix?: string }) {
  return (
    <div className={cn('rounded-lg border border-slate-200 p-4', color)}>
      <div className='flex items-center gap-2'>
        <span aria-hidden='true' className='text-xl'>{icon}</span>
        <p className='text-xs font-bold uppercase tracking-wide text-slate-600'>{label}</p>
      </div>
      <p className='mt-2 text-2xl font-black tabular-nums text-slate-800'>
        {value.toLocaleString('vi-VN')}{suffix}
      </p>
    </div>
  )
}
