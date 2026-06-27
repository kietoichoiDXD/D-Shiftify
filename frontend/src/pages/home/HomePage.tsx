import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Ear,
  GraduationCap,
  Mic,
  ShieldCheck,
  Sparkles,
  UserRound
} from 'lucide-react'
import { Link } from 'react-router-dom'

import Header from '@/components/header-nav/header-nav'
import { ROUTE } from '@/core/constants/path'

const stats = [
  { value: '8 tiêu chí', label: 'Chấm điểm phù hợp bằng AI' },
  { value: '100%', label: 'Hỗ trợ giọng nói tiếng Việt' },
  { value: '3 vai trò', label: 'NKT · Doanh nghiệp · Đào tạo' }
]

const features = [
  {
    icon: Brain,
    title: 'AI Matching theo 8 tiêu chí',
    description:
      'Chấm điểm độ phù hợp dựa trên ưu tiên công việc, kinh nghiệm, thiết bị, mục tiêu nghề nghiệp, kỹ năng và chứng chỉ — minh bạch từng trọng số.'
  },
  {
    icon: Mic,
    title: 'Nhập liệu bằng giọng nói',
    description: 'Tạo CV và tìm việc bằng giọng nói tiếng Việt. Mọi nội dung đều có thể nghe đọc to.'
  },
  {
    icon: Ear,
    title: 'Đọc màn hình & trợ năng',
    description: 'Thiết kế tương phản cao, điều hướng bàn phím và Text-to-Speech trên từng trường thông tin.'
  },
  {
    icon: ShieldCheck,
    title: 'Tuyển dụng hòa nhập',
    description: 'Phát hiện tin tuyển dụng có rào cản, ưu tiên doanh nghiệp có chính sách hỗ trợ người khuyết tật.'
  }
]

const steps = [
  { step: '01', title: 'Tạo hồ sơ năng lực', description: 'Nhập thông tin và CV bằng giọng nói hoặc bàn phím.' },
  { step: '02', title: 'AI gợi ý việc phù hợp', description: 'Hệ thống chấm điểm và xếp hạng công việc theo tiêu chí của bạn.' },
  { step: '03', title: 'Ứng tuyển & kết nối', description: 'Nộp hồ sơ, trò chuyện và nhận thư mời phỏng vấn trực tiếp.' }
]

const audiences = [
  {
    icon: UserRound,
    role: 'Người khiếm thị',
    description: 'Tìm việc phù hợp năng lực, ứng tuyển dễ dàng với trợ năng giọng nói toàn diện.'
  },
  {
    icon: Building2,
    role: 'Doanh nghiệp',
    description: 'Đăng tin, nhận ứng viên được AI chấm điểm phù hợp và xây dựng môi trường hòa nhập.'
  },
  {
    icon: GraduationCap,
    role: 'Cơ sở đào tạo',
    description: 'Mở lớp kỹ năng nghề, kết nối học viên với cơ hội việc làm thực tế.'
  }
]

export default function HomePage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-[#F8FBFF] to-[#EAF4FF] text-[#102033]'>
      <Header />

      {/* Hero */}
      <main>
        <section className='relative overflow-hidden pt-28 pb-20 sm:pt-32'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -right-24 -top-16 size-[420px] rounded-full bg-[#004080]/10 blur-3xl'
          />
          <div className='mx-auto grid w-full max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]'>
            <div>
              <span className='inline-flex items-center gap-2 rounded-full border border-[#CFE3F7] bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#004080]'>
                <Sparkles className='size-3.5' /> Nền tảng việc làm hòa nhập
              </span>
              <h1 className='mt-5 text-balance text-4xl font-black leading-[1.1] text-[#004080] sm:text-5xl lg:text-[56px]'>
                Việc làm phù hợp cho người khiếm thị, ghép nối bằng AI
              </h1>
              <p className='mt-5 max-w-xl text-pretty text-lg leading-8 text-[#33506E]'>
                Shiftify kết nối người khuyết tật với doanh nghiệp và cơ sở đào tạo — chấm điểm độ phù hợp minh bạch
                theo 8 tiêu chí và hỗ trợ giọng nói tiếng Việt trên từng bước.
              </p>
              <div className='mt-8 flex flex-wrap items-center gap-4'>
                <Link
                  to={ROUTE.PUBLIC.REGISTER}
                  className='inline-flex items-center gap-2 bg-[#004080] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-[#004080]/20 transition hover:bg-[#003466]'
                >
                  Bắt đầu miễn phí <ArrowRight className='size-4' />
                </Link>
                <Link
                  to={ROUTE.PUBLIC.LOGIN}
                  className='inline-flex items-center gap-2 border border-[#CFE3F7] bg-white px-7 py-3.5 text-base font-bold text-[#004080] transition hover:border-[#004080]'
                >
                  Đăng nhập
                </Link>
              </div>
            </div>

            <div className='relative'>
              <div className='border border-[#CFE3F7] bg-white p-6 shadow-xl shadow-[#004080]/10'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-black uppercase tracking-[0.04em] text-[#004080]'>Độ phù hợp</p>
                  <span className='rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700'>92%</span>
                </div>
                <p className='mt-4 text-lg font-black text-[#102033]'>Nhân viên phân tích dữ liệu</p>
                <p className='text-sm text-[#5A718B]'>Tập đoàn Công nghệ Alpha · Hồ Chí Minh</p>
                <ul className='mt-5 space-y-3'>
                  {[
                    ['Kinh nghiệm', 88],
                    ['Kỹ năng cứng', 95],
                    ['Thiết bị hỗ trợ', 100],
                    ['Mục tiêu nghề nghiệp', 90]
                  ].map(([label, value]) => (
                    <li key={label as string}>
                      <div className='flex items-center justify-between text-sm font-semibold text-[#33506E]'>
                        <span>{label}</span>
                        <span className='tabular-nums'>{value}đ</span>
                      </div>
                      <div className='mt-1 h-2 overflow-hidden rounded-full bg-[#EAF4FF]'>
                        <div className='h-full rounded-full bg-[#004080]' style={{ width: `${value}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className='border-y border-[#CFE3F7] bg-white'>
          <div className='mx-auto grid w-full max-w-[1100px] gap-6 px-5 py-10 sm:grid-cols-3 sm:px-8'>
            {stats.map((item) => (
              <div key={item.label} className='text-center'>
                <p className='text-3xl font-black text-[#004080]'>{item.value}</p>
                <p className='mt-1 text-sm font-medium text-[#5A718B]'>{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id='features' className='scroll-mt-24 py-20'>
          <div className='mx-auto w-full max-w-[1200px] px-5 sm:px-8'>
            <div className='max-w-2xl'>
              <h2 className='text-balance text-3xl font-black text-[#004080] sm:text-4xl'>Vì sao chọn Shiftify</h2>
              <p className='mt-3 text-pretty text-lg leading-8 text-[#33506E]'>
                Công nghệ đặt khả năng tiếp cận làm trung tâm — từ ghép nối thông minh đến trợ năng giọng nói.
              </p>
            </div>
            <div className='mt-10 grid gap-5 sm:grid-cols-2'>
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <article
                    key={feature.title}
                    className='flex gap-4 border border-[#CFE3F7] bg-white p-6 shadow-sm transition hover:border-[#004080] hover:shadow-md'
                  >
                    <span className='inline-flex size-12 shrink-0 items-center justify-center rounded-md bg-[#EAF4FF] text-[#004080]'>
                      <Icon className='size-6' />
                    </span>
                    <div>
                      <h3 className='text-lg font-black text-[#102033]'>{feature.title}</h3>
                      <p className='mt-1.5 text-pretty leading-7 text-[#5A718B]'>{feature.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id='getting-started' className='scroll-mt-24 bg-white py-20'>
          <div className='mx-auto w-full max-w-[1200px] px-5 sm:px-8'>
            <h2 className='text-balance text-3xl font-black text-[#004080] sm:text-4xl'>Ba bước để có việc làm</h2>
            <div className='mt-10 grid gap-6 md:grid-cols-3'>
              {steps.map((item) => (
                <div key={item.step} className='relative border-l-4 border-[#004080] bg-[#F8FBFF] p-6'>
                  <span className='text-4xl font-black text-[#CFE3F7]'>{item.step}</span>
                  <h3 className='mt-2 text-xl font-black text-[#102033]'>{item.title}</h3>
                  <p className='mt-1.5 text-pretty leading-7 text-[#5A718B]'>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audiences */}
        <section id='tech-stack' className='scroll-mt-24 py-20'>
          <div className='mx-auto w-full max-w-[1200px] px-5 sm:px-8'>
            <h2 className='text-balance text-3xl font-black text-[#004080] sm:text-4xl'>Dành cho mọi vai trò</h2>
            <div className='mt-10 grid gap-5 md:grid-cols-3'>
              {audiences.map((audience) => {
                const Icon = audience.icon
                return (
                  <article key={audience.role} className='border border-[#CFE3F7] bg-white p-7 text-center shadow-sm'>
                    <span className='mx-auto inline-flex size-14 items-center justify-center rounded-full bg-[#004080] text-white'>
                      <Icon className='size-7' />
                    </span>
                    <h3 className='mt-4 text-xl font-black text-[#102033]'>{audience.role}</h3>
                    <p className='mt-2 text-pretty leading-7 text-[#5A718B]'>{audience.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className='px-5 pb-20 sm:px-8'>
          <div className='mx-auto w-full max-w-[1100px] overflow-hidden bg-gradient-to-r from-[#004080] to-[#0A57A8] p-10 text-center text-white sm:p-14'>
            <h2 className='text-balance text-3xl font-black sm:text-4xl'>Sẵn sàng tìm công việc phù hợp?</h2>
            <p className='mx-auto mt-3 max-w-xl text-pretty text-lg leading-8 text-white/85'>
              Tham gia Shiftify ngay hôm nay — miễn phí cho người tìm việc.
            </p>
            <div className='mt-7 flex flex-wrap justify-center gap-4'>
              <Link
                to={ROUTE.PUBLIC.REGISTER}
                className='inline-flex items-center gap-2 bg-white px-7 py-3.5 text-base font-bold text-[#004080] transition hover:bg-[#EAF4FF]'
              >
                Đăng ký ngay <ArrowRight className='size-4' />
              </Link>
            </div>
            <ul className='mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/85'>
              {['Miễn phí cho người tìm việc', 'Hỗ trợ giọng nói tiếng Việt', 'Ghép nối minh bạch'].map((item) => (
                <li key={item} className='inline-flex items-center gap-1.5'>
                  <CheckCircle2 className='size-4' /> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className='border-t border-[#CFE3F7] bg-white'>
        <div className='mx-auto flex w-full max-w-[1200px] flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8'>
          <p className='text-lg font-black uppercase tracking-[0.16em] text-[#004080]'>D-Shiftify</p>
          <p className='text-sm text-[#5A718B]'>© {new Date().getFullYear()} Shiftify. Việc làm hòa nhập cho mọi người.</p>
        </div>
      </footer>
    </div>
  )
}
