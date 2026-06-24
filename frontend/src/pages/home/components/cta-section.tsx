import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Volume2, User, Building, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTE } from '@/core/constants/path'
import { speakAccessibleText } from '@/core/services/speech.service'

export const CTASection = () => {
  const handleSpeakCTA = () => {
    speakAccessibleText(
      'Bắt đầu hành trình của bạn cùng Shiftify. Đăng ký ngay hôm nay với tư cách Ứng viên, Doanh nghiệp hoặc Cơ sở đào tạo để trải nghiệm nền tảng tuyển dụng không rào cản.'
    )
  }

  const roles = [
    {
      icon: User,
      title: 'Ứng viên tìm việc',
      description: 'Tạo CV trợ năng, nhận điểm phù hợp thông minh và ứng tuyển nhanh chóng.',
      link: ROUTE.PUBLIC.REGISTER,
      buttonText: 'Đăng ký tìm việc',
      color: 'from-indigo-600 to-indigo-500'
    },
    {
      icon: Building,
      title: 'Nhà tuyển dụng',
      description: 'Đăng tuyển việc làm, tiếp cận nguồn lao động khuyết tật tài năng và được hỗ trợ thiết bị.',
      link: ROUTE.PUBLIC.REGISTER,
      buttonText: 'Đăng ký tuyển dụng',
      color: 'from-emerald-600 to-emerald-500'
    },
    {
      icon: GraduationCap,
      title: 'Cơ sở đào tạo',
      description: 'Quản lý khóa học nâng cao tay nghề và kết nối giới thiệu việc làm trực tiếp.',
      link: ROUTE.PUBLIC.REGISTER,
      buttonText: 'Đăng ký đào tạo',
      color: 'from-blue-600 to-blue-500'
    }
  ]

  return (
    <section id='cta' className='relative py-24 bg-[#0C0C0E] border-t border-slate-900 overflow-hidden text-white'>
      <div className='absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none' />

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center max-w-3xl mx-auto mb-16 space-y-5'
        >
          <div className='inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest'>
            <Sparkles className='w-3.5 h-3.5' />
            Bắt đầu ngay hôm nay
          </div>

          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-2'>
            Hành trình của bạn bắt đầu tại đây
            <button
              type='button'
              onClick={handleSpeakCTA}
              aria-label='Đọc kêu gọi hành động'
              className='text-slate-400 hover:text-white transition focus:outline-none'
            >
              <Volume2 className='w-5 h-5' />
            </button>
          </h2>
          <p className='text-lg text-slate-400 font-medium'>
            Chọn vai trò phù hợp và mở ra những cơ hội phát triển không giới hạn cùng D-SHIFTIFY.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className='bg-[#111115]/60 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all rounded-none text-left relative overflow-hidden group'
            >
              <div>
                <div className='w-12 h-12 bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center mb-6 group-hover:text-white transition-all'>
                  <role.icon className='w-5 h-5' />
                </div>
                <h3 className='text-lg font-black uppercase text-white mb-2'>{role.title}</h3>
                <p className='text-sm text-slate-400 leading-relaxed mb-8 font-medium'>{role.description}</p>
              </div>

              <Link
                to={role.link}
                className={`w-full inline-flex h-12 items-center justify-center bg-gradient-to-r ${role.color} text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all rounded-none hover:opacity-95`}
              >
                {role.buttonText} <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
