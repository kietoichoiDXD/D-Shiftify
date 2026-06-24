import { type ComponentType, type ReactNode } from 'react'

import {
  Accessibility,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Filter,
  GraduationCap,
  Headphones,
  Mail,
  MapPin,
  Mic,
  MonitorCheck,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Users,
  Volume2
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTE } from '@/core/constants/path'
import { cn } from '@/core/lib/utils'
import {
  prototypeCandidates,
  prototypeClasses,
  prototypeJobs,
  prototypeMessages,
  prototypeNotifications,
  prototypeSchedule,
  type PrototypeCandidate,
  type PrototypeJob
} from '@/pages/_shared/prototype-data'

const scoreTone = (score: number) => {
  if (score >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (score >= 80) return 'bg-sky-100 text-sky-800 border-sky-200'
  return 'bg-amber-100 text-amber-800 border-amber-200'
}

function PageShell({
  eyebrow,
  title,
  description,
  action,
  children
}: {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className='mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between'>
        <div className='max-w-3xl'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-[#006EFF]'>{eyebrow}</p>
          <h1 className='mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl'>{title}</h1>
          <p className='mt-3 text-sm leading-6 text-slate-600 sm:text-base'>{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon
}: {
  label: string
  value: string
  note: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
      <CardContent className='flex items-start justify-between p-5'>
        <div>
          <p className='text-sm font-medium text-slate-500'>{label}</p>
          <p className='mt-2 text-3xl font-black text-slate-950'>{value}</p>
          <p className='mt-2 text-xs leading-5 text-slate-500'>{note}</p>
        </div>
        <span className='flex h-10 w-10 items-center justify-center rounded-md bg-[#EAF4FF] text-[#006EFF]'>
          <Icon className='h-5 w-5' />
        </span>
      </CardContent>
    </Card>
  )
}

function MatchBadge({ score }: { score: number }) {
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-bold', scoreTone(score))}>
      {score}% match
    </span>
  )
}

function JobCard({ job, compact = false }: { job: PrototypeJob; compact?: boolean }) {
  return (
    <article className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-lg font-black text-slate-950'>{job.title}</h2>
            <MatchBadge score={job.match} />
          </div>
          <p className='mt-1 text-sm font-medium text-slate-600'>{job.company}</p>
          <div className='mt-3 flex flex-wrap gap-2 text-xs text-slate-600'>
            <span className='inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1'>
              <MapPin className='h-3.5 w-3.5' /> {job.location}
            </span>
            <span className='rounded-md bg-slate-100 px-2 py-1'>{job.mode}</span>
            <span className='rounded-md bg-slate-100 px-2 py-1'>{job.salary}</span>
          </div>
        </div>
        <Button asChild className='rounded-md bg-slate-950 text-white hover:bg-slate-800'>
          <Link to={ROUTE.DISABILITY.JOB_DETAIL.replace(':id', job.id)}>
            Chi tiet <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </div>

      {!compact ? (
        <div className='mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]'>
          <div>
            <p className='text-xs font-bold uppercase text-slate-500'>Kỹ năng</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {job.skills.map((skill) => (
                <span key={skill} className='rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold'>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className='text-xs font-bold uppercase text-slate-500'>Ho tro tiep can</p>
            <div className='mt-2 flex flex-wrap gap-2'>
              {job.supports.map((support) => (
                <span key={support} className='rounded-md bg-[#EAF4FF] px-2 py-1 text-xs font-semibold text-[#004080]'>
                  {support}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}

function CandidateCard({ candidate }: { candidate: PrototypeCandidate }) {
  return (
    <article className='rounded-lg border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-lg font-black text-slate-950'>{candidate.name}</h2>
            <MatchBadge score={candidate.match} />
          </div>
          <p className='mt-1 text-sm text-slate-600'>{candidate.role}</p>
          <p className='mt-2 text-xs font-semibold uppercase text-slate-500'>
            {candidate.disability} · {candidate.location}
          </p>
        </div>
        <Button asChild variant='outline' className='rounded-md border-slate-300'>
          <Link to={ROUTE.BUSINESS.CANDIDATE_DETAIL.replace(':id', candidate.id)}>Mở hồ sơ</Link>
        </Button>
      </div>
      <div className='mt-4 flex flex-wrap gap-2'>
        {candidate.skills.map((skill) => (
          <span key={skill} className='rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold'>
            {skill}
          </span>
        ))}
      </div>
      <div className='mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600'>
        {candidate.notes[0]}
      </div>
    </article>
  )
}

function PriorityPanel() {
  const items = [
    ['2', 'Điều kiện làm việc'],
    ['1', 'Mục tiêu nghề nghiệp'],
    ['3', 'Kỹ năng cứng'],
    ['', 'Kinh nghiệm làm việc'],
    ['', 'Thiết bị hiện có'],
    ['', 'Kỹ năng mềm'],
    ['', 'Chứng chỉ'],
    ['', 'Trường phụ']
  ]

  return (
    <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base font-black'>
          <SlidersHorizontal className='h-5 w-5 text-[#006EFF]' /> Ưu tiên matching
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        {items.map(([rank, label]) => (
          <button
            key={label}
            type='button'
            className='flex w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-left text-sm font-bold text-slate-800 hover:border-[#006EFF]'
          >
            <span className='flex items-center gap-3'>
              {rank ? <span className='flex h-9 w-7 items-center justify-center bg-slate-950 text-white'>{rank}</span> : null}
              {label}
            </span>
            <Volume2 className='h-4 w-4 text-slate-500' />
          </button>
        ))}
        <div className='grid grid-cols-2 gap-3 pt-4'>
          <Button variant='outline' className='rounded-md border-slate-950'>Quay lại</Button>
          <Button className='rounded-md bg-slate-950 text-white'>Matching</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function CandidateJobsPrototype() {
  return (
    <PageShell
      eyebrow='UC11 + UC12'
      title='Tìm việc và lọc matching'
      description='Prototype theo Figma: danh sách việc làm, bộ lọc, điểm phù hợp và popup ưu tiên matching.'
      action={
        <Button className='rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'>
          <Mic className='mr-2 h-4 w-4' /> Tìm bằng giọng nói
        </Button>
      }
    >
      <div className='grid gap-6 lg:grid-cols-[300px_1fr]'>
        <aside className='space-y-4'>
          <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
            <CardContent className='space-y-4 p-5'>
              <label className='block text-sm font-bold text-slate-700' htmlFor='job-search'>Tìm kiếm công việc</label>
              <div className='flex items-center rounded-md border border-slate-300 px-3'>
                <Search className='h-4 w-4 text-slate-400' />
                <input id='job-search' className='h-11 w-full bg-transparent px-2 text-sm outline-none' defaultValue='Backend Developer' />
              </div>
              <div className='grid gap-2'>
                {['Remote', 'Có bảo hiểm', 'Flexible hours', 'Hỗ trợ screen reader'].map((filter) => (
                  <label key={filter} className='flex items-center gap-2 text-sm text-slate-700'>
                    <input type='checkbox' defaultChecked className='h-4 w-4 accent-[#006EFF]' />
                    {filter}
                  </label>
                ))}
              </div>
              <Button variant='outline' className='w-full rounded-md border-slate-300'>
                <Filter className='mr-2 h-4 w-4' /> Áp dụng bộ lọc
              </Button>
            </CardContent>
          </Card>
          <PriorityPanel />
        </aside>
        <div className='space-y-4'>
          {prototypeJobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </div>
    </PageShell>
  )
}

export function CandidateJobDetailPrototype() {
  const job = prototypeJobs[0]
  return (
    <PageShell
      eyebrow='UC16'
      title='Chi tiết công việc'
      description='Màn hình review JD trước khi ứng tuyển, có lý do matching và thông tin tiếp cận.'
      action={<Button className='rounded-md bg-slate-950 text-white'>Ứng tuyển</Button>}
    >
      <div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
        <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='text-2xl font-black text-slate-950'>{job.title}</h2>
              <MatchBadge score={job.match} />
            </div>
            <p className='mt-2 text-slate-600'>{job.company} · {job.location} · {job.mode}</p>
            <div className='mt-6 grid gap-5 md:grid-cols-2'>
              <InfoBlock icon={BriefcaseBusiness} title='Mục tiêu nghề nghiệp' items={['Xây dựng REST API và module tuyển dụng', 'Làm việc remote với team product']} />
              <InfoBlock icon={MonitorCheck} title='Thiết bị và môi trường' items={job.supports} />
              <InfoBlock icon={ShieldCheck} title='Điều kiện làm việc' items={['Bảo hiểm sức khỏe', 'Giờ làm linh hoạt', 'Onboarding có mentor']} />
              <InfoBlock icon={Sparkles} title='Kỹ năng yêu cầu' items={job.skills} />
            </div>
          </CardContent>
        </Card>
        <MatchReasonPanel job={job} />
      </div>
    </PageShell>
  )
}

function InfoBlock({
  icon: Icon,
  title,
  items
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  items: string[]
}) {
  return (
    <div className='rounded-lg border border-slate-200 bg-slate-50 p-4'>
      <h3 className='flex items-center gap-2 text-sm font-black text-slate-950'>
        <Icon className='h-4 w-4 text-[#006EFF]' /> {title}
      </h3>
      <ul className='mt-3 space-y-2 text-sm text-slate-600'>
        {items.map((item) => (
          <li key={item} className='flex gap-2'>
            <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-600' />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MatchReasonPanel({ job }: { job: PrototypeJob }) {
  return (
    <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base font-black text-[#004080]'>
          <Headphones className='h-5 w-5' /> Chi tiết độ phù hợp
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {job.reasons.map((reason, index) => (
          <div key={reason} className='rounded-md bg-[#F8FBFF] p-3'>
            <p className='text-xs font-black uppercase text-[#006EFF]'>Tiêu chí {index + 1}</p>
            <p className='mt-1 text-sm text-slate-700'>{reason}</p>
          </div>
        ))}
        <Button asChild className='w-full rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'>
          <Link to={ROUTE.DISABILITY.JOB_MATCH_DETAIL.replace(':id', job.id)}>Xem giải thích AI</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function CandidateMatchDetailPrototype() {
  return (
    <PageShell
      eyebrow='Popup Matching'
      title='Giải thích điểm phù hợp'
      description='Mô phỏng modal trong Figma: AI giải thích theo kinh nghiệm, kỹ năng, chứng chỉ và địa chỉ.'
    >
      <div className='mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 shadow-lg'>
        <div className='flex items-center justify-between border-b border-slate-100 pb-4'>
          <h2 className='text-xl font-black text-[#004080]'>Chi tiết độ phù hợp</h2>
          <MatchBadge score={96} />
        </div>
        <div className='mt-5 space-y-3'>
          {[
            ['Kinh nghiệm', 'Từng làm Backend Intern và Backend Developer, phù hợp vai trò hiện tại.'],
            ['Kỹ năng', 'NodeJS và PostgreSQL khớp trực tiếp với yêu cầu công việc.'],
            ['Chứng chỉ', 'AWS Cloud Practitioner hỗ trợ điểm cloud deployment.'],
            ['Địa chỉ', 'Remote nên không phụ thuộc khoảng cách di chuyển.']
          ].map(([title, body]) => (
            <div key={title} className='rounded-md bg-[#F8FBFF] p-4'>
              <p className='text-sm font-black uppercase text-[#004080]'>{title}</p>
              <p className='mt-1 text-sm text-slate-600'>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}

export function CandidateApplicationsPrototype() {
  return (
    <PageShell eyebrow='UC17' title='Ứng viên ứng tuyển' description='Theo dõi trạng thái hồ sơ đã nộp và hành động tiếp theo.'>
      <div className='grid gap-4'>
        {prototypeJobs.map((job) => (
          <JobCard key={job.id} job={job} compact />
        ))}
      </div>
    </PageShell>
  )
}

export function CandidateNotificationsPrototype() {
  return (
    <PageShell eyebrow='Thông báo' title='Thông báo của bạn' description='Cập nhật từ nhà tuyển dụng, AI coach và trung tâm đào tạo.'>
      <div className='grid gap-4 md:grid-cols-3'>
        {prototypeNotifications.map((item) => (
          <Card key={item.id} className='rounded-lg border-slate-200 bg-white shadow-sm'>
            <CardContent className='p-5'>
              <span className='inline-flex rounded-md bg-[#EAF4FF] px-2 py-1 text-xs font-bold text-[#004080]'>{item.type}</span>
              <h2 className='mt-4 text-lg font-black text-slate-950'>{item.title}</h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

export function MessagesPrototype({ audience = 'candidate' }: { audience?: 'candidate' | 'business' }) {
  return (
    <PageShell
      eyebrow='UC18 - UC21'
      title={audience === 'business' ? 'Tin nhắn ứng viên' : 'Tin nhắn nhà tuyển dụng'}
      description='Prototype hộp thư, message detail và quick reply có hỗ trợ audio/text.'
    >
      <div className='grid min-h-[620px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[340px_1fr]'>
        <aside className='border-b border-slate-200 lg:border-b-0 lg:border-r'>
          <div className='border-b border-slate-200 p-4'>
            <div className='flex items-center rounded-md border border-slate-300 px-3'>
              <Search className='h-4 w-4 text-slate-400' />
              <input className='h-10 w-full bg-transparent px-2 text-sm outline-none' placeholder='Tìm cuộc trò chuyện' />
            </div>
          </div>
          {prototypeMessages.map((message) => (
            <button key={message.id} type='button' className='flex w-full gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50'>
              <span className='flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-sm font-bold text-white'>
                {message.sender.slice(0, 2).toUpperCase()}
              </span>
              <span className='min-w-0 flex-1'>
                <span className='flex items-center justify-between gap-2'>
                  <span className='truncate text-sm font-black text-slate-950'>{message.sender}</span>
                  <span className='text-xs text-slate-400'>{message.time}</span>
                </span>
                <span className='mt-1 line-clamp-2 text-xs leading-5 text-slate-500'>{message.preview}</span>
              </span>
            </button>
          ))}
        </aside>
        <section className='flex flex-col'>
          <div className='flex items-center justify-between border-b border-slate-200 p-4'>
            <div>
              <h2 className='font-black text-slate-950'>ABC Software</h2>
              <p className='text-xs text-slate-500'>Đang online · Phỏng vấn trực tuyến</p>
            </div>
            <Button variant='outline' className='rounded-md border-slate-300'>
              <CalendarDays className='mr-2 h-4 w-4' /> Hẹn lịch
            </Button>
          </div>
          <div className='flex-1 space-y-4 bg-[#F8FBFF] p-5'>
            <Bubble text='Chào Thư, công ty đã xem CV Backend Developer của bạn.' />
            <Bubble own text='Em cảm ơn anh/chị. Em có thể phỏng vấn online vào thứ Sáu.' />
            <Bubble text='Tốt quá. Bên mình sẽ gửi link Google Meet và caption transcript trước 30 phút.' />
          </div>
          <div className='flex items-center gap-2 border-t border-slate-200 p-4'>
            <Button variant='outline' className='h-10 w-10 rounded-md border-slate-300 p-0' aria-label='Voice message'>
              <Mic className='h-4 w-4' />
            </Button>
            <input className='h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#006EFF]' placeholder='Nhập tin nhắn...' />
            <Button className='h-10 rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'>
              <Send className='h-4 w-4' />
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  )
}

function Bubble({ text, own = false }: { text: string; own?: boolean }) {
  return (
    <div className={cn('flex', own ? 'justify-end' : 'justify-start')}>
      <p className={cn('max-w-[72%] rounded-lg px-4 py-3 text-sm leading-6', own ? 'bg-[#006EFF] text-white' : 'bg-white text-slate-700 shadow-sm')}>
        {text}
      </p>
    </div>
  )
}

export function CandidateProfilePrototype() {
  return (
    <PageShell eyebrow='UC3 + UC4' title='Hồ sơ và CV ứng viên' description='Thông tin cá nhân, thiết bị hiện có, CV và mức độ sẵn sàng ứng tuyển.'>
      <div className='grid gap-6 lg:grid-cols-[340px_1fr]'>
        <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex h-20 w-20 items-center justify-center rounded-lg bg-slate-950 text-2xl font-black text-white'>TA</div>
            <h2 className='mt-4 text-xl font-black text-slate-950'>Nguyễn Anh Thư</h2>
            <p className='text-sm text-slate-500'>Backend Developer · Đà Nẵng</p>
            <div className='mt-5 space-y-3 text-sm text-slate-600'>
              <p className='flex items-center gap-2'><Mail className='h-4 w-4 text-[#006EFF]' /> thu.nguyen@example.com</p>
              <p className='flex items-center gap-2'><Accessibility className='h-4 w-4 text-[#006EFF]' /> Remote, flexible hours</p>
              <p className='flex items-center gap-2'><MonitorCheck className='h-4 w-4 text-[#006EFF]' /> Laptop, headset, internet</p>
            </div>
            <Button asChild className='mt-6 w-full rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'>
              <Link to={ROUTE.DISABILITY.PROFILE_UPDATE}>Cập nhật hồ sơ</Link>
            </Button>
          </CardContent>
        </Card>
        <div className='grid gap-4 md:grid-cols-2'>
          <InfoBlock icon={BriefcaseBusiness} title='Kinh nghiệm' items={['ABC Software - Backend Intern', 'XYZ Technology - Backend Developer']} />
          <InfoBlock icon={Sparkles} title='Kỹ năng' items={['NodeJS', 'PostgreSQL', 'Communication', 'REST API']} />
          <InfoBlock icon={FileText} title='Chứng chỉ' items={['TOEIC 650', 'AWS Cloud Practitioner']} />
          <InfoBlock icon={ClipboardList} title='CV readiness' items={['Hoàn thiện 85%', 'Đã có project Shiftify', 'Cần thêm portfolio URL']} />
        </div>
      </div>
    </PageShell>
  )
}

export function BusinessJobsPrototype() {
  return (
    <PageShell
      eyebrow='UC8'
      title='Quản lý tin tuyển dụng'
      description='Danh sách JD, điểm accessibility và trạng thái tuyển dụng.'
      action={<Button asChild className='rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'><Link to={ROUTE.BUSINESS.JOB_CREATE}>Tạo job</Link></Button>}
    >
      <div className='grid gap-4'>
        {prototypeJobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    </PageShell>
  )
}

export function BusinessCandidatesPrototype({ matched = false }: { matched?: boolean }) {
  return (
    <PageShell
      eyebrow={matched ? 'UC13' : 'UC17'}
      title={matched ? 'Gợi ý ứng viên' : 'Ứng viên đã ứng tuyển'}
      description='Review hồ sơ, điểm match và điều kiện tiếp cận trước khi chấp nhận/phỏng vấn.'
    >
      <div className='grid gap-4'>
        {prototypeCandidates.map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} />)}
      </div>
    </PageShell>
  )
}

export function BusinessCandidateDetailPrototype() {
  const candidate = prototypeCandidates[0]
  return (
    <PageShell
      eyebrow='Chi tiết ứng viên'
      title={candidate.name}
      description='Màn hình review CV, thiết bị, skill gap và hành động accept/reject.'
      action={<Button className='rounded-md bg-slate-950 text-white'>Chấp nhận phỏng vấn</Button>}
    >
      <div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
        <div className='grid gap-4 md:grid-cols-2'>
          <InfoBlock icon={UserCheck} title='Tổng quan' items={[candidate.role, candidate.location, candidate.disability]} />
          <InfoBlock icon={Sparkles} title='Kỹ năng' items={candidate.skills} />
          <InfoBlock icon={MonitorCheck} title='Thiết bị' items={candidate.devices} />
          <InfoBlock icon={FileText} title='Nhận xét AI' items={candidate.notes} />
        </div>
        <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
          <CardContent className='p-5'>
            <MatchBadge score={candidate.match} />
            <h2 className='mt-4 text-lg font-black text-slate-950'>Quyết định tuyển dụng</h2>
            <p className='mt-2 text-sm leading-6 text-slate-600'>Ứng viên phù hợp job Backend Developer. Nên phỏng vấn online, có câu hỏi về PostgreSQL optimization và REST API security.</p>
            <div className='mt-5 grid grid-cols-2 gap-3'>
              <Button variant='outline' className='rounded-md border-slate-300'>Từ chối</Button>
              <Button className='rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'>Nhận</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export function SchedulePrototype() {
  return (
    <PageShell eyebrow='Lịch trình' title='Lịch phỏng vấn và sự kiện' description='Quản lý lịch phỏng vấn, mentor session và call với ứng viên.'>
      <div className='grid gap-4 md:grid-cols-3'>
        {prototypeSchedule.map((event) => (
          <Card key={event.id} className='rounded-lg border-slate-200 bg-white shadow-sm'>
            <CardContent className='p-5'>
              <CalendarDays className='h-6 w-6 text-[#006EFF]' />
              <h2 className='mt-4 text-lg font-black text-slate-950'>{event.title}</h2>
              <p className='mt-2 text-sm text-slate-600'>{event.time}</p>
              <p className='mt-1 text-xs font-bold uppercase text-slate-500'>{event.owner}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

export function BusinessProfilePrototype({ edit = false }: { edit?: boolean }) {
  return (
    <PageShell
      eyebrow='UC9'
      title={edit ? 'Cập nhật hồ sơ doanh nghiệp' : 'Hồ sơ doanh nghiệp'}
      description='Thông tin công ty, chính sách hòa nhập và cấu hình tuyển dụng.'
    >
      <div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
        <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
          <CardContent className='grid gap-4 p-6 md:grid-cols-2'>
            {['Tên công ty', 'Lĩnh vực', 'Quy mô', 'Địa chỉ', 'Website', 'Người phụ trách'].map((label) => (
              <label key={label} className='grid gap-2 text-sm font-bold text-slate-700'>
                {label}
                <input className='h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#006EFF]' defaultValue={label === 'Tên công ty' ? 'ABC Software' : ''} readOnly={!edit} />
              </label>
            ))}
          </CardContent>
        </Card>
        <InfoBlock icon={ShieldCheck} title='Chính sách hòa nhập' items={['Remote onboarding', 'Phỏng vấn có caption', 'Workspace không rào cản', 'Bảo hiểm sức khỏe']} />
      </div>
    </PageShell>
  )
}

export function EducatorDashboardPrototype() {
  return (
    <PageShell
      eyebrow='Educator'
      title='Dashboard trung tâm đào tạo'
      description='Theo dõi lớp học, học viên và mức độ tiếp cận của tài liệu.'
      action={<Button asChild className='rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'><Link to={ROUTE.EDUCATOR.CLASS_CREATE}>Tạo lớp</Link></Button>}
    >
      <div className='mb-6 grid gap-4 md:grid-cols-4'>
        <MetricCard icon={GraduationCap} label='Lớp đang mở' value='8' note='2 lớp sắp khai giảng' />
        <MetricCard icon={Users} label='Học viên' value='146' note='38 học viên NKT' />
        <MetricCard icon={BookOpen} label='Tài liệu' value='52' note='44 có transcript' />
        <MetricCard icon={Accessibility} label='AA ready' value='91%' note='Theo checklist accessibility' />
      </div>
      <div className='grid gap-4 md:grid-cols-2'>
        {prototypeClasses.map((item) => (
          <Card key={item.id} className='rounded-lg border-slate-200 bg-white shadow-sm'>
            <CardContent className='p-5'>
              <span className='rounded-md bg-[#EAF4FF] px-2 py-1 text-xs font-bold text-[#004080]'>{item.status}</span>
              <h2 className='mt-4 text-lg font-black text-slate-950'>{item.title}</h2>
              <p className='mt-2 text-sm text-slate-600'>{item.schedule}</p>
              <p className='mt-2 text-sm text-slate-600'>{item.accessibility}</p>
              <p className='mt-3 text-xs font-bold uppercase text-slate-500'>{item.students} học viên</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

export function EducatorFormPrototype({ profile = false }: { profile?: boolean }) {
  return (
    <PageShell
      eyebrow={profile ? 'UC9' : 'UC10'}
      title={profile ? 'Cập nhật hồ sơ trung tâm' : 'Tạo lớp học'}
      description='Form prototype có mock data, sẵn sàng nối API khi backend hoàn tất.'
    >
      <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
        <CardContent className='grid gap-4 p-6 md:grid-cols-2'>
          {[
            profile ? 'Tên trung tâm' : 'Tên lớp',
            'Mô tả',
            'Lịch học',
            'Hình thức',
            'Hỗ trợ tiếp cận',
            'Người phụ trách'
          ].map((label) => (
            <label key={label} className='grid gap-2 text-sm font-bold text-slate-700'>
              {label}
              <input className='h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#006EFF]' placeholder={`Nhập ${label.toLowerCase()}`} />
            </label>
          ))}
          <div className='md:col-span-2'>
            <Button className='rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'>Lưu prototype</Button>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function NotificationDetailPrototype() {
  const item = prototypeNotifications[0]
  return (
    <PageShell eyebrow='Chi tiết thông báo' title={item.title} description='Nội dung và hành động tiếp theo.'>
      <div className='mx-auto max-w-2xl'>
        <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
          <CardContent className='space-y-4 p-6'>
            <span className='inline-flex rounded-md bg-[#EAF4FF] px-2 py-1 text-xs font-bold text-[#004080]'>{item.type}</span>
            <h2 className='text-xl font-black text-slate-950'>{item.title}</h2>
            <p className='text-sm leading-6 text-slate-600'>{item.body}</p>
            <div className='flex gap-3 pt-2'>
              <Button className='rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'>Xem chi tiết</Button>
              <Button variant='outline' className='rounded-md border-slate-300'>Đánh dấu đã đọc</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}

export function AccountSettingsPrototype() {
  return (
    <PageShell
      eyebrow='Tài khoản'
      title='Cài đặt tài khoản'
      description='Quản lý thông tin cá nhân, mật khẩu và tùy chọn truy cập.'
    >
      <div className='mx-auto max-w-2xl space-y-6'>
        <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
          <CardHeader>
            <CardTitle className='text-base font-black'>Thông tin tài khoản</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            {['Họ và tên', 'Email', 'Số điện thoại'].map((label) => (
              <label key={label} className='grid gap-2 text-sm font-bold text-slate-700'>
                {label}
                <input className='h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#006EFF]' placeholder={`Nhập ${label.toLowerCase()}`} />
              </label>
            ))}
          </CardContent>
        </Card>
        <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
          <CardHeader>
            <CardTitle className='text-base font-black'>Đổi mật khẩu</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-4'>
            {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'].map((label) => (
              <label key={label} className='grid gap-2 text-sm font-bold text-slate-700'>
                {label}
                <input type='password' className='h-11 rounded-md border border-slate-300 px-3 font-normal outline-none focus:border-[#006EFF]' placeholder={label} />
              </label>
            ))}
          </CardContent>
        </Card>
        <div className='flex justify-end gap-3'>
          <Button variant='outline' className='rounded-md border-slate-300'>Hủy</Button>
          <Button className='rounded-md bg-[#006EFF] text-white hover:bg-[#0056c7]'>Lưu thay đổi</Button>
        </div>
      </div>
    </PageShell>
  )
}

export function CallPrototype({ video = false }: { video?: boolean }) {
  return (
    <PageShell
      eyebrow={video ? 'Video call' : 'Audio call'}
      title={video ? 'Phỏng vấn trực tuyến' : 'Cuộc gọi âm thanh'}
      description='Prototype cho buổi phỏng vấn có caption, transcript và điều khiển truy cập.'
    >
      <div className='grid gap-6 lg:grid-cols-[1fr_340px]'>
        <section className='min-h-[520px] rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-black'>ABC Software · Backend Developer</h2>
              <p className='text-sm text-slate-300'>Đang ghi transcript và caption thời gian thực</p>
            </div>
            <span className='rounded-md bg-emerald-500 px-2 py-1 text-xs font-bold text-white'>Live</span>
          </div>
          <div className='mt-8 grid min-h-[320px] place-items-center rounded-lg bg-slate-900'>
            {video ? (
              <div className='grid h-full w-full grid-cols-1 gap-4 p-4 sm:grid-cols-2'>
                {['Recruiter', 'Nguyen Anh Thu'].map((name) => (
                  <div key={name} className='grid place-items-center rounded-lg bg-slate-800'>
                    <div className='text-center'>
                      <div className='mx-auto grid h-20 w-20 place-items-center rounded-lg bg-[#006EFF] text-2xl font-black'>
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      <p className='mt-3 text-sm font-bold'>{name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center'>
                <div className='mx-auto grid h-28 w-28 place-items-center rounded-lg bg-[#006EFF]'>
                  <Headphones className='h-12 w-12' />
                </div>
                <p className='mt-4 text-sm font-bold'>Đang kết nối audio chat</p>
              </div>
            )}
          </div>
          <div className='mt-5 flex flex-wrap justify-center gap-3'>
            <Button variant='outline' className='rounded-md border-white/20 bg-white/10 text-white hover:bg-white/20'>
              <Mic className='mr-2 h-4 w-4' /> Mic
            </Button>
            <Button variant='outline' className='rounded-md border-white/20 bg-white/10 text-white hover:bg-white/20'>
              <Volume2 className='mr-2 h-4 w-4' /> Loa
            </Button>
            <Button className='rounded-md bg-red-600 text-white hover:bg-red-700'>Kết thúc</Button>
          </div>
        </section>
        <aside className='space-y-4'>
          <InfoBlock icon={Accessibility} title='Hỗ trợ phỏng vấn' items={['Caption realtime', 'Transcript sau cuộc gọi', 'Gửi câu hỏi trước buổi phỏng vấn']} />
          <Card className='rounded-lg border-slate-200 bg-white shadow-sm'>
            <CardContent className='p-5'>
              <h2 className='font-black text-slate-950'>Caption</h2>
              <p className='mt-3 rounded-md bg-[#F8FBFF] p-3 text-sm leading-6 text-slate-600'>
                Recruiter: Bạn có thể chia sẻ về cách bạn tối ưu query PostgreSQL trong dự án gần đây không?
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  )
}
