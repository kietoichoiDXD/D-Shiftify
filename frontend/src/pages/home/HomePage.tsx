import {
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  Ear,
  GraduationCap,
  Hand,
  Mic,
  ShieldCheck,
  Sparkles,
  UserRound
} from 'lucide-react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
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
    description: 'Tương phản cao, điều hướng bàn phím và Text-to-Speech trên từng trường thông tin.'
  },
  {
    icon: ShieldCheck,
    title: 'Tuyển dụng hòa nhập',
    description: 'Phát hiện tin tuyển dụng có rào cản, ưu tiên doanh nghiệp có chính sách hỗ trợ NKT.'
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
    role: 'Người khuyết tật',
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

const a11yPillars = [
  { icon: Mic, title: 'Tự bật STT', text: 'Người khiếm thị/vận động điều khiển cả trang bằng giọng nói, rảnh tay.' },
  { icon: Ear, title: 'Phụ đề & TTS', text: 'Người khiếm thính có phụ đề trực quan; mọi nội dung đọc to được.' },
  { icon: Hand, title: 'Rung phản hồi', text: 'Haptic xác nhận thao tác, phối hợp với thiết bị hỗ trợ.' }
]

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
}

const matchBars: Array<[string, number]> = [
  ['Kinh nghiệm', 88],
  ['Kỹ năng cứng', 95],
  ['Thiết bị hỗ trợ', 100],
  ['Mục tiêu nghề nghiệp', 90]
]

export default function HomePage() {
  const reduce = useReducedMotion()
  const rise: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
  }
  const reveal = {
    initial: 'hidden' as const,
    whileInView: 'show' as const,
    viewport: { once: true, margin: '-80px' }
  }

  return (
    <div className='min-h-screen bg-[#F8FBFF] text-[#102033]'>
      <Header />

      <main>
        <section aria-labelledby='hero-title' className='relative overflow-hidden pt-28 pb-24 sm:pt-32'>
          <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10'>
            <div className='absolute -right-32 -top-24 size-[520px] rounded-full bg-[#004080]/12 blur-[120px]' />
            <div className='absolute -left-24 top-40 size-[420px] rounded-full bg-[#0A57A8]/10 blur-[120px]' />
            <div className='absolute inset-0 bg-gradient-to-b from-[#EAF4FF]/60 to-transparent' />
          </div>

          <motion.div
            variants={container}
            initial='hidden'
            animate='show'
            className='mx-auto grid w-full max-w-[1200px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]'
          >
            <div>
              <motion.span
                variants={rise}
                className='inline-flex items-center gap-2 rounded-full border border-[#CFE3F7] bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#004080] backdrop-blur'
              >
                <Sparkles className='size-3.5' aria-hidden='true' /> Nền tảng việc làm hòa nhập
              </motion.span>

              <motion.h1
                id='hero-title'
                variants={rise}
                className='mt-5 text-balance text-4xl font-black leading-[1.08] text-[#004080] sm:text-5xl lg:text-[58px]'
              >
                Việc làm phù hợp cho người khuyết tật, ghép nối bằng{' '}
                <span className='bg-gradient-to-r from-[#004080] to-[#0A57A8] bg-clip-text text-transparent'>AI</span>

              </motion.h1>

              <motion.p variants={rise} className='mt-5 max-w-xl text-pretty text-lg leading-8 text-[#33506E]'>
                Shiftify kết nối người khuyết tật với doanh nghiệp và cơ sở đào tạo — chấm điểm độ phù hợp minh bạch
                theo 8 tiêu chí và hỗ trợ giọng nói tiếng Việt trên từng bước.
              </motion.p>

              <motion.div variants={rise} className='mt-8 flex flex-wrap items-center gap-4'>
                <Link
                  to={ROUTE.PUBLIC.REGISTER}
                  className='group inline-flex items-center gap-2 rounded-xl bg-[#004080] px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-[#004080]/25 transition hover:bg-[#003466] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#CFE3F7]'
                >
                  Bắt đầu miễn phí
                  <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
                </Link>

                <Link
                  to={ROUTE.PUBLIC.LOGIN}
                  className='inline-flex items-center gap-2 rounded-xl border border-[#CFE3F7] bg-white px-7 py-3.5 text-base font-bold text-[#004080] transition hover:border-[#004080] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#CFE3F7]'
                >
                  Đăng nhập
                </Link>

              </motion.div>

              <motion.ul variants={rise} className='mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#33506E]'>
                {['Miễn phí cho người tìm việc', 'Trợ năng giọng nói', 'Ghép nối minh bạch'].map((t) => (
                  <li key={t} className='inline-flex items-center gap-1.5'>
                    <CheckCircle2 className='size-4 text-emerald-600' aria-hidden='true' /> {t}
                  </li>

                ))}
              </motion.ul>

            </div>

            <motion.div
              variants={rise}
              className='relative'
              animate={reduce ? undefined : { y: [0, -10, 0] }}
              transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className='rounded-2xl border border-[#CFE3F7] bg-white/90 p-6 shadow-2xl shadow-[#004080]/15 backdrop-blur'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-black uppercase tracking-[0.04em] text-[#004080]'>Độ phù hợp</p>

                  <span className='rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700'>92%</span>

                </div>

                <p className='mt-4 text-lg font-black text-[#102033]'>Nhân viên phân tích dữ liệu</p>

                <p className='text-sm text-[#5A718B]'>Tập đoàn Công nghệ Alpha · Hồ Chí Minh</p>

                <ul className='mt-5 space-y-3'>
                  {matchBars.map(([label, value]) => (
                    <li key={label}>
                      <div className='flex items-center justify-between text-sm font-semibold text-[#33506E]'>
                        <span>{label}</span>

                        <span className='tabular-nums'>{value}đ</span>

                      </div>

                      <div className='mt-1 h-2 overflow-hidden rounded-full bg-[#EAF4FF]'>
                        <motion.div
                          className='h-full rounded-full bg-gradient-to-r from-[#004080] to-[#0A57A8]'
                          initial={{ width: 0 }}
                          whileInView={{ width: `${value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        />
                      </div>

                    </li>

                  ))}
                </ul>

              </div>

            </motion.div>

          </motion.div>

        </section>

        <section aria-label='Số liệu nổi bật' className='border-y border-[#CFE3F7] bg-white'>
          <motion.div
            {...reveal}
            variants={container}
            className='mx-auto grid w-full max-w-[1100px] gap-6 px-5 py-12 sm:grid-cols-3 sm:px-8'
          >
            {stats.map((item) => (
              <motion.div key={item.label} variants={rise} className='text-center'>
                <p className='text-3xl font-black text-[#004080] sm:text-4xl'>{item.value}</p>

                <p className='mt-1 text-sm font-medium text-[#33506E]'>{item.label}</p>

              </motion.div>

            ))}
          </motion.div>

        </section>

        <section id='features' aria-labelledby='features-title' className='scroll-mt-24 py-20'>
          <div className='mx-auto w-full max-w-[1200px] px-5 sm:px-8'>
            <motion.div {...reveal} variants={rise} className='max-w-2xl'>
              <h2 id='features-title' className='text-balance text-3xl font-black text-[#004080] sm:text-4xl'>
                Vì sao chọn Shiftify
              </h2>

              <p className='mt-3 text-pretty text-lg leading-8 text-[#33506E]'>
                Công nghệ đặt khả năng tiếp cận làm trung tâm — từ ghép nối thông minh đến trợ năng giọng nói.
              </p>

            </motion.div>

            <motion.div {...reveal} variants={container} className='mt-10 grid gap-4 md:grid-cols-6'>
              {features.map((feature, i) => {
                const Icon = feature.icon

                const span = i === 0 ? 'md:col-span-4' : i === 1 ? 'md:col-span-2' : 'md:col-span-3'
                const big = i === 0
                return (
                  <motion.article
                    key={feature.title}
                    variants={rise}
                    whileHover={reduce ? undefined : { y: -6 }}
                    className={`group relative overflow-hidden rounded-2xl border border-[#CFE3F7] bg-white p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-[#004080]/10 ${span} ${big ? 'md:row-span-1' : ''}`}
                  >
                    <span className='inline-flex size-12 items-center justify-center rounded-xl bg-[#EAF4FF] text-[#004080] transition-transform group-hover:scale-110'>
                      <Icon className={big ? 'size-7' : 'size-6'} aria-hidden='true' />
                    </span>

                    <h3 className={`mt-4 font-black text-[#102033] ${big ? 'text-2xl' : 'text-lg'}`}>{feature.title}</h3>

                    <p className='mt-2 max-w-2xl text-pretty leading-7 text-[#5A718B]'>{feature.description}</p>

                    {big ? (
                      <span
                        aria-hidden='true'
                        className='pointer-events-none absolute -bottom-10 -right-10 size-44 rounded-full bg-[#004080]/5 blur-2xl'
                      />
                    ) : null}
                  </motion.article>

                )
              })}
            </motion.div>

          </div>

        </section>

        <section aria-labelledby='a11y-title' className='scroll-mt-24 bg-[#004080] py-20 text-white'>
          <div className='mx-auto w-full max-w-[1200px] px-5 sm:px-8'>
            <motion.div {...reveal} variants={rise} className='max-w-2xl'>
              <span className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em]'>
                <Sparkles className='size-3.5' aria-hidden='true' /> Trợ năng tự động
              </span>

              <h2 id='a11y-title' className='mt-4 text-balance text-3xl font-black sm:text-4xl'>
                Tự nhận diện khiếm khuyết, tự bật hỗ trợ
              </h2>

              <p className='mt-3 text-pretty text-lg leading-8 text-white/80'>
                Khi bạn đăng nhập, Shiftify đọc hồ sơ và tự kích hoạt đúng trợ năng — không cần cấu hình.
              </p>

            </motion.div>

            <motion.div {...reveal} variants={container} className='mt-10 grid gap-4 sm:grid-cols-3'>
              {a11yPillars.map((p) => {
                const Icon = p.icon
                return (
                  <motion.article
                    key={p.title}
                    variants={rise}
                    whileHover={reduce ? undefined : { y: -6 }}
                    className='rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur transition-colors hover:bg-white/10'
                  >
                    <span className='inline-flex size-12 items-center justify-center rounded-xl bg-white/15'>
                      <Icon className='size-6' aria-hidden='true' />
                    </span>

                    <h3 className='mt-4 text-lg font-black'>{p.title}</h3>

                    <p className='mt-2 leading-7 text-white/80'>{p.text}</p>

                  </motion.article>

                )
              })}
            </motion.div>

          </div>

        </section>

        <section id='getting-started' aria-labelledby='how-title' className='scroll-mt-24 bg-white py-20'>
          <div className='mx-auto w-full max-w-[1200px] px-5 sm:px-8'>
            <motion.h2
              {...reveal}
              variants={rise}
              id='how-title'
              className='text-balance text-3xl font-black text-[#004080] sm:text-4xl'
            >
              Ba bước để có việc làm
            </motion.h2>

            <motion.div {...reveal} variants={container} className='mt-10 grid gap-6 md:grid-cols-3'>
              {steps.map((item) => (
                <motion.div
                  key={item.step}
                  variants={rise}
                  className='relative overflow-hidden rounded-2xl border border-[#CFE3F7] bg-[#F8FBFF] p-7 transition hover:border-[#004080]'
                >
                  <span className='text-5xl font-black text-[#CFE3F7]'>{item.step}</span>

                  <h3 className='mt-2 text-xl font-black text-[#102033]'>{item.title}</h3>

                  <p className='mt-1.5 text-pretty leading-7 text-[#5A718B]'>{item.description}</p>

                </motion.div>

              ))}
            </motion.div>

          </div>

        </section>

        <section id='tech-stack' aria-labelledby='aud-title' className='scroll-mt-24 py-20'>
          <div className='mx-auto w-full max-w-[1200px] px-5 sm:px-8'>
            <motion.h2
              {...reveal}
              variants={rise}
              id='aud-title'
              className='text-balance text-3xl font-black text-[#004080] sm:text-4xl'
            >
              Dành cho mọi vai trò
            </motion.h2>

            <motion.div {...reveal} variants={container} className='mt-10 grid gap-5 md:grid-cols-3'>
              {audiences.map((audience) => {
                const Icon = audience.icon
                return (
                  <motion.article
                    key={audience.role}
                    variants={rise}
                    whileHover={reduce ? undefined : { y: -6 }}
                    className='rounded-2xl border border-[#CFE3F7] bg-white p-7 text-center shadow-sm transition-shadow hover:shadow-xl hover:shadow-[#004080]/10'
                  >
                    <span className='mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-[#004080] text-white'>
                      <Icon className='size-7' aria-hidden='true' />
                    </span>

                    <h3 className='mt-4 text-xl font-black text-[#102033]'>{audience.role}</h3>

                    <p className='mt-2 text-pretty leading-7 text-[#5A718B]'>{audience.description}</p>

                  </motion.article>

                )
              })}
            </motion.div>

          </div>

        </section>

        <section aria-labelledby='cta-title' className='px-5 pb-20 sm:px-8'>
          <motion.div
            {...reveal}
            variants={rise}
            className='relative mx-auto w-full max-w-[1100px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#004080] to-[#0A57A8] p-10 text-center text-white shadow-2xl shadow-[#004080]/30 sm:p-14'
          >
            <span aria-hidden='true' className='pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-white/10 blur-3xl' />
            <span aria-hidden='true' className='pointer-events-none absolute -bottom-16 -right-16 size-56 rounded-full bg-white/10 blur-3xl' />
            <h2 id='cta-title' className='text-balance text-3xl font-black sm:text-4xl'>Sẵn sàng tìm công việc phù hợp?</h2>

            <p className='mx-auto mt-3 max-w-xl text-pretty text-lg leading-8 text-white/85'>
              Tham gia Shiftify ngay hôm nay — miễn phí cho người tìm việc.
            </p>

            <div className='mt-7 flex flex-wrap justify-center gap-4'>
              <Link
                to={ROUTE.PUBLIC.REGISTER}
                className='group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-[#004080] transition hover:bg-[#EAF4FF] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40'
              >
                Đăng ký ngay
                <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' aria-hidden='true' />
              </Link>

            </div>

          </motion.div>

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
