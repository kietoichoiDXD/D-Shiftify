import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Mic,
  Search,
  SlidersHorizontal,
  Volume2,
  X
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ROUTE } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'
import { MATCHING_CRITERIA, type JobMatch, type JobRecord, jobApi } from '@/core/services/job.service'
import { speakAccessibleText, speechApi } from '@/core/services/speech.service'
import toastifyCommon from '@/core/lib/toastify-common'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'

const ALL = 'Tất cả'
const PAGE_SIZE = 8

type FilterKey = 'skill' | 'workMode' | 'location'
type FilterState = Record<FilterKey, string>

const initialFilters: FilterState = { skill: ALL, workMode: ALL, location: ALL }

const filterDefinitions: Array<{ key: FilterKey; label: string; options: string[] }> = [
  { key: 'skill', label: 'Lọc theo kỹ năng chuyên môn', options: [ALL, 'NodeJS', 'PostgreSQL', 'Figma', 'Design'] },
  { key: 'workMode', label: 'Lọc theo hình thức', options: [ALL, 'remote', 'hybrid', 'onsite'] },
  { key: 'location', label: 'Lọc theo địa điểm', options: [ALL, 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'] }
]

const getSkillNames = (job: JobRecord) => job.skills.map((skill) => skill.name).filter(Boolean)

// Prefer a description supplied by the matching API; otherwise derive a short
// sentence from the criterion score so the dialog mirrors the Figma layout.
const getCriterionDescription = (criterion: JobMatch['criteria'][number]) => {
  const provided = (criterion as { description?: string }).description
  if (provided && provided.trim()) return provided.trim()
  if (criterion.score >= 80) return `Đáp ứng tốt yêu cầu ở tiêu chí này (${criterion.score}/100).`
  if (criterion.score >= 50) return `Phù hợp một phần với yêu cầu (${criterion.score}/100).`
  return `Cần bổ sung thêm để đáp ứng tiêu chí này (${criterion.score}/100).`
}

function JobLogo({ job }: { job: JobRecord }) {
  if (job.company.logoUrl) {
    return <img src={job.company.logoUrl} alt={`Logo ${job.company.name}`} className='size-[72px] shrink-0 object-cover' />
  }

  return (
    <div
      aria-hidden='true'
      className='size-[72px] shrink-0 bg-[#F6F6F6]'
      style={{
        backgroundImage:
          'linear-gradient(45deg, #e8e8e8 25%, transparent 25%), linear-gradient(-45deg, #e8e8e8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e8e8e8 75%), linear-gradient(-45deg, transparent 75%, #e8e8e8 75%)',
        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
        backgroundSize: '16px 16px'
      }}
    />
  )
}

function MatchDialog({ match, open, onOpenChange }: { match: JobMatch | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const prefersReducedMotion = useReducedMotion()
  if (!match) return null

  const speechText = `${match.job.title}. Điểm phù hợp ${match.score} phần trăm. ${match.explanation} ${match.criteria
    .map((criterion) => `${criterion.label}: ${criterion.score} điểm`)
    .join('. ')}`

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 z-40 bg-black/55' />
        <Dialog.Content asChild>
          <motion.div
            className='fixed left-1/2 top-1/2 z-50 max-h-[88dvh] w-[calc(100%-2rem)] max-w-[760px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white p-6 shadow-2xl sm:p-8'
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Dialog.Close asChild>
              <Button type='button' variant='ghost' size='icon' aria-label='Đóng' className='absolute right-4 top-4 size-9 rounded-full bg-slate-100'>
                <X className='size-5' />
              </Button>
            </Dialog.Close>
            <div className='mb-7 flex items-center justify-between gap-4 pr-10'>
              <Dialog.Title className='text-balance text-[26px] font-black uppercase leading-tight text-[#004080]'>
                Chi tiết độ phù hợp
              </Dialog.Title>
              <Button type='button' variant='ghost' size='icon' aria-label='Đọc chi tiết độ phù hợp' onClick={() => void speakAccessibleText(speechText)} className='size-10 shrink-0 rounded-full text-[#004080] hover:bg-[#EAF4FF]'>
                <Volume2 className='size-5' />
              </Button>
            </div>
            <Dialog.Description className='sr-only'>{match.job.title}</Dialog.Description>
            <div className='space-y-6'>
              {match.criteria.map((criterion) => {
                const description = getCriterionDescription(criterion)
                return (
                  <div key={criterion.key}>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='text-[15px] font-black uppercase tracking-[0.02em] text-[#004080]'>{criterion.label}</p>
                      <span className='rounded-full bg-[#EAF4FF] px-2 py-0.5 text-[11px] font-bold text-[#004080]' title='Trọng số áp dụng'>
                        {Math.round(criterion.weight * 100)}%
                      </span>
                      <span className='text-[13px] font-bold tabular-nums text-emerald-700'>{criterion.score}đ</span>
                      <button type='button' aria-label={`Đọc ${criterion.label}`} onClick={() => void speakAccessibleText(`${criterion.label}. Trọng số ${Math.round(criterion.weight * 100)} phần trăm. ${criterion.score} điểm. ${description}`)} className='text-[#004080] hover:text-[#003466]'>
                        <Volume2 className='size-4' />
                      </button>
                    </div>
                    <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#EAF4FF]'>
                      <div className='h-full rounded-full bg-[#004080]' style={{ width: `${Math.min(criterion.score, 100)}%` }} />
                    </div>
                    <p className='mt-1 text-pretty text-[14px] leading-6 text-[#334155]'>{description}</p>
                  </div>
                )
              })}
            </div>
            {match.accessibility.signals.length > 0 ? (
              <div className='mt-7 border-l-4 border-emerald-500 bg-emerald-50 p-4'>
                <p className='font-black text-emerald-900'>Khả năng tiếp cận: {match.accessibility.score}/100</p>
                <p className='mt-1 text-pretty text-sm text-emerald-900'>{match.accessibility.signals.join('. ')}</p>
              </div>
            ) : null}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function JobDiscoveryPage() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<JobRecord[]>([])
  const [matches, setMatches] = useState<Record<string, JobMatch>>({})
  const [cvId, setCvId] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [page, setPage] = useState(1)
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null)
  const [priorities, setPriorities] = useState<string[]>([])
  const [showPriority, setShowPriority] = useState(false)
  const [isRematching, setIsRematching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [applyingJobId, setApplyingJobId] = useState('')
  const [liveMessage, setLiveMessage] = useState('')
  const { audioBlob, isRecording, recorderError, startRecording, stopRecording } = useAudioRecorder()
  const transcribedBlobRef = useRef<Blob | null>(null)

  const loadJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await jobApi.list({ page: 1, limit: 50 })
      setJobs(response.data)
      try {
        const currentCv = await jobApi.getCurrentCv()
        setCvId(currentCv.id)
        if (response.data.length > 0) {
          const matchList = await jobApi.match(currentCv.id, response.data.map((job) => job.id))
          setMatches(Object.fromEntries(matchList.map((match) => [match.job.id, match])))
        }
      } catch {
        setLiveMessage('Bạn cần tạo CV để hệ thống tính điểm phù hợp bằng AI.')
      }
    } catch {
      toastifyCommon.error('Không thể tải danh sách công việc từ máy chủ.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadJobs()
  }, [loadJobs])

  useEffect(() => {
    if (!audioBlob || transcribedBlobRef.current === audioBlob) return
    transcribedBlobRef.current = audioBlob
    void speechApi
      .transcribe(audioBlob)
      .then((result) => {
        setSearch(result.transcript)
        setLiveMessage(`Đã nhận giọng nói: ${result.transcript}`)
      })
      .catch(() => setLiveMessage('Không thể nhận dạng giọng nói. Vui lòng thử lại.'))
  }, [audioBlob])

  useEffect(() => {
    if (recorderError) setLiveMessage(recorderError)
  }, [recorderError])

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('vi')
    return jobs.filter((job) => {
      const skills = getSkillNames(job)
      const searchMatch = !query || `${job.title} ${job.company.name} ${job.location} ${skills.join(' ')}`.toLocaleLowerCase('vi').includes(query)
      const skillMatch = filters.skill === ALL || skills.some((skill) => skill.toLocaleLowerCase('vi').includes(filters.skill.toLocaleLowerCase('vi')))
      const modeMatch = filters.workMode === ALL || job.workMode === filters.workMode
      const locationMatch = filters.location === ALL || job.location.toLocaleLowerCase('vi').includes(filters.location.toLocaleLowerCase('vi'))
      return searchMatch && skillMatch && modeMatch && locationMatch
    })
  }, [filters, jobs, search])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE))
  const visibleJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => setPage(1), [filters, search])

  const togglePriority = (key: string) => {
    setPriorities((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]))
  }

  const applyPriorities = async (override?: string[]) => {
    const nextPriorities = override ?? priorities
    if (!cvId || jobs.length === 0) {
      setLiveMessage('Bạn cần tạo CV để áp dụng tiêu chí ưu tiên.')
      return
    }
    setIsRematching(true)
    try {
      const matchList = await jobApi.match(cvId, jobs.map((job) => job.id), nextPriorities)
      setMatches(Object.fromEntries(matchList.map((match) => [match.job.id, match])))
      setLiveMessage('Đã cập nhật độ phù hợp theo tiêu chí ưu tiên của bạn.')
    } catch {
      toastifyCommon.error('Không thể cập nhật độ phù hợp. Vui lòng thử lại.')
    } finally {
      setIsRematching(false)
    }
  }

  const handleApply = async (jobId: string) => {
    if (!cvId) {
      navigate(ROUTE.DISABILITY.CV)
      return
    }
    setApplyingJobId(jobId)
    try {
      await jobApi.apply(jobId, cvId)
      toastifyCommon.success('Ứng tuyển thành công.')
      setLiveMessage('Ứng tuyển thành công.')
    } catch {
      toastifyCommon.error('Không thể ứng tuyển hoặc bạn đã ứng tuyển công việc này.')
    } finally {
      setApplyingJobId('')
    }
  }

  return (
    <section className='mx-auto w-full max-w-[1280px] bg-[#FAFAFA] px-4 py-7 text-black sm:px-6'>
      <h1 className='sr-only'>Tìm việc phù hợp</h1>
      <p className='sr-only' role='status' aria-live='polite'>{liveMessage}</p>
      <div className='space-y-5'>
        <div className='relative'>
          <Search className='absolute left-5 top-1/2 size-4 -translate-y-1/2 text-slate-600' aria-hidden='true' />
          <label htmlFor='job-search' className='sr-only'>Tìm kiếm công việc</label>
          <input
            id='job-search'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Tìm kiếm công việc...'
            className='h-[58px] w-full border border-slate-300 bg-white px-12 pr-24 text-sm outline-none placeholder:text-slate-500 focus:border-black focus:ring-2 focus:ring-black/10'
          />
          <div className='absolute right-3 top-1/2 flex -translate-y-1/2 gap-1'>
            <Button type='button' variant='ghost' size='icon' aria-label={isRecording ? 'Dừng nhập bằng giọng nói' : 'Tìm việc bằng giọng nói'} onClick={() => void (isRecording ? stopRecording() : startRecording())} className={cn('size-10', isRecording && 'bg-red-50 text-red-700')}>
              {isRecording ? <Loader2 className='size-4 animate-spin' /> : <Mic className='size-4' />}
            </Button>
            <Button type='button' variant='ghost' size='icon' aria-label='Đọc nội dung tìm kiếm' onClick={() => void speakAccessibleText(search || 'Nhập từ khóa để tìm kiếm công việc')} className='size-10'>
              <Volume2 className='size-4' />
            </Button>
          </div>
        </div>

        <div className='flex flex-wrap gap-4'>
          {filterDefinitions.map((filter) => (
            <DropdownMenu key={filter.key}>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='flex h-11 min-w-[230px] items-center justify-between border-slate-300 bg-white px-5 text-xs font-black uppercase hover:border-black hover:bg-white'>
                  <span className='truncate'>{filters[filter.key] === ALL ? filter.label : filters[filter.key]}</span>
                  <ChevronDown className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-[260px] rounded-none'>
                <DropdownMenuRadioGroup value={filters[filter.key]} onValueChange={(value) => setFilters((current) => ({ ...current, [filter.key]: value }))}>
                  {filter.options.map((option) => <DropdownMenuRadioItem key={option} value={option} className='rounded-none'>{option}</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
        <div>
          <button
            type='button'
            onClick={() => setShowPriority((current) => !current)}
            aria-expanded={showPriority}
            className='inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.04em] text-[#004080] hover:text-[#003466]'
          >
            <SlidersHorizontal className='size-4' />
            Tiêu chí ưu tiên của bạn
            {priorities.length > 0 ? (
              <span className='rounded-full bg-[#004080] px-2 py-0.5 text-[11px] font-bold text-white'>{priorities.length}</span>
            ) : null}
            <ChevronDown className={cn('size-4 transition', showPriority && 'rotate-180')} />
          </button>

          {showPriority ? (
            <div className='mt-3 border border-[#CFE3F7] bg-white p-4'>
              <p className='text-sm text-[#5A718B]'>
                Bấm chọn theo thứ tự quan trọng. Tiêu chí chọn trước nhận trọng số cao hơn khi tính độ phù hợp.
              </p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {MATCHING_CRITERIA.map((criterion) => {
                  const rank = priorities.indexOf(criterion.key)
                  const selected = rank >= 0
                  return (
                    <button
                      key={criterion.key}
                      type='button'
                      aria-pressed={selected}
                      onClick={() => togglePriority(criterion.key)}
                      className={cn(
                        'inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm font-semibold transition',
                        selected ? 'border-[#004080] bg-[#004080] text-white' : 'border-[#CFE3F7] bg-white text-[#33506E] hover:border-[#004080]'
                      )}
                    >
                      {selected ? (
                        <span className='inline-flex size-4 items-center justify-center rounded-full bg-white text-[11px] font-black text-[#004080]'>
                          {rank + 1}
                        </span>
                      ) : (
                        <Check className='size-3.5 opacity-30' />
                      )}
                      {criterion.label}
                    </button>
                  )
                })}
              </div>
              <div className='mt-4 flex flex-wrap items-center gap-3'>
                <Button type='button' onClick={() => void applyPriorities()} disabled={isRematching} className='gap-1.5 rounded-none bg-[#004080] text-xs font-black uppercase text-white hover:bg-[#003466]'>
                  {isRematching ? <Loader2 className='size-4 animate-spin' /> : null}
                  Áp dụng
                </Button>
                {priorities.length > 0 ? (
                  <Button type='button' variant='ghost' onClick={() => { setPriorities([]); void applyPriorities([]) }} className='text-xs font-bold uppercase text-[#5A718B]'>
                    Đặt lại mặc định
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className='h-[3px] bg-black' />
      </div>

      <div className='mt-8 space-y-4' aria-busy={isLoading}>
        {isLoading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className='h-[122px] animate-pulse border border-slate-200 bg-white' />) : null}
        <AnimatePresence mode='popLayout'>
          {!isLoading && visibleJobs.map((job) => {
            const match = matches[job.id]
            const description = `${job.title} tại ${job.company.name}, ${job.location}. ${match ? `Điểm phù hợp ${match.score} phần trăm.` : ''}`
            return (
              <motion.article key={job.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                <Card className='rounded-none border-slate-200 bg-white shadow-sm'>
                  <CardContent className='flex flex-col gap-5 p-5 md:flex-row md:items-center md:p-6'>
                    <JobLogo job={job} />
                    <div className='min-w-0 flex-1'>
                      <h2 className='line-clamp-2 text-balance text-[15px] font-black uppercase'>{job.title}</h2>
                      <p className='mt-2 truncate text-pretty text-xs font-medium text-slate-700'>{job.company.name} | {job.location}</p>
                    </div>
                    <div className='flex flex-wrap items-center gap-3 md:shrink-0'>
                      <Button type='button' disabled={!match} onClick={() => match && setSelectedMatch(match)} className='gap-1.5 rounded-md bg-emerald-600 px-4 text-xs font-black uppercase text-white hover:bg-emerald-700 disabled:opacity-70'>
                        <Volume2 className='size-3.5' aria-hidden='true' />
                        {match ? `${match.score}% phù hợp` : 'Cần tạo CV'}
                      </Button>
                      <Button type='button' onClick={() => void handleApply(job.id)} disabled={applyingJobId === job.id} className='h-12 min-w-[158px] rounded-none bg-black text-xs font-black uppercase text-white hover:bg-slate-800'>
                        {applyingJobId === job.id ? <Loader2 className='size-4 animate-spin' /> : 'Ứng tuyển'}
                      </Button>
                      <Button type='button' variant='ghost' size='icon' aria-label={`Đọc công việc ${job.title}`} onClick={() => void speakAccessibleText(description)} className='size-10'>
                        <Volume2 className='size-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.article>
            )
          })}
        </AnimatePresence>
        {!isLoading && visibleJobs.length === 0 ? (
          <div className='border border-slate-200 bg-white p-10 text-center'>
            <p className='font-bold'>Không tìm thấy công việc phù hợp.</p>
            <Button type='button' variant='outline' onClick={() => { setSearch(''); setFilters(initialFilters) }} className='mt-4'>Xóa bộ lọc</Button>
          </div>
        ) : null}
      </div>

      <nav className='mt-9 flex justify-end gap-2' aria-label='Phân trang công việc'>
        <Button type='button' variant='outline' size='icon' aria-label='Trang trước' disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className='size-9 rounded-none'><ChevronsLeft className='size-4' /></Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map((item) => (
          <Button key={item} type='button' variant={item === page ? 'default' : 'outline'} aria-label={`Trang ${item}`} aria-current={item === page ? 'page' : undefined} onClick={() => setPage(item)} className='size-9 rounded-none p-0 tabular-nums'>{item}</Button>
        ))}
        <Button type='button' variant='outline' size='icon' aria-label='Trang sau' disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className='size-9 rounded-none'><ChevronsRight className='size-4' /></Button>
      </nav>

      <MatchDialog match={selectedMatch} open={Boolean(selectedMatch)} onOpenChange={(open) => !open && setSelectedMatch(null)} />
    </section>
  )
}
