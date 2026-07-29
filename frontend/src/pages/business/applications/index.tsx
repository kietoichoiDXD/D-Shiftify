import { useEffect, useMemo, useState } from 'react'

import { CalendarDays, Check, ChevronDown, Loader2, Volume2, X } from 'lucide-react'

import { cn } from '@/core/lib/utils'
import axiosClient from '@/core/services/axios-client'
import { speakAccessibleText } from '@/core/services/speech.service'
import { WorkspaceShell } from '@/pages/_shared/figma-web/workspace-shell'

type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected'

type Application = {
  id: string
  jobTitle: string
  jobId: string
  candidateName: string
  candidateEmail: string
  appliedAt: string
  status: ApplicationStatus
  cvId?: string
}

type ApiEnvelope = {
  data: Application[]
  meta?: { total: number; page: number }
}

const STATUS_META: Record<ApplicationStatus, { label: string; className: string; nextActions?: ApplicationStatus[] }> = {
  pending:   { label: 'Chờ xử lý',      className: 'bg-slate-100 text-slate-700',     nextActions: ['reviewing', 'rejected'] },
  reviewing: { label: 'Đang xem xét',   className: 'bg-[#EAF4FF] text-[#004080]',    nextActions: ['interview', 'rejected'] },
  interview: { label: 'Mời phỏng vấn',  className: 'bg-amber-100 text-amber-800',    nextActions: ['accepted', 'rejected'] },
  accepted:  { label: 'Chấp nhận',      className: 'bg-emerald-100 text-emerald-800', nextActions: [] },
  rejected:  { label: 'Từ chối',        className: 'bg-rose-100 text-rose-700',       nextActions: [] }
}

const ACTION_LABELS: Record<ApplicationStatus, string> = {
  pending:   '',
  reviewing: 'Chuyển sang Xem xét',
  interview: 'Mời phỏng vấn',
  accepted:  'Chấp nhận',
  rejected:  'Từ chối'
}

const FILTERS: Array<{ key: ApplicationStatus | 'all'; label: string }> = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'pending',   label: 'Chờ xử lý' },
  { key: 'reviewing', label: 'Đang xem xét' },
  { key: 'interview', label: 'Mời phỏng vấn' },
  { key: 'accepted',  label: 'Đã nhận' },
  { key: 'rejected',  label: 'Từ chối' }
]

// TODO(backend): replace with real data from GET /api/v1/applications
const MOCK: Application[] = [
  { id: 'app1', jobTitle: 'Lập trình viên Frontend', jobId: 'j1', candidateName: 'Nguyễn Văn A', candidateEmail: 'nva@mail.com', appliedAt: '2026-07-20', status: 'pending' },
  { id: 'app2', jobTitle: 'Nhân viên dữ liệu', jobId: 'j2', candidateName: 'Trần Thị B', candidateEmail: 'ttb@mail.com', appliedAt: '2026-07-18', status: 'reviewing' },
  { id: 'app3', jobTitle: 'Lập trình viên Frontend', jobId: 'j1', candidateName: 'Lê Văn C', candidateEmail: 'lvc@mail.com', appliedAt: '2026-07-15', status: 'interview' },
  { id: 'app4', jobTitle: 'Nhân viên dữ liệu', jobId: 'j2', candidateName: 'Phạm Thị D', candidateEmail: 'ptd@mail.com', appliedAt: '2026-07-10', status: 'accepted' },
  { id: 'app5', jobTitle: 'Lập trình viên Frontend', jobId: 'j1', candidateName: 'Hoàng Văn E', candidateEmail: 'hve@mail.com', appliedAt: '2026-07-08', status: 'rejected' }
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function BusinessApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void (axiosClient.get('/api/v1/applications', { params: { page: 1, limit: 50 } }) as Promise<ApiEnvelope>)
      .then((res) => active && setApplications(res.data))
      .catch(() => active && setApplications(MOCK))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [])

  const displayed = useMemo(
    () => (filter === 'all' ? applications : applications.filter((a) => a.status === filter)),
    [applications, filter]
  )

  const updateStatus = async (id: string, newStatus: ApplicationStatus) => {
    setUpdatingId(id)
    setOpenMenuId(null)
    try {
      // TODO(backend): PATCH /api/v1/applications/:id  { status: newStatus }
      await axiosClient.patch(`/api/v1/applications/${id}`, { status: newStatus })
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))
      void speakAccessibleText(`Đã cập nhật trạng thái thành ${STATUS_META[newStatus].label}`)
    } catch {
      void speakAccessibleText('Không thể cập nhật trạng thái. Vui lòng thử lại.')
    } finally {
      setUpdatingId(null)
    }
  }

  const counts = useMemo(
    () => ({
      all: applications.length,
      pending: applications.filter((a) => a.status === 'pending').length,
      reviewing: applications.filter((a) => a.status === 'reviewing').length,
      interview: applications.filter((a) => a.status === 'interview').length,
      accepted: applications.filter((a) => a.status === 'accepted').length,
      rejected: applications.filter((a) => a.status === 'rejected').length
    }),
    [applications]
  )

  return (
    <WorkspaceShell role='business'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-balance text-3xl font-black text-[#004080]'>Quản lý đơn ứng tuyển</h1>
          <p className='mt-2 text-pretty text-[15px] text-[#33506E]'>
            Xem và xử lý tất cả đơn ứng tuyển từ các ứng viên NKT.
          </p>
        </div>
        <button
          type='button'
          aria-label='Nghe tổng quan đơn ứng tuyển'
          onClick={() =>
            void speakAccessibleText(
              `Tổng ${counts.all} đơn. Chờ xử lý: ${counts.pending}. Đang xem xét: ${counts.reviewing}. Mời phỏng vấn: ${counts.interview}.`
            )
          }
          className='inline-flex size-10 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
        >
          <Volume2 className='size-5' />
        </button>
      </div>

      {/* Stats row */}
      {!isLoading ? (
        <div className='mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5'>
          {FILTERS.filter((f) => f.key !== 'all').map((f) => (
            <button
              key={f.key}
              type='button'
              onClick={() => setFilter(f.key)}
              className={cn(
                'flex flex-col items-start border p-3 text-left transition',
                filter === f.key ? 'border-[#004080] bg-[#EAF4FF]' : 'border-[#CFE3F7] bg-white hover:border-[#004080]'
              )}
            >
              <span className='text-2xl font-black tabular-nums text-[#004080]'>{counts[f.key]}</span>
              <span className='mt-0.5 text-xs font-semibold text-[#5A718B]'>{f.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Filter tabs */}
      <div className='mt-6 flex flex-wrap gap-2'>
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type='button'
            onClick={() => setFilter(item.key)}
            aria-pressed={filter === item.key}
            className={cn(
              'border px-4 py-2 text-sm font-bold transition',
              filter === item.key
                ? 'border-[#004080] bg-[#004080] text-white'
                : 'border-[#CFE3F7] bg-white text-[#33506E] hover:border-[#004080]'
            )}
          >
            {item.label}
            {item.key !== 'all' ? <span className='ml-1.5 text-xs opacity-70'>({counts[item.key]})</span> : null}
          </button>
        ))}
      </div>

      {/* List */}
      <div className='mt-6' aria-busy={isLoading}>
        {isLoading ? (
          <div className='flex justify-center py-16 text-[#004080]'>
            <Loader2 className='size-7 animate-spin' aria-label='Đang tải đơn ứng tuyển' />
          </div>
        ) : displayed.length === 0 ? (
          <div className='border border-dashed border-[#CFE3F7] bg-white p-12 text-center'>
            <p className='font-bold text-[#33506E]'>Không có đơn ứng tuyển nào ở trạng thái này.</p>
          </div>
        ) : (
          <ul className='space-y-3'>
            {displayed.map((app) => {
              const meta = STATUS_META[app.status]
              const isUpdating = updatingId === app.id
              const nextActions = meta.nextActions ?? []

              return (
                <li key={app.id}>
                  <article className='border border-[#CFE3F7] bg-white p-5 shadow-sm transition hover:border-[#004080]/40'>
                    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <h2 className='text-base font-black text-[#102033]'>{app.candidateName}</h2>
                          <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold uppercase', meta.className)}>
                            {meta.label}
                          </span>
                        </div>
                        <p className='mt-1 text-sm font-semibold text-[#004080]'>{app.jobTitle}</p>
                        <p className='text-sm text-[#5A718B]'>{app.candidateEmail}</p>
                        <p className='mt-1 inline-flex items-center gap-1 text-xs text-[#5A718B]'>
                          <CalendarDays className='size-3.5' aria-hidden='true' />
                          Nộp đơn {formatDate(app.appliedAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className='flex shrink-0 items-center gap-2'>
                        <button
                          type='button'
                          aria-label={`Nghe thông tin ứng viên ${app.candidateName}`}
                          onClick={() =>
                            void speakAccessibleText(
                              `Ứng viên ${app.candidateName} ứng tuyển vị trí ${app.jobTitle}. Trạng thái: ${meta.label}. Nộp ngày ${formatDate(app.appliedAt)}.`
                            )
                          }
                          className='inline-flex size-8 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
                        >
                          <Volume2 className='size-4' />
                        </button>

                        {isUpdating ? (
                          <Loader2 className='size-5 animate-spin text-[#004080]' aria-label='Đang cập nhật' />
                        ) : nextActions.length > 0 ? (
                          <div className='relative'>
                            <button
                              type='button'
                              onClick={() => setOpenMenuId(openMenuId === app.id ? null : app.id)}
                              aria-expanded={openMenuId === app.id}
                              aria-label='Cập nhật trạng thái'
                              className='inline-flex items-center gap-1.5 border border-[#004080] px-3 py-2 text-xs font-bold text-[#004080] transition hover:bg-[#EAF4FF]'
                            >
                              Cập nhật <ChevronDown className='size-3.5' aria-hidden='true' />
                            </button>
                            {openMenuId === app.id ? (
                              <div className='absolute right-0 top-full z-10 mt-1 min-w-[160px] border border-[#CFE3F7] bg-white shadow-lg'>
                                {nextActions.map((s) => (
                                  <button
                                    key={s}
                                    type='button'
                                    onClick={() => void updateStatus(app.id, s)}
                                    className={cn(
                                      'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-bold transition hover:bg-[#EAF4FF]',
                                      s === 'rejected' ? 'text-rose-600' : 'text-[#004080]'
                                    )}
                                  >
                                    {s === 'rejected' ? (
                                      <X className='size-4' aria-hidden='true' />
                                    ) : (
                                      <Check className='size-4' aria-hidden='true' />
                                    )}
                                    {ACTION_LABELS[s]}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Click away to close dropdown */}
      {openMenuId ? (
        <div
          aria-hidden='true'
          className='fixed inset-0 z-[9]'
          onClick={() => setOpenMenuId(null)}
        />
      ) : null}
    </WorkspaceShell>
  )
}
