import { useState } from 'react'
import { Plus, Volume2, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { jobApi } from '@/core/services/job.service'
import { speakAccessibleText } from '@/core/services/speech.service'
import toastifyCommon from '@/core/lib/toastify-common'

import { Chip, FigmaField, PrimaryAction } from './form-controls'
import { AnimatedButton } from './interactive'
import { WorkspaceShell } from './workspace-shell'

export function FigmaBusinessJobCreatePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [workMode, setWorkMode] = useState('Online')
  const [devices, setDevices] = useState<string[]>(['Laptop', 'Camera'])
  const [newDevice, setNewDevice] = useState('')
  
  const [experience, setExperience] = useState('Không yêu cầu')
  const [certificates, setCertifications] = useState('')

  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>(['Figma', 'UI Design'])
  const [newMustHave, setNewMustHave] = useState('')
  const [showAddMustHave, setShowAddMustHave] = useState(false)

  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>(['HTML/CSS'])
  const [newNiceToHave, setNewNiceToHave] = useState('')
  const [showAddNiceToHave, setShowAddNiceToHave] = useState(false)

  const [softSkills, setSoftSkills] = useState('')
  const [location, setLocation] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [workingTime, setWorkingTime] = useState('Full-time')
  const [description, setDescription] = useState('')

  const handleAddDevice = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newDevice.trim()) {
      e.preventDefault()
      if (!devices.includes(newDevice.trim())) {
        setDevices([...devices, newDevice.trim()])
      }
      setNewDevice('')
    }
  }

  const handleRemoveDevice = (item: string) => {
    setDevices(devices.filter((d) => d !== item))
  }

  const handleAddMustHave = () => {
    if (newMustHave.trim()) {
      if (!mustHaveSkills.includes(newMustHave.trim())) {
        setMustHaveSkills([...mustHaveSkills, newMustHave.trim()])
      }
      setNewMustHave('')
      setShowAddMustHave(false)
    }
  }

  const handleAddNiceToHave = () => {
    if (newNiceToHave.trim()) {
      if (!niceToHaveSkills.includes(newNiceToHave.trim())) {
        setNiceToHaveSkills([...niceToHaveSkills, newNiceToHave.trim()])
      }
      setNewNiceToHave('')
      setShowAddNiceToHave(false)
    }
  }

  const handleRemoveMustHave = (skill: string) => {
    setMustHaveSkills(mustHaveSkills.filter((s) => s !== skill))
  }

  const handleRemoveNiceToHave = (skill: string) => {
    setNiceToHaveSkills(niceToHaveSkills.filter((s) => s !== skill))
  }

  const handleSpeakLabel = (label: string) => {
    speakAccessibleText(label)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toastifyCommon.error('Vui lòng nhập tên công việc.')
      return
    }

    setLoading(true)
    try {
      const skillsPayload = [
        ...mustHaveSkills.map((name) => ({ name, required: true })),
        ...niceToHaveSkills.map((name) => ({ name, required: false }))
      ]

      const workModeMapped = workMode.toLowerCase() === 'online' ? 'remote' : workMode.toLowerCase() === 'offline' ? 'onsite' : 'hybrid'

      const payload = {
        title,
        description: description || 'Mô tả công việc tuyển dụng',
        job_type: workingTime === 'Full-time' ? 'full_time' : 'part_time',
        work_mode: workModeMapped,
        experience_required: experience,
        skills: skillsPayload,
        salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
        salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
        location: location || 'TP. Hồ Chí Minh',
        latitude: null,
        longitude: null,
        working_time: workingTime === 'Full-time' ? 'full_time' : 'part_time',
        status: 'open',
        assistive_devices: devices
      }

      await jobApi.create(payload)
      toastifyCommon.success('Tạo công việc thành công!')
      navigate(ROUTE.BUSINESS.JOBS)
    } catch (err: any) {
      console.error(err)
      toastifyCommon.error('Đã xảy ra lỗi khi tạo công việc.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <WorkspaceShell role='business'>
      <div className='mx-auto w-full max-w-[560px]'>
        <h1 className='mb-8 flex items-center gap-2 text-[34px] font-black uppercase'>
          Tạo việc
          <button
            type='button'
            onClick={() => handleSpeakLabel('Tạo việc')}
            aria-label='Đọc tiêu đề Tạo việc'
            className='rounded-full p-1 transition hover:bg-black/5 hover:text-black'
          >
            <Volume2 className='h-5 w-5 text-black' aria-hidden='true' />
          </button>
        </h1>
        <form onSubmit={handleSubmit} className='space-y-5'>
          <FigmaField
            label='Tên công việc'
            placeholder='Ví dụ: Nhân viên thiết kế đồ họa'
            className='md:col-span-2'
            value={title}
            onChange={setTitle}
          />
          <div className='grid gap-5 md:grid-cols-2'>
            <FigmaField
              label='Hình thức'
              placeholder='Chọn hình thức'
              select
              options={['Online', 'Offline', 'Hybrid']}
              value={workMode}
              onChange={setWorkMode}
            />
            <div>
              <span className='mb-2 flex items-center gap-1.5 text-[12px] font-black text-black'>
                Yêu cầu thiết bị
                <button
                  type='button'
                  onClick={() => handleSpeakLabel('Yêu cầu thiết bị')}
                  aria-label='Đọc nhãn yêu cầu thiết bị'
                  className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
                >
                  <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
                </button>
              </span>
              <div className='min-h-12 border border-[#D9D9D9] bg-white px-3 py-2 flex flex-wrap gap-2 items-center focus-within:border-black focus-within:ring-2 focus-within:ring-black/10'>
                {devices.map((device) => (
                  <Chip key={device} removable onRemove={() => handleRemoveDevice(device)}>
                    {device}
                  </Chip>
                ))}
                <input
                  aria-label='Thêm thiết bị'
                  className='h-6 max-w-[120px] text-[12px] outline-none bg-transparent'
                  placeholder='Thêm...'
                  value={newDevice}
                  onChange={(e) => setNewDevice(e.target.value)}
                  onKeyDown={handleAddDevice}
                />
              </div>
            </div>
            <FigmaField
              label='Yêu cầu kinh nghiệm'
              placeholder='Không yêu cầu'
              select
              options={['Không yêu cầu', 'Dưới 1 năm', '1-2 năm', '2-5 năm', 'Trên 5 năm']}
              value={experience}
              onChange={setExperience}
            />
            <FigmaField
              label='Chứng chỉ'
              placeholder='IELTS, JLPT...'
              value={certificates}
              onChange={setCertifications}
            />
            <div>
              <span className='mb-2 flex items-center gap-1.5 text-[12px] font-black text-black'>
                Kỹ năng chuyên môn (Must-have)
                <button
                  type='button'
                  onClick={() => handleSpeakLabel('Kỹ năng chuyên môn must-have')}
                  aria-label='Đọc nhãn kỹ năng chuyên môn must have'
                  className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
                >
                  <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
                </button>
              </span>
              <div className='min-h-[82px] border border-[#D9D9D9] bg-white p-3 flex flex-wrap gap-2 items-center'>
                {mustHaveSkills.map((skill) => (
                  <Chip key={skill} removable onRemove={() => handleRemoveMustHave(skill)}>
                    {skill}
                  </Chip>
                ))}
                {showAddMustHave ? (
                  <div className='flex items-center gap-1'>
                    <input
                      aria-label='Nhập kỹ năng chuyên môn'
                      className='h-7 w-24 border border-[#D9D9D9] px-2 text-[11px] outline-none'
                      placeholder='Tên kỹ năng'
                      value={newMustHave}
                      onChange={(e) => setNewMustHave(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMustHave()}
                      autoFocus
                    />
                    <button
                      type='button'
                      onClick={handleAddMustHave}
                      className='h-7 bg-black text-white px-2 text-[10px] font-bold uppercase'
                    >
                      Thêm
                    </button>
                  </div>
                ) : (
                  <AnimatedButton
                    type='button'
                    onClick={() => setShowAddMustHave(true)}
                    aria-label='Thêm kỹ năng chuyên môn'
                    className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-black hover:bg-black hover:text-white'
                  >
                    <Plus className='h-3.5 w-3.5' aria-hidden='true' />
                  </AnimatedButton>
                )}
              </div>
            </div>
            <div>
              <span className='mb-2 flex items-center gap-1.5 text-[12px] font-black text-black'>
                Nice-to-have
                <button
                  type='button'
                  onClick={() => handleSpeakLabel('Kỹ năng Nice-to-have')}
                  aria-label='Đọc nhãn kỹ năng nice to have'
                  className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
                >
                  <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
                </button>
              </span>
              <div className='min-h-[82px] border border-[#D9D9D9] bg-white p-3 flex flex-wrap gap-2 items-center'>
                {niceToHaveSkills.map((skill) => (
                  <Chip key={skill} removable onRemove={() => handleRemoveNiceToHave(skill)}>
                    {skill}
                  </Chip>
                ))}
                {showAddNiceToHave ? (
                  <div className='flex items-center gap-1'>
                    <input
                      aria-label='Nhập kỹ năng nice-to-have'
                      className='h-7 w-24 border border-[#D9D9D9] px-2 text-[11px] outline-none'
                      placeholder='Tên kỹ năng'
                      value={newNiceToHave}
                      onChange={(e) => setNewNiceToHave(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNiceToHave()}
                      autoFocus
                    />
                    <button
                      type='button'
                      onClick={handleAddNiceToHave}
                      className='h-7 bg-black text-white px-2 text-[10px] font-bold uppercase'
                    >
                      Thêm
                    </button>
                  </div>
                ) : (
                  <AnimatedButton
                    type='button'
                    onClick={() => setShowAddNiceToHave(true)}
                    aria-label='Thêm kỹ năng cộng điểm'
                    className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-black hover:bg-black hover:text-white'
                  >
                    <Plus className='h-3.5 w-3.5' aria-hidden='true' />
                  </AnimatedButton>
                )}
              </div>
            </div>
            <FigmaField
              label='Kỹ năng mềm'
              placeholder='Giao tiếp, làm việc nhóm...'
              value={softSkills}
              onChange={setSoftSkills}
            />
            <FigmaField
              label='Địa chỉ làm việc'
              placeholder='Phường, Quận, Thành phố...'
              value={location}
              onChange={setLocation}
            />
            <div>
              <span className='mb-2 flex items-center gap-1.5 text-[12px] font-black text-black'>
                Mức lương (VND)
                <button
                  type='button'
                  onClick={() => handleSpeakLabel('Mức lương')}
                  aria-label='Đọc nhãn mức lương'
                  className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
                >
                  <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
                </button>
              </span>
              <div className='grid grid-cols-[1fr_auto_1fr] items-center gap-3'>
                <input
                  aria-label='Mức lương tối thiểu'
                  type='number'
                  className='h-12 border border-[#D9D9D9] bg-white px-4 text-[13px] outline-none focus:border-black focus:ring-2 focus:ring-black/10'
                  placeholder='Min'
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                />
                <span className='text-[#777]'>-</span>
                <input
                  aria-label='Mức lương tối đa'
                  type='number'
                  className='h-12 border border-[#D9D9D9] bg-white px-4 text-[13px] outline-none focus:border-black focus:ring-2 focus:ring-black/10'
                  placeholder='Max'
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                />
              </div>
            </div>
            <FigmaField
              label='Thời gian'
              placeholder='Chọn loại thời gian'
              select
              options={['Full-time', 'Part-time']}
              value={workingTime}
              onChange={setWorkingTime}
            />
            <FigmaField
              label='Mô tả công việc'
              placeholder='Mô tả chi tiết về trách nhiệm, quyền lợi và cơ hội phát triển...'
              textarea
              className='md:col-span-2'
              value={description}
              onChange={setDescription}
            />
          </div>
          <PrimaryAction type='submit' disabled={loading}>
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                ĐANG TẠO...
              </span>
            ) : (
              'HOÀN TẤT'
            )}
          </PrimaryAction>
        </form>
      </div>
    </WorkspaceShell>
  )
}
