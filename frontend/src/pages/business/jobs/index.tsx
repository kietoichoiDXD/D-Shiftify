import { useEffect, useState } from 'react'

import { Loader2, MapPin, Plus, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { type JobRecord, jobApi } from '@/core/services/job.service'
import { WorkspaceShell } from '@/pages/_shared/figma-web/workspace-shell'

const formatSalary = (job: JobRecord) => {
  if (job.salaryMin && job.salaryMax) return `${job.salaryMin.toLocaleString('vi-VN')} - ${job.salaryMax.toLocaleString('vi-VN')} VND`
  if (job.salaryMin) return `Từ ${job.salaryMin.toLocaleString('vi-VN')} VND`
  return 'Thỏa thuận'
}

export default function BusinessJobsPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let active = true
    void jobApi
      .list({ page: 1, limit: 50 })
      .then((response) => active && setJobs(response.data))
      .catch(() => active && setHasError(true))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <WorkspaceShell role='business'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h1 className='text-balance text-3xl font-black text-[#004080]'>Danh sách công việc</h1>
          <p className='mt-2 text-pretty text-[15px] text-[#33506E]'>Quản lý các tin tuyển dụng đang mở của doanh nghiệp.</p>
        </div>
        <Link
          to={ROUTE.BUSINESS.JOB_CREATE}
          className='inline-flex items-center gap-2 bg-[#004080] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#003466]'
        >
          <Plus className='size-4' /> Tạo việc mới
        </Link>
      </div>

      <div className='mt-8' aria-busy={isLoading}>
        {isLoading ? (
          <div className='flex justify-center py-16 text-[#004080]'>
            <Loader2 className='size-7 animate-spin' aria-label='Đang tải' />
          </div>
        ) : hasError ? (
          <div className='border border-[#CFE3F7] bg-white p-10 text-center text-[#33506E]'>
            Không thể tải danh sách công việc. Vui lòng thử lại sau.
          </div>
        ) : jobs.length === 0 ? (
          <div className='border border-dashed border-[#CFE3F7] bg-white p-12 text-center'>
            <p className='font-bold text-[#33506E]'>Chưa có tin tuyển dụng nào.</p>
            <Link to={ROUTE.BUSINESS.JOB_CREATE} className='mt-3 inline-block font-bold text-[#004080] underline'>
              Đăng tin đầu tiên
            </Link>
          </div>
        ) : (
          <ul className='grid gap-4 md:grid-cols-2'>
            {jobs.map((job) => (
              <li key={job.id}>
                <article className='flex h-full flex-col border border-[#CFE3F7] bg-white p-5 shadow-sm transition hover:border-[#004080] hover:shadow-md'>
                  <h2 className='text-balance text-lg font-black text-[#102033]'>{job.title}</h2>
                  <p className='mt-2 inline-flex items-center gap-1.5 text-sm text-[#5A718B]'>
                    <MapPin className='size-3.5' aria-hidden='true' /> {job.location} · {job.workMode}
                  </p>
                  <p className='mt-1 text-sm font-semibold text-[#004080]'>{formatSalary(job)}</p>
                  {job.skills.length > 0 ? (
                    <ul className='mt-3 flex flex-wrap gap-1.5'>
                      {job.skills.slice(0, 4).map((skill) => (
                        <li key={skill.name} className='rounded-full bg-[#EAF4FF] px-2.5 py-0.5 text-xs font-semibold text-[#004080]'>
                          {skill.name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className='mt-4 flex items-center justify-between border-t border-[#EAF4FF] pt-4'>
                    <Link to={ROUTE.BUSINESS.MATCHED_CANDIDATES} className='inline-flex items-center gap-1.5 text-sm font-bold text-[#004080] hover:underline'>
                      <Users className='size-4' /> Ứng viên phù hợp
                    </Link>
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
