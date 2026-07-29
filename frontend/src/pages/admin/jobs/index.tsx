import { useEffect, useMemo, useState } from 'react'

import { CheckCircle2, EyeOff, Loader2, MapPin, Search, XCircle } from 'lucide-react'

import { cn } from '@/core/lib/utils'
import axiosClient from '@/core/services/axios-client'

type JobStatus = 'open' | 'closed' | 'paused' | 'pending_review'

type AdminJob = {
  id: string
  title: string
  company: string
  location: string
  workMode: string
  status: JobStatus
  createdAt: string
  applicationCount?: number
}

type ApiEnvelope = { data: AdminJob[]; meta?: { total: number } }

const STATUS_META: Record<JobStatus, { label: string; className: string }> = {
  open:           { label: 'Đang mở',      className: 'bg-emerald-100 text-emerald-700' },
  closed:         { label: 'Đã đóng',      className: 'bg-slate-100 text-slate-600' },
  paused:         { label: 'Tạm dừng',     className: 'bg-amber-100 text-amber-700' },
  pending_review: { label: 'Chờ duyệt',    className: 'bg-blue-100 text-blue-700' }
}

// TODO(backend): GET /api/v1/admin/jobs
const MOCK_JOBS: AdminJob[] = [
  { id: 'j1', title: 'Lập trình viên Frontend (React)', company: 'Công ty Tech Alpha', location: 'Hà Nội', workMode: 'Hybrid', status: 'open', createdAt: '2026-07-29', applicationCount: 12 },
  { id: 'j2', title: 'Nhân viên phân tích dữ liệu', company: 'Tập đoàn Beta Corp', location: 'TP.HCM', workMode: 'Remote', status: 'pending_review', createdAt: '2026-07-28', applicationCount: 0 },
  { id: 'j3', title: 'Chuyên viên CSKH', company: 'Gamma Services', location: 'Đà Nẵng', workMode: 'Offline', status: 'paused', createdAt: '2026-07-27', applicationCount: 5 },
  { id: 'j4', title: 'Kế toán tổng hợp', company: 'Delta Finance', location: 'Hà Nội', workMode: 'Offline', status: 'open', createdAt: '2026-07-26', applicationCount: 8 },
  { id: 'j5', title: 'Nhân viên content (khuyết tật ưu tiên)', company: 'Epsilon Media', location: 'Remote', workMode: 'Remote', status: 'pending_review', createdAt: '2026-07-25', applicationCount: 0 },
  { id: 'j6', title: 'Nhân viên kế hoạch hòa nhập', company: 'Zeta Group', location: 'TP.HCM', workMode: 'Hybrid', status: 'closed', createdAt: '2026-07-20', applicationCount: 18 }
]

const FILTERS: Array<{ key: JobStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending_review', label: 'Chờ duyệt' },
  { key: 'open', label: 'Đang mở' },
  { key: 'paused', label: 'Tạm dừng' },
  { key: 'closed', label: 'Đã đóng' }
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void (axiosClient.get('/api/v1/admin/jobs', { params: { page: 1, limit: 50 } }) as Promise<ApiEnvelope>)
      .then((res) => active && setJobs(res.data))
      .catch(() => active && setJobs(MOCK_JOBS))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || j.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [jobs, search, statusFilter])

  const counts = useMemo(
    () => ({
      all: jobs.length,
      open: jobs.filter((j) => j.status === 'open').length,
      pending_review: jobs.filter((j) => j.status === 'pending_review').length,
      paused: jobs.filter((j) => j.status === 'paused').length,
      closed: jobs.filter((j) => j.status === 'closed').length
    }),
    [jobs]
  )

  const updateJobStatus = async (jobId: string, newStatus: JobStatus) => {
    setUpdatingId(jobId)
    try {
      // TODO(backend): PATCH /api/v1/admin/jobs/:id { status: newStatus }
      await axiosClient.patch(`/api/v1/jobs/${jobId}`, { status: newStatus })
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)))
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-3xl font-black text-slate-800'>Kiểm duyệt việc làm</h1>
        <p className='mt-1 text-[15px] text-slate-500'>Xem xét và duyệt các tin tuyển dụng trước khi xuất bản.</p>
      </div>

      {/* Stats */}
      {!isLoading ? (
        <div className='flex flex-wrap gap-3'>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type='button'
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                'flex items-center gap-2 border px-4 py-2 text-sm font-bold transition',
                statusFilter === f.key
                  ? 'border-slate-800 bg-slate-800 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              )}
            >
              {f.label}
              <span className='rounded-full bg-white/20 px-1.5 text-xs'>{counts[f.key]}</span>
            </button>
          ))}
        </div>
      ) : null}

      {/* Search */}
      <div className='relative max-w-md'>
        <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' aria-hidden='true' />
        <input
          type='search'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Tìm theo tiêu đề hoặc công ty...'
          aria-label='Tìm kiếm tin tuyển dụng'
          className='w-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
        />
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
              Hiển thị <span className='font-black text-slate-800'>{filtered.length}</span> tin
            </p>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50'>
                  {['Tiêu đề', 'Công ty', 'Địa điểm', 'Trạng thái', 'Đơn', 'Ngày đăng', 'Thao tác'].map((h) => (
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
                      Không tìm thấy tin tuyển dụng.
                    </td>
                  </tr>
                ) : (
                  filtered.map((job) => {
                    const meta = STATUS_META[job.status]
                    const isUpdating = updatingId === job.id
                    return (
                      <tr key={job.id} className='hover:bg-slate-50'>
                        <td className='px-5 py-3 font-semibold text-slate-800'>{job.title}</td>
                        <td className='px-5 py-3 text-slate-600'>{job.company}</td>
                        <td className='px-5 py-3'>
                          <span className='inline-flex items-center gap-1 text-slate-500'>
                            <MapPin className='size-3' aria-hidden='true' /> {job.location}
                          </span>
                        </td>
                        <td className='px-5 py-3'>
                          <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', meta.className)}>{meta.label}</span>
                        </td>
                        <td className='px-5 py-3 text-slate-500'>{job.applicationCount ?? 0}</td>
                        <td className='px-5 py-3 text-slate-500'>{formatDate(job.createdAt)}</td>
                        <td className='px-5 py-3'>
                          {isUpdating ? (
                            <Loader2 className='size-4 animate-spin text-slate-300' />
                          ) : (
                            <div className='flex items-center gap-1.5'>
                              {job.status === 'pending_review' ? (
                                <>
                                  <button
                                    type='button'
                                    onClick={() => void updateJobStatus(job.id, 'open')}
                                    title='Duyệt và mở tin'
                                    className='inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-emerald-700'
                                  >
                                    <CheckCircle2 className='size-3' /> Duyệt
                                  </button>
                                  <button
                                    type='button'
                                    onClick={() => void updateJobStatus(job.id, 'closed')}
                                    title='Từ chối tin'
                                    className='inline-flex items-center gap-1 rounded bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-200'
                                  >
                                    <XCircle className='size-3' /> Từ chối
                                  </button>
                                </>
                              ) : job.status === 'open' ? (
                                <button
                                  type='button'
                                  onClick={() => void updateJobStatus(job.id, 'paused')}
                                  title='Tạm dừng tin'
                                  className='inline-flex items-center gap-1 rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 transition hover:bg-amber-200'
                                >
                                  <EyeOff className='size-3' /> Tạm dừng
                                </button>
                              ) : job.status === 'paused' ? (
                                <button
                                  type='button'
                                  onClick={() => void updateJobStatus(job.id, 'open')}
                                  title='Mở lại tin'
                                  className='inline-flex items-center gap-1 rounded bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200'
                                >
                                  <CheckCircle2 className='size-3' /> Mở lại
                                </button>
                              ) : (
                                <span className='text-xs text-slate-400'>—</span>
                              )}
                            </div>
                          )}
                        </td>
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
