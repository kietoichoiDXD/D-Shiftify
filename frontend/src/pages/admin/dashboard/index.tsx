import { useEffect, useState } from 'react'

import { Activity, Brain, BriefcaseBusiness, Loader2, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import axiosClient from '@/core/services/axios-client'

type Stats = {
  totalUsers: number
  totalJobs: number
  totalApplications: number
  totalAiEvents: number
  pendingJobs: number
  newUsersToday: number
}

type RecentJob = {
  id: string
  title: string
  company: string
  status: 'open' | 'closed' | 'paused'
  createdAt: string
}

// TODO(backend): replace with GET /api/v1/admin/stats aggregation endpoint
const MOCK_STATS: Stats = {
  totalUsers: 1248,
  totalJobs: 342,
  totalApplications: 879,
  totalAiEvents: 4210,
  pendingJobs: 17,
  newUsersToday: 23
}

const MOCK_RECENT_JOBS: RecentJob[] = [
  { id: 'j1', title: 'Lập trình viên Frontend', company: 'Công ty Tech Alpha', status: 'open', createdAt: '2026-07-29' },
  { id: 'j2', title: 'Nhân viên kiểm định dữ liệu', company: 'Tập đoàn Beta', status: 'open', createdAt: '2026-07-28' },
  { id: 'j3', title: 'Chuyên viên CSKH', company: 'Gamma Services', status: 'paused', createdAt: '2026-07-27' },
  { id: 'j4', title: 'Kế toán tổng hợp', company: 'Delta Finance', status: 'open', createdAt: '2026-07-26' },
  { id: 'j5', title: 'Nhân viên content', company: 'Epsilon Media', status: 'closed', createdAt: '2026-07-25' }
]

const JOB_STATUS_META: Record<RecentJob['status'], { label: string; className: string }> = {
  open:   { label: 'Đang mở',  className: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Tạm dừng', className: 'bg-amber-100 text-amber-700' },
  closed: { label: 'Đã đóng',  className: 'bg-slate-100 text-slate-600' }
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadStats = async () => {
      try {
        // Try to load real data: jobs total from /api/v1/admin/jobs
        const jobsRes = (await axiosClient.get('/api/v1/admin/jobs', { params: { page: 1, limit: 5 } })) as { data: RecentJob[]; meta?: { total: number } }
        if (active) {
          setRecentJobs(jobsRes.data.slice(0, 5))
          setStats({ ...MOCK_STATS, totalJobs: jobsRes.meta?.total ?? MOCK_STATS.totalJobs })
        }
      } catch {
        if (active) {
          setStats(MOCK_STATS)
          setRecentJobs(MOCK_RECENT_JOBS)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }
    void loadStats()
    return () => { active = false }
  }, [])

  return (
    <div className='space-y-8 p-6'>
      <div className='flex items-end justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-black text-slate-800'>Bảng điều khiển Admin</h1>
          <p className='mt-1 text-[15px] text-slate-500'>Tổng quan hệ thống D-Shiftify</p>
        </div>
        <span className='text-xs font-semibold text-slate-400'>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
        </span>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-20'>
          <Loader2 className='size-8 animate-spin text-slate-400' aria-label='Đang tải dữ liệu' />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            <KpiCard
              icon={Users}
              label='Tổng người dùng'
              value={stats?.totalUsers ?? 0}
              sub={`+${stats?.newUsersToday ?? 0} hôm nay`}
              color='text-blue-600'
              bg='bg-blue-50'
              accent
            />
            <KpiCard
              icon={BriefcaseBusiness}
              label='Tổng tin tuyển dụng'
              value={stats?.totalJobs ?? 0}
              sub={`${stats?.pendingJobs ?? 0} chờ kiểm duyệt`}
              color='text-violet-600'
              bg='bg-violet-50'
            />
            <KpiCard
              icon={Activity}
              label='Đơn ứng tuyển'
              value={stats?.totalApplications ?? 0}
              color='text-amber-600'
              bg='bg-amber-50'
            />
            <KpiCard
              icon={Brain}
              label='Sự kiện AI'
              value={stats?.totalAiEvents ?? 0}
              sub='Gemini Match + TTS + STT'
              color='text-emerald-600'
              bg='bg-emerald-50'
            />
            <KpiCard
              icon={ShieldCheck}
              label='Kiểm duyệt chờ xử lý'
              value={stats?.pendingJobs ?? 0}
              color='text-rose-600'
              bg='bg-rose-50'
            />
            <KpiCard
              icon={TrendingUp}
              label='Người dùng mới hôm nay'
              value={stats?.newUsersToday ?? 0}
              color='text-sky-600'
              bg='bg-sky-50'
            />
          </div>

          {/* Quick Links */}
          <div className='grid gap-4 sm:grid-cols-3'>
            {[
              { label: 'Quản lý người dùng', desc: 'Xem, khóa, duyệt tài khoản', to: '/admin/users', icon: Users, color: 'bg-blue-600' },
              { label: 'Kiểm duyệt việc làm', desc: 'Xét duyệt tin đăng mới', to: '/admin/jobs', icon: BriefcaseBusiness, color: 'bg-violet-600' },
              { label: 'Nhật ký AI', desc: 'Theo dõi Gemini, TTS, STT', to: '/admin/ai-logs', icon: Brain, color: 'bg-emerald-600' }
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className='group flex items-start gap-4 border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow-md'
                >
                  <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-md text-white ${item.color}`}>
                    <Icon className='size-5' aria-hidden='true' />
                  </span>
                  <div>
                    <p className='font-black text-slate-800 group-hover:text-slate-900'>{item.label}</p>
                    <p className='mt-0.5 text-xs text-slate-500'>{item.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Recent Jobs */}
          <div>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-black text-slate-800'>Tin tuyển dụng gần đây</h2>
              <Link to='/admin/jobs' className='text-sm font-bold text-blue-600 hover:underline'>
                Xem tất cả →
              </Link>
            </div>
            <div className='mt-3 overflow-hidden border border-slate-200 bg-white shadow-sm'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-slate-100 bg-slate-50'>
                    <th className='px-5 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500'>Tiêu đề</th>
                    <th className='px-5 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500'>Công ty</th>
                    <th className='px-5 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500'>Trạng thái</th>
                    <th className='px-5 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500'>Ngày đăng</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {recentJobs.map((job) => {
                    const meta = JOB_STATUS_META[job.status]
                    return (
                      <tr key={job.id} className='hover:bg-slate-50'>
                        <td className='px-5 py-3 font-semibold text-slate-800'>{job.title}</td>
                        <td className='px-5 py-3 text-slate-600'>{job.company}</td>
                        <td className='px-5 py-3'>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>
                        </td>
                        <td className='px-5 py-3 text-slate-500'>{formatDate(job.createdAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function KpiCard({
  icon: Icon, label, value, sub, color, bg, accent
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  sub?: string
  color: string
  bg: string
  accent?: boolean
}) {
  return (
    <div className='border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='flex items-start justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.04em] text-slate-500'>{label}</p>
          <p className='mt-2 text-3xl font-black tabular-nums text-slate-800'>{value.toLocaleString('vi-VN')}</p>
          {sub ? <p className='mt-1 text-xs text-slate-400'>{sub}</p> : null}
        </div>
        <span className={`inline-flex size-10 items-center justify-center rounded-md ${bg} ${color}`}>
          <Icon className='size-5' aria-hidden='true' />
        </span>
      </div>
      {accent ? <span className='mt-3 block h-1 w-10 bg-blue-600' /> : null}
    </div>
  )
}
