import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronDown, ChevronsLeft, ChevronsRight, Mic, Search, Volume2, X, Loader2 } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/core/lib/utils'
import { jobApi, type JobRecord, type JobMatch } from '@/core/services/job.service'
import { speakAccessibleText } from '@/core/services/speech.service'
import toastifyCommon from '@/core/lib/toastify-common'

import { allFilterLabel, filterGroups, initialFilters, matchReasons, type CandidateJob, type FilterKey, type FilterState } from './data'
import { AnimatedButton, AnimatedCard } from './interactive'

function filterMatches(job: CandidateJob, key: FilterKey, value: string) {
  if (value === allFilterLabel) return true
  if (key === 'location') {
    if (value === 'Remote') return job.mode === 'Remote'
    return job.location.includes(value)
  }
  return job[key] === value
}

function CandidateSearchBar({
  keyword,
  onKeywordChange,
  filters,
  onFilterChange,
  total,
  isListening,
  onMicClick,
  onSpeakResults
}: {
  keyword: string
  onKeywordChange: (value: string) => void
  filters: FilterState
  onFilterChange: (key: FilterKey, value: string) => void
  total: number
  isListening: boolean
  onMicClick: () => void
  onSpeakResults: () => void
}) {
  return (
    <section className='space-y-5' aria-label='Bộ lọc tìm việc'>
      <div className='relative'>
        <Search className='absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]' aria-hidden='true' />
        <input
          placeholder='Tìm kiếm công việc...'
          aria-label='Tìm kiếm công việc'
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className='h-[58px] w-full border border-[#D9D9D9] bg-white px-12 pr-20 text-[13px] outline-none placeholder:text-[#767676] focus:border-black focus:ring-2 focus:ring-black/10'
        />
        <span className='absolute right-5 top-1/2 flex -translate-y-1/2 items-center gap-3 text-[#555]'>
          <button
            type='button'
            onClick={onMicClick}
            aria-label='Nhập bằng giọng nói'
            className={cn('rounded-full p-1 transition hover:bg-black/5 hover:text-black', isListening && 'animate-pulse bg-red-50 text-red-500')}
          >
            <Mic className='h-4 w-4' aria-hidden='true' />
          </button>
          <button
            type='button'
            onClick={onSpeakResults}
            aria-label='Đọc kết quả tìm kiếm'
            className='rounded-full p-1 transition hover:bg-black/5 hover:text-black'
          >
            <Volume2 className='h-4 w-4' aria-hidden='true' />
          </button>
        </span>
      </div>

      <div className='flex flex-wrap gap-4'>
        {filterGroups.map((group) => (
          <DropdownMenu key={group.key}>
            <DropdownMenuTrigger asChild>
              <AnimatedButton
                aria-label={`${group.label}: ${filters[group.key]}`}
                className='flex h-11 min-w-[240px] items-center justify-between border border-[#D9D9D9] bg-white px-5 text-[12px] font-black uppercase text-[#111] hover:border-black hover:shadow-[0_10px_22px_rgba(0,0,0,0.06)]'
              >
                <span>{filters[group.key] === allFilterLabel ? group.label : filters[group.key]}</span>
                <ChevronDown className='h-4 w-4' aria-hidden='true' />
              </AnimatedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-[260px] rounded-none border-[#D9D9D9] p-1'>
              <DropdownMenuRadioGroup value={filters[group.key]} onValueChange={(value) => onFilterChange(group.key, value)}>
                {group.options.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option} className='rounded-none px-3 py-2 text-[12px] font-bold'>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      <div className='h-[3px] bg-black' />
      <p className='sr-only' role='status' aria-live='polite'>
        Tìm thấy {total} công việc phù hợp.
      </p>
    </section>
  )
}

function JobLogo({ title }: { title: string }) {
  return (
    <div
      role='img'
      aria-label={`Logo ${title}`}
      className='h-[72px] w-[72px] shrink-0 bg-[#F6F6F6]'
      style={{
        backgroundImage:
          'linear-gradient(45deg, #e8e8e8 25%, transparent 25%), linear-gradient(-45deg, #e8e8e8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e8e8 75%), linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)',
        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
        backgroundSize: '16px 16px'
      }}
    />
  )
}

function MatchModal({ job, matchDetails, onClose }: { job: CandidateJob; matchDetails?: JobMatch; onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSpeakDetails = () => {
    let text = `Chi tiết độ phù hợp cho công việc ${job.title}. Điểm phù hợp là ${job.score} phần trăm.`
    if (matchDetails?.explanation) {
      text += ` ${matchDetails.explanation}`
    } else {
      text += ' Đáp ứng các kỹ năng cốt lõi và thiết bị yêu cầu.'
    }
    speakAccessibleText(text)
  }


  const rows = useMemo(() => {
    if (matchDetails) {
      const criteriaRows: Array<[string, string]> = []
      if (matchDetails.criteria) {
        matchDetails.criteria.forEach((c) => {
          criteriaRows.push([c.label, `Điểm phù hợp: ${c.score}%. Đóng góp trọng số: ${c.weight}%.`])
        })
      }
      if (matchDetails.strengths?.length) {
        criteriaRows.push(['Điểm mạnh', matchDetails.strengths.join(', ')])
      }
      if (matchDetails.gaps?.length) {
        criteriaRows.push(['Điểm thiếu sót', matchDetails.gaps.join(', ')])
      }
      if (matchDetails.explanation) {
        criteriaRows.push(['Đánh giá chung', matchDetails.explanation])
      }
      return criteriaRows.length ? criteriaRows : matchReasons
    }
    return matchReasons
  }, [matchDetails])

  return (
    <motion.div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-5'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
    >
      <motion.div
        role='dialog'
        aria-modal='true'
        aria-labelledby='match-modal-title'
        className='relative w-full max-w-[760px] bg-white p-8 shadow-[0_24px_70px_rgba(0,0,0,0.35)]'
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <AnimatedButton
          aria-label='Đóng chi tiết độ phù hợp'
          onClick={onClose}
          className='absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F3F3] text-black hover:bg-[#E7E7E7]'
        >
          <X className='h-5 w-5' aria-hidden='true' />
        </AnimatedButton>
        <div className='mb-6 flex items-center justify-between pr-10'>
          <div>
            <h2 id='match-modal-title' className='max-w-[430px] text-[30px] font-black uppercase leading-[0.95] text-black'>
              Chi tiết độ phù hợp
            </h2>
            <p className='mt-2 text-[12px] font-bold text-[#555]'>{job.title}</p>
          </div>
          <AnimatedButton
            type='button'
            onClick={handleSpeakDetails}
            aria-label='Đọc chi tiết độ phù hợp'
            className='flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] hover:bg-[#E7E7E7]'
          >
            <Volume2 className='h-5 w-5' aria-hidden='true' />
          </AnimatedButton>
        </div>
        <div className='max-h-[400px] overflow-y-auto space-y-5 bg-white pr-2'>
          {rows.map(([title, body]) => (
            <div key={title} className='border-b border-[#F0F0F0] pb-4 last:border-none last:pb-0'>
              <div className='flex items-center gap-2 mb-2'>
                <h3 className='text-[13px] font-black uppercase tracking-wider text-black'>{title}</h3>
                <button
                  type='button'
                  onClick={() => speakAccessibleText(`${title}: ${body}`)}
                  aria-label={`Đọc phần ${title}`}
                  className='rounded-full p-1 transition hover:bg-black/5 hover:text-black focus:outline-none'
                >
                  <Volume2 className='h-3.5 w-3.5 text-[#777]' aria-hidden='true' />
                </button>
              </div>
              <p className='text-[13px] leading-6 text-[#555]'>{body}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function JobCard({
  job,
  onOpenMatch,
  onApply,
  applyingJobId
}: {
  job: CandidateJob
  onOpenMatch: (job: CandidateJob) => void
  onApply: (job: CandidateJob) => void
  applyingJobId: string | null
}) {
  const handleSpeakJob = () => {
    speakAccessibleText(`${job.title} tại ${job.company}, ${job.location}. Điểm phù hợp là ${job.score} phần trăm.`)
  }

  const isApplying = applyingJobId === job.id

  return (
    <AnimatedCard className='flex items-center gap-6 border border-[#E3E3E3] bg-white p-6 shadow-[0_3px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_34px_rgba(0,0,0,0.08)]'>
      <JobLogo title={job.title} />
      <div className='min-w-0 flex-1'>
        <h2 className='truncate text-[15px] font-black uppercase text-[#111]'>{job.title}</h2>
        <p className='mt-2 truncate text-[12px] font-medium text-[#333]'>
          {job.company} | {job.location}
        </p>
      </div>
      <div className='flex shrink-0 items-center gap-5'>
        <AnimatedButton
          type='button'
          onClick={() => onOpenMatch(job)}
          className='rounded-full bg-[#BFF5D4] px-4 py-2 text-[11px] font-black text-[#024C2D] hover:bg-[#A5EDC0]'
        >
          Điểm phù hợp: {job.score}%
        </AnimatedButton>
        <AnimatedButton
          type='button'
          onClick={() => onApply(job)}
          disabled={isApplying}
          className='h-12 w-[158px] bg-black text-[12px] font-black uppercase tracking-[0.16em] text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)] hover:bg-[#222] flex items-center justify-center'
        >
          {isApplying ? (
            <Loader2 className='h-4 w-4 animate-spin text-white' />
          ) : (
            'Ứng tuyển'
          )}
        </AnimatedButton>
        <button
          type='button'
          onClick={handleSpeakJob}
          aria-label={`Đọc mô tả ${job.title}`}
          className='text-[#555] hover:text-black focus:outline-none p-1'
        >
          <Volume2 className='h-4 w-4' aria-hidden='true' />
        </button>
      </div>
    </AnimatedCard>
  )
}

function mapDbJobToCandidateJob(dbJob: JobRecord, matches?: JobMatch[]): CandidateJob {
  const title = dbJob.title || ''


  let technical = 'Agile'
  if (title.toLowerCase().includes('designer') || title.toLowerCase().includes('graphic')) {
    technical = 'UI/UX'
  } else if (title.toLowerCase().includes('developer') || title.toLowerCase().includes('data')) {
    technical = 'Data Analysis'
  } else if (title.toLowerCase().includes('writer') || title.toLowerCase().includes('marketing')) {
    technical = 'Content Marketing'
  }


  let softSkill = 'Giao tiếp'
  if (title.toLowerCase().includes('developer')) {
    softSkill = 'Tư duy phân tích'
  } else if (title.toLowerCase().includes('designer')) {
    softSkill = 'Sáng tạo'
  } else if (title.toLowerCase().includes('writer')) {
    softSkill = 'Sáng tạo'
  } else if (title.toLowerCase().includes('assistant')) {
    softSkill = 'Lãnh đạo nhóm'
  }


  let location = dbJob.location || 'TP. Hồ Chí Minh'
  

  const mode = dbJob.workMode === 'remote' ? 'Remote' : 'Offline'


  const match = matches?.find((m) => m.job.id === dbJob.id)
  const score = match ? Math.round(match.score) : 80

  return {
    id: dbJob.id,
    title: dbJob.title,
    company: dbJob.company?.name || 'Công ty tuyển dụng',
    location: location,
    technical: technical,
    softSkill: softSkill,
    mode: mode,
    score: score
  }
}

export function FigmaCandidateJobsPage() {
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [selectedJob, setSelectedJob] = useState<CandidateJob | null>(null)
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)


  const { data: cvData } = useQuery({
    queryKey: ['candidate-cv-me'],
    queryFn: () => jobApi.getCurrentCv().catch(() => null)
  })


  const { data: jobsResponse, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['candidate-jobs-list', keyword],
    queryFn: () => jobApi.list({ search: keyword })
  })

  const jobIds = useMemo(() => {
    return jobsResponse?.data?.map((j) => j.id) || []
  }, [jobsResponse])


  const { data: matches } = useQuery({
    queryKey: ['jobs-matches', cvData?.id, jobIds],
    queryFn: () => {
      if (cvData?.id && jobIds.length) {
        return jobApi.match(cvData.id, jobIds)
      }
      return Promise.resolve([])
    },
    enabled: !!cvData?.id && jobIds.length > 0
  })

  const jobsList = useMemo(() => {
    if (!jobsResponse?.data) return []
    return jobsResponse.data.map((j) => mapDbJobToCandidateJob(j, matches))
  }, [jobsResponse, matches])

  const filteredJobs = useMemo(
    () => jobsList.filter((job) => filterGroups.every((group) => filterMatches(job, group.key, filters[group.key]))),
    [jobsList, filters]
  )

  const handleFilterChange = (key: FilterKey, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const handleApply = async (job: CandidateJob) => {
    if (!cvData?.id) {
      toastifyCommon.error('Vui lòng tạo hồ sơ CV trước khi ứng tuyển!')
      return
    }

    setApplyingJobId(job.id)
    try {
      await jobApi.apply(job.id, cvData.id)
      toastifyCommon.success(`Ứng tuyển thành công vào vị trí ${job.title}!`)
      speakAccessibleText(`Ứng tuyển thành công vào vị trí ${job.title}!`)
    } catch (err: any) {
      console.error(err)
      toastifyCommon.error('Ứng tuyển thất bại hoặc bạn đã ứng tuyển công việc này.')
    } finally {
      setApplyingJobId(null)
    }
  }

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toastifyCommon.error('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'vi-VN'
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event: any) => {
      setKeyword(event.results[0][0].transcript)
    }
    recognition.onerror = (event: any) => {
      console.error(event)
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  const handleSpeakResults = () => {
    const total = filteredJobs.length
    const text = `Tìm thấy ${total} công việc phù hợp với bộ lọc của bạn.`
    speakAccessibleText(text)
  }

  const selectedJobMatchDetails = useMemo(() => {
    if (!selectedJob || !matches) return undefined
    return matches.find((m) => m.job.id === selectedJob.id)
  }, [selectedJob, matches])

  return (
    <section className='mx-auto w-full max-w-[1280px] bg-[#FAFAFA] px-5 py-7 text-black sm:px-6'>
      <CandidateSearchBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        filters={filters}
        onFilterChange={handleFilterChange}
        total={filteredJobs.length}
        isListening={isListening}
        onMicClick={handleMicClick}
        onSpeakResults={handleSpeakResults}
      />
      
      {isLoadingJobs ? (
        <div className='flex h-64 w-full items-center justify-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-black' />
          <span className='text-[13px] font-bold'>Đang tìm kiếm công việc...</span>
        </div>
      ) : (
        <motion.div layout className='mt-9 space-y-4'>
          <AnimatePresence mode='popLayout'>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onOpenMatch={setSelectedJob}
                onApply={handleApply}
                applyingJobId={applyingJobId}
              />
            ))}
          </AnimatePresence>
          {filteredJobs.length === 0 ? (
            <div className='border border-dashed border-[#CFCFCF] bg-white p-10 text-center'>
              <CheckCircle2 className='mx-auto h-8 w-8 text-[#555]' aria-hidden='true' />
              <p className='mt-3 text-[13px] font-bold text-[#333]'>Chưa có công việc khớp bộ lọc này.</p>
            </div>
          ) : null}
        </motion.div>
      )}

      <div className='mt-9 flex justify-end gap-2' aria-label='Phân trang'>
        <AnimatedButton aria-label='Trang trước' className='flex h-9 w-9 items-center justify-center border border-black bg-white hover:bg-black hover:text-white'>
          <ChevronsLeft className='h-4 w-4' aria-hidden='true' />
        </AnimatedButton>
        {[1, 2, 3].map((page) => (
          <AnimatedButton
            key={page}
            aria-current={page === 1 ? 'page' : undefined}
            className={cn('h-9 w-9 border border-[#D9D9D9] bg-white text-[12px] font-black hover:border-black', page === 1 && 'border-black bg-black text-white')}
          >
            {page}
          </AnimatedButton>
        ))}
        <span className='flex h-9 items-center px-2 text-[12px]'>...</span>
        <AnimatedButton className='h-9 w-9 border border-[#D9D9D9] bg-white text-[12px] font-black hover:border-black'>10</AnimatedButton>
        <AnimatedButton aria-label='Trang sau' className='flex h-9 w-9 items-center justify-center border border-black bg-white hover:bg-black hover:text-white'>
          <ChevronsRight className='h-4 w-4' aria-hidden='true' />
        </AnimatedButton>
      </div>
      
      <AnimatePresence>
        {selectedJob ? (
          <MatchModal
            job={selectedJob}
            matchDetails={selectedJobMatchDetails}
            onClose={() => setSelectedJob(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  )
}
