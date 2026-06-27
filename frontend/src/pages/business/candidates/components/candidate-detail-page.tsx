import { Mail, MapPin, Phone, Volume2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import toastifyCommon from '@/core/lib/toastify-common'
import { speakAccessibleText } from '@/core/services/speech.service'
import { WorkspaceShell } from '@/pages/_shared/figma-web/workspace-shell'

// TODO(backend): replace with candidate profile API (GET /candidate/:id).
const CANDIDATE = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@gmail.com',
  phone: '+84 90 123 4567',
  address: 'Quận 1, TP Hồ Chí Minh',
  goal: 'Trở thành chuyên gia thiết kế sản phẩm, tạo ra những trải nghiệm số hòa nhập và dễ tiếp cận cho mọi người dùng.',
  education: { school: 'ĐH Khoa học Tự nhiên TPHCM', time: '2018 - 2022' },
  experiences: [
    { title: 'Senior Product Designer', company: 'Tập đoàn Công nghệ Alpha', time: '2022 - Hiện tại', desc: 'Dẫn dắt thiết kế hệ thống design system và cải thiện khả năng tiếp cận sản phẩm.' },
    { title: 'UI/UX Designer', company: 'Sáng tạo Việt Agency', time: '2020 - 2022', desc: 'Thiết kế giao diện cho nhiều dự án web và ứng dụng di động.' }
  ],
  certificates: ['Google UX Design', 'AWS Cloud Practitioner'],
  hardSkills: ['Figma', 'UI Design', 'HTML/CSS', 'Prototyping'],
  softSkills: ['Giao tiếp', 'Làm việc nhóm', 'Tư duy phản biện'],
  languages: ['Tiếng Việt', 'Tiếng Anh'],
  devices: ['Laptop', 'Screen Reader']
}

function Panel({ title, children, speech }: { title: string; children: React.ReactNode; speech?: string }) {
  return (
    <section>
      <div className='mb-3 flex items-center gap-2'>
        <h2 className='text-[13px] font-black uppercase tracking-[0.04em] text-[#004080]'>{title}</h2>
        <button type='button' aria-label={`Đọc ${title}`} onClick={() => void speakAccessibleText(speech || title)} className='text-[#94A3B8] hover:text-[#004080]'>
          <Volume2 className='size-3.5' />
        </button>
      </div>
      {children}
    </section>
  )
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className='flex flex-wrap gap-2'>
      {items.map((item) => (
        <span key={item} className='bg-[#EAF4FF] px-3 py-1.5 text-[12px] font-bold text-[#004080]'>{item}</span>
      ))}
    </div>
  )
}

export function CandidateDetailPage() {
  const c = CANDIDATE

  const handleResolve = (accepted: boolean) =>
    toastifyCommon.success(accepted ? 'Đã chấp nhận ứng viên.' : 'Đã từ chối ứng viên.')

  return (
    <WorkspaceShell role='business' className='py-8'>
      <div className='grid gap-6 lg:grid-cols-[1fr_300px]'>
        <div className='space-y-7'>
          <div className='flex flex-col gap-5 bg-[#004080] p-6 text-white sm:flex-row sm:items-center'>
            <div className='flex size-[120px] shrink-0 items-center justify-center bg-white/15 text-[11px] font-bold uppercase tracking-wide'>
              Ảnh hồ sơ
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <h1 className='text-[26px] font-black uppercase'>{c.name}</h1>
                <button type='button' aria-label='Đọc tên ứng viên' onClick={() => void speakAccessibleText(c.name)} className='text-white/80 hover:text-white'>
                  <Volume2 className='size-4' />
                </button>
              </div>
              <div className='mt-3 space-y-1.5 text-[13px] text-white/90'>
                <p className='flex items-center gap-2'><Mail className='size-4' /> {c.email}</p>
                <p className='flex items-center gap-2'><Phone className='size-4' /> {c.phone}</p>
                <p className='flex items-center gap-2'><MapPin className='size-4' /> {c.address}</p>
              </div>
            </div>
          </div>

          <Panel title='Mục tiêu nghề nghiệp' speech={c.goal}>
            <p className='text-pretty text-[14px] leading-7 text-[#334155]'>{c.goal}</p>
          </Panel>

          <Panel title='Học vấn' speech={`${c.education.school}, ${c.education.time}`}>
            <div className='bg-[#EAF4FF] p-4'>
              <p className='text-[14px] font-black text-[#004080]'>{c.education.school}</p>
              <p className='mt-1 text-[12px] text-[#64748B]'>{c.education.time}</p>
            </div>
          </Panel>

          <Panel title='Kinh nghiệm làm việc'>
            <div className='space-y-3'>
              {c.experiences.map((exp) => (
                <div key={exp.title} className='bg-[#EAF4FF] p-4'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='text-[14px] font-black uppercase text-[#004080]'>{exp.title}</p>
                    <span className='shrink-0 text-[11px] font-bold text-[#64748B]'>{exp.time}</span>
                  </div>
                  <p className='mt-0.5 text-[12px] font-semibold text-[#334155]'>{exp.company}</p>
                  <p className='mt-2 text-[13px] leading-6 text-[#64748B]'>{exp.desc}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className='space-y-6'>
          <Panel title='Chứng chỉ'><TagList items={c.certificates} /></Panel>
          <Panel title='Kỹ năng cứng'><TagList items={c.hardSkills} /></Panel>
          <Panel title='Kỹ năng mềm'><TagList items={c.softSkills} /></Panel>
          <Panel title='Ngôn ngữ'><TagList items={c.languages} /></Panel>
          <Panel title='Thiết bị hiện có'><TagList items={c.devices} /></Panel>
        </aside>
      </div>

      <div className='mt-8 grid grid-cols-2 gap-4 sm:ml-auto sm:max-w-[420px]'>
        <Button type='button' variant='outline' onClick={() => handleResolve(false)} className='h-14 rounded-none border-[#CFE3F7] text-[12px] font-black uppercase tracking-[0.12em] text-[#334155] hover:bg-[#F8FBFF]'>
          Từ chối
        </Button>
        <Button type='button' onClick={() => handleResolve(true)} className='h-14 rounded-none bg-[#004080] text-[12px] font-black uppercase tracking-[0.12em] text-white hover:bg-[#003466]'>
          Chấp nhận
        </Button>
      </div>
    </WorkspaceShell>
  )
}
