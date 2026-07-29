import { useEffect, useMemo, useState } from 'react'

import { Check, Loader2, Mic, Plus, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ROUTE } from '@/core/constants/path'
import toastifyCommon from '@/core/lib/toastify-common'
import { cn } from '@/core/lib/utils'
import { jobApi } from '@/core/services/job.service'
import { speakAccessibleText } from '@/core/services/speech.service'

type FormState = {
  title: string
  workMode: 'remote' | 'onsite' | 'hybrid'
  experience: string
  certificates: string
  hardSkills: string
  softSkills: string
  location: string
  salaryMin: string
  salaryMax: string
  workingTime: 'full_time' | 'part_time'
  description: string
}

const initialForm: FormState = {
  title: '',
  workMode: 'remote',
  experience: 'Không yêu cầu',
  certificates: '',
  hardSkills: '',
  softSkills: '',
  location: '',
  salaryMin: '',
  salaryMax: '',
  workingTime: 'full_time',
  description: ''
}

const splitSkills = (value: string, required: boolean) =>
  value.split(',').map((name) => name.trim()).filter(Boolean).map((name) => ({ name, required }))

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <div className='mb-2 flex items-center gap-1'>
      <label htmlFor={htmlFor} className='text-xs font-black'>{children}</label>
      <Button type='button' variant='ghost' size='icon' aria-label={`Đọc nhãn ${children}`} onClick={() => void speakAccessibleText(children)} className='size-6'>
        <Volume2 className='size-3' />
      </Button>
    </div>
  )
}

const fieldClassName = 'h-11 w-full border border-slate-300 bg-white px-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10'

export function BusinessJobCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(initialForm)
  const [devices, setDevices] = useState<Array<{ id: string; name: string }>>([])
  const [selectedDevices, setSelectedDevices] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    void jobApi.assistiveDevices().then((items) => {
      setDevices(items)
      if (items[0]) setSelectedDevices([items[0].id])
    }).catch(() => setError('Không thể tải danh sách thiết bị trợ năng.'))
  }, [])

  const skills = useMemo(() => [...splitSkills(form.hardSkills, true), ...splitSkills(form.softSkills, false)], [form.hardSkills, form.softSkills])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    const salaryMin = Number(form.salaryMin)
    const salaryMax = Number(form.salaryMax)
    if (!form.title.trim() || !form.location.trim() || !form.description.trim()) {
      setError('Vui lòng nhập tên công việc, địa điểm và mô tả công việc.')
      return
    }
    if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMax < salaryMin) {
      setError('Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu.')
      return
    }
    if (skills.length === 0 || selectedDevices.length === 0) {
      setError('Vui lòng thêm ít nhất một kỹ năng và một thiết bị trợ năng được hỗ trợ.')
      return
    }

    setIsSubmitting(true)
    try {
      await jobApi.create({
        title: form.title.trim(),
        description: [form.description.trim(), form.certificates ? `Chứng chỉ: ${form.certificates}` : ''].filter(Boolean).join('\n'),
        job_type: form.workingTime,
        work_mode: form.workMode,
        experience_required: form.experience,
        skills,
        salary_min: salaryMin,
        salary_max: salaryMax,
        location: form.location.trim(),
        latitude: 0,
        longitude: 0,
        working_time: form.workingTime,
        status: 'open',
        assistive_devices: selectedDevices
      })
      toastifyCommon.success('Đã tạo công việc mới.')
      navigate(ROUTE.BUSINESS.JOBS)
    } catch {
      setError('Không thể tạo công việc. Hãy đăng nhập bằng tài khoản nhà tuyển dụng và hoàn thiện hồ sơ doanh nghiệp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='mx-auto w-full max-w-[780px] px-4 py-8 sm:px-6'>
      <form onSubmit={submit} className='bg-[#FAFAFA] p-5 sm:p-8'>
        <h1 className='mb-7 text-balance text-3xl font-black uppercase'>Tạo việc</h1>
        <div className='grid gap-5 md:grid-cols-2'>
          <div className='md:col-span-2'>
            <FieldLabel htmlFor='job-title'>Tên công việc</FieldLabel>
            <div className='relative'>
              <input id='job-title' value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder='Ví dụ: Nhân viên thiết kế đồ họa' className={cn(fieldClassName, 'pr-20')} required />
              <div className='absolute right-2 top-1/2 flex -translate-y-1/2'>
                <Button type='button' variant='ghost' size='icon' aria-label='Nhập tên công việc bằng giọng nói' className='size-8'><Mic className='size-4' /></Button>
                <Button type='button' variant='ghost' size='icon' aria-label='Đọc tên công việc' onClick={() => void speakAccessibleText(form.title || 'Tên công việc')} className='size-8'><Volume2 className='size-4' /></Button>
              </div>
            </div>
          </div>

          <div>
            <FieldLabel htmlFor='work-mode'>Hình thức</FieldLabel>
            <select id='work-mode' value={form.workMode} onChange={(event) => setField('workMode', event.target.value as FormState['workMode'])} className={fieldClassName}>
              <option value='remote'>Online</option><option value='onsite'>Offline</option><option value='hybrid'>Hybrid</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor='devices'>Yêu cầu thiết bị</FieldLabel>
            <div id='devices' className='flex min-h-11 flex-wrap gap-2 border border-slate-300 bg-white p-2'>
              {devices.map((device) => {
                const selected = selectedDevices.includes(device.id)
                return <button key={device.id} type='button' aria-pressed={selected} onClick={() => setSelectedDevices((current) => selected ? current.filter((id) => id !== device.id) : [...current, device.id])} className={cn('inline-flex items-center gap-1 border px-2 py-1 text-xs font-bold', selected ? 'border-black bg-black text-white' : 'border-slate-300 bg-white')}>
                  {selected ? <Check className='size-3' /> : <Plus className='size-3' />}{device.name}
                </button>
              })}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor='experience'>Yêu cầu kinh nghiệm</FieldLabel>
            <select id='experience' value={form.experience} onChange={(event) => setField('experience', event.target.value)} className={fieldClassName}>
              <option>Không yêu cầu</option><option>1 - 2 năm</option><option>3 - 5 năm</option><option>Trên 5 năm</option>
            </select>
          </div>
          <div>
            <FieldLabel htmlFor='certificates'>Chứng chỉ</FieldLabel>
            <input id='certificates' value={form.certificates} onChange={(event) => setField('certificates', event.target.value)} placeholder='IELTS, JLPT...' className={fieldClassName} />
          </div>

          <div>
            <FieldLabel htmlFor='hard-skills'>Kỹ năng chuyên môn</FieldLabel>
            <input id='hard-skills' value={form.hardSkills} onChange={(event) => setField('hardSkills', event.target.value)} placeholder='Figma, UI Design, HTML/CSS' className={fieldClassName} />
            <p className='mt-1 text-xs text-slate-500'>Phân cách các kỹ năng bằng dấu phẩy.</p>
          </div>
          <div>
            <FieldLabel htmlFor='soft-skills'>Kỹ năng mềm</FieldLabel>
            <input id='soft-skills' value={form.softSkills} onChange={(event) => setField('softSkills', event.target.value)} placeholder='Giao tiếp, làm việc nhóm' className={fieldClassName} />
          </div>

          <div>
            <FieldLabel htmlFor='location'>Địa chỉ làm việc</FieldLabel>
            <input id='location' value={form.location} onChange={(event) => setField('location', event.target.value)} placeholder='Phường, Quận, Thành phố' className={fieldClassName} required />
          </div>
          <div>
            <FieldLabel htmlFor='working-time'>Thời gian</FieldLabel>
            <select id='working-time' value={form.workingTime} onChange={(event) => setField('workingTime', event.target.value as FormState['workingTime'])} className={fieldClassName}>
              <option value='full_time'>Full-time</option><option value='part_time'>Part-time</option>
            </select>
          </div>

          <div className='md:col-span-2'>
            <FieldLabel htmlFor='salary-min'>Mức lương (VND)</FieldLabel>
            <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-3'>
              <input id='salary-min' type='number' min='0' value={form.salaryMin} onChange={(event) => setField('salaryMin', event.target.value)} placeholder='Tối thiểu' className={fieldClassName} required />
              <span aria-hidden='true'>-</span>
              <label className='sr-only' htmlFor='salary-max'>Mức lương tối đa</label>
              <input id='salary-max' type='number' min='0' value={form.salaryMax} onChange={(event) => setField('salaryMax', event.target.value)} placeholder='Tối đa' className={fieldClassName} required />
            </div>
          </div>

          <div className='md:col-span-2'>
            <FieldLabel htmlFor='description'>Mô tả công việc</FieldLabel>
            <textarea id='description' value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder='Mô tả trách nhiệm, quyền lợi, chính sách hỗ trợ người khuyết tật...' className='min-h-36 w-full resize-y border border-slate-300 bg-white p-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10' required />
          </div>
        </div>

        {error ? <p role='alert' className='mt-5 border-l-4 border-red-600 bg-red-50 p-3 text-sm font-medium text-red-800'>{error}</p> : null}
        <Button type='submit' disabled={isSubmitting} className='mt-7 h-12 w-full rounded-none bg-black text-xs font-black uppercase text-white hover:bg-slate-800'>
          {isSubmitting ? <Loader2 className='mr-2 size-4 animate-spin' /> : <Check className='mr-2 size-4' />}Hoàn tất
        </Button>
      </form>
    </section>
  )
}
