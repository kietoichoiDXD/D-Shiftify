import { useEffect, useMemo, useState } from 'react'

import { Ban, CheckCircle2, Loader2, Search, ShieldCheck, UserCircle2, Volume2 } from 'lucide-react'

import { cn } from '@/core/lib/utils'
import axiosClient from '@/core/services/axios-client'

type UserRole = 'candidate' | 'employer' | 'training_center' | 'admin'
type UserStatus = 'active' | 'suspended' | 'pending'

type User = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLogin?: string
}

type ApiEnvelope = { data: User[]; meta?: { total: number; page: number } }

const ROLE_META: Record<UserRole, { label: string; color: string }> = {
  candidate:        { label: 'NKT / Ứng viên',     color: 'bg-sky-100 text-sky-700' },
  employer:         { label: 'Doanh nghiệp',        color: 'bg-violet-100 text-violet-700' },
  training_center:  { label: 'Trung tâm Đào tạo',  color: 'bg-amber-100 text-amber-700' },
  admin:            { label: 'Admin',               color: 'bg-rose-100 text-rose-700' }
}

const STATUS_META: Record<UserStatus, { label: string; color: string }> = {
  active:    { label: 'Hoạt động',    color: 'text-emerald-600' },
  suspended: { label: 'Đã khóa',      color: 'text-rose-600' },
  pending:   { label: 'Chờ duyệt',    color: 'text-amber-600' }
}

// TODO(backend): replace with GET /api/v1/admin/users
const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Nguyễn Văn An', email: 'nvan@mail.com', role: 'candidate', status: 'active', createdAt: '2026-06-01', lastLogin: '2026-07-29' },
  { id: 'u2', name: 'Công ty Alpha', email: 'alpha@corp.com', role: 'employer', status: 'active', createdAt: '2026-05-15', lastLogin: '2026-07-28' },
  { id: 'u3', name: 'TT Dạy nghề Hà Nội', email: 'ttdn@edu.vn', role: 'training_center', status: 'pending', createdAt: '2026-07-25', lastLogin: undefined },
  { id: 'u4', name: 'Trần Thị Bảo', email: 'ttbao@mail.com', role: 'candidate', status: 'active', createdAt: '2026-06-10', lastLogin: '2026-07-27' },
  { id: 'u5', name: 'Tập đoàn Beta', email: 'hr@beta.vn', role: 'employer', status: 'suspended', createdAt: '2026-04-20', lastLogin: '2026-06-30' },
  { id: 'u6', name: 'Lê Văn Cường', email: 'lvc@mail.com', role: 'candidate', status: 'pending', createdAt: '2026-07-28', lastLogin: undefined },
  { id: 'u7', name: 'Hoàng Thị Dung', email: 'htd@mail.com', role: 'candidate', status: 'active', createdAt: '2026-06-22', lastLogin: '2026-07-26' },
  { id: 'u8', name: 'TT Đào Tạo Sáng Tạo', email: 'stc@edu.vn', role: 'training_center', status: 'active', createdAt: '2026-05-01', lastLogin: '2026-07-20' }
]

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const getInitials = (name: string) =>
  name.split(' ').filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase()

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void (axiosClient.get('/api/v1/users', { params: { page: 1, limit: 50 } }) as Promise<ApiEnvelope>)
      .then((res) => active && setUsers(res.data))
      .catch(() => active && setUsers(MOCK_USERS))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [])

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          !search ||
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        const matchRole = roleFilter === 'all' || u.role === roleFilter
        const matchStatus = statusFilter === 'all' || u.status === statusFilter
        return matchSearch && matchRole && matchStatus
      }),
    [users, search, roleFilter, statusFilter]
  )

  const toggleSuspend = async (user: User) => {
    const newStatus: UserStatus = user.status === 'suspended' ? 'active' : 'suspended'
    setUpdatingId(user.id)
    try {
      // TODO(backend): PATCH /api/v1/admin/users/:id { status: newStatus }
      await axiosClient.patch(`/api/v1/users/${user.id}`, { status: newStatus })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)))
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)))
    } finally {
      setUpdatingId(null)
    }
  }

  const approveUser = async (user: User) => {
    setUpdatingId(user.id)
    try {
      await axiosClient.patch(`/api/v1/users/${user.id}`, { status: 'active' })
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u)))
    } catch {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: 'active' } : u)))
    } finally {
      setUpdatingId(null)
    }
  }

  const counts = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      pending: users.filter((u) => u.status === 'pending').length,
      suspended: users.filter((u) => u.status === 'suspended').length
    }),
    [users]
  )

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-black text-slate-800'>Quản lý người dùng</h1>
        <p className='mt-1 text-[15px] text-slate-500'>Xem, duyệt và quản lý tài khoản trên hệ thống.</p>
      </div>

      {/* Stats */}
      {!isLoading ? (
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          <StatPill label='Tổng tài khoản' value={counts.total} color='bg-slate-100 text-slate-700' />
          <StatPill label='Đang hoạt động' value={counts.active} color='bg-emerald-100 text-emerald-700' />
          <StatPill label='Chờ duyệt' value={counts.pending} color='bg-amber-100 text-amber-700' />
          <StatPill label='Đã khóa' value={counts.suspended} color='bg-rose-100 text-rose-700' />
        </div>
      ) : null}

      {/* Filters */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' aria-hidden='true' />
          <input
            type='search'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Tìm theo tên hoặc email...'
            aria-label='Tìm kiếm người dùng'
            className='w-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
          aria-label='Lọc theo vai trò'
          className='border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400'
        >
          <option value='all'>Tất cả vai trò</option>
          <option value='candidate'>NKT / Ứng viên</option>
          <option value='employer'>Doanh nghiệp</option>
          <option value='training_center'>Trung tâm Đào tạo</option>
          <option value='admin'>Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
          aria-label='Lọc theo trạng thái'
          className='border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400'
        >
          <option value='all'>Tất cả trạng thái</option>
          <option value='active'>Hoạt động</option>
          <option value='pending'>Chờ duyệt</option>
          <option value='suspended'>Đã khóa</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className='flex justify-center py-20'>
          <Loader2 className='size-8 animate-spin text-slate-300' aria-label='Đang tải người dùng' />
        </div>
      ) : (
        <div className='overflow-hidden border border-slate-200 bg-white shadow-sm'>
          <div className='flex items-center justify-between border-b border-slate-100 px-5 py-3'>
            <p className='text-sm font-semibold text-slate-500'>
              Hiển thị <span className='font-black text-slate-800'>{filtered.length}</span> trong {users.length} người dùng
            </p>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50'>
                  {['Người dùng', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Đăng nhập gần nhất', 'Thao tác'].map((h) => (
                    <th key={h} className='px-5 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500'>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-5 py-10 text-center text-slate-400 font-semibold'>
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => {
                    const roleMeta = ROLE_META[user.role]
                    const statusMeta = STATUS_META[user.status]
                    const isUpdating = updatingId === user.id

                    return (
                      <tr key={user.id} className='hover:bg-slate-50'>
                        <td className='px-5 py-3'>
                          <div className='flex items-center gap-3'>
                            <div
                              aria-hidden='true'
                              className='flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-600'
                            >
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <p className='font-black text-slate-800'>{user.name}</p>
                              <p className='text-xs text-slate-400'>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-5 py-3'>
                          <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', roleMeta.color)}>
                            {roleMeta.label}
                          </span>
                        </td>
                        <td className='px-5 py-3'>
                          <span className={cn('text-xs font-black', statusMeta.color)}>● {statusMeta.label}</span>
                        </td>
                        <td className='px-5 py-3 text-slate-500'>{formatDate(user.createdAt)}</td>
                        <td className='px-5 py-3 text-slate-500'>{formatDate(user.lastLogin)}</td>
                        <td className='px-5 py-3'>
                          {isUpdating ? (
                            <Loader2 className='size-4 animate-spin text-slate-400' />
                          ) : (
                            <div className='flex items-center gap-2'>
                              {user.status === 'pending' ? (
                                <button
                                  type='button'
                                  onClick={() => void approveUser(user)}
                                  title='Duyệt tài khoản'
                                  className='inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-emerald-700'
                                >
                                  <CheckCircle2 className='size-3' /> Duyệt
                                </button>
                              ) : user.status !== 'admin' ? (
                                <button
                                  type='button'
                                  onClick={() => void toggleSuspend(user)}
                                  title={user.status === 'suspended' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                                  className={cn(
                                    'inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold transition',
                                    user.status === 'suspended'
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                  )}
                                >
                                  {user.status === 'suspended' ? (
                                    <><ShieldCheck className='size-3' /> Mở khóa</>
                                  ) : (
                                    <><Ban className='size-3' /> Khóa</>
                                  )}
                                </button>
                              ) : (
                                <span className='flex items-center gap-1 text-xs text-slate-400'>
                                  <UserCircle2 className='size-3.5' /> Admin
                                </span>
                              )}
                              <button
                                type='button'
                                aria-label={`Xem chi tiết người dùng ${user.name}`}
                                className='text-blue-500 transition hover:text-blue-700'
                              >
                                <Volume2 className='size-4' />
                              </button>
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

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={cn('rounded-lg px-4 py-3', color)}>
      <p className='text-xs font-bold uppercase'>{label}</p>
      <p className='mt-1 text-2xl font-black tabular-nums'>{value}</p>
    </div>
  )
}
