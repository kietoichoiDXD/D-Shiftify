import { motion } from 'framer-motion'
import { Volume2, Sparkles, ChevronRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { speakAccessibleText } from '@/core/services/speech.service'

export const HeroSection = () => {
  const handleSpeakIntro = () => {
    speakAccessibleText(
      'Shiftify. Nền tảng tuyển dụng và matching việc làm đột phá dành cho người khuyết tật. Tích hợp hỗ trợ giọng nói đầy đủ và giải thích độ phù hợp thông minh.'
    )
  }

  return (
    <section id='hero' className='relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0A0A0C] text-white py-20'>
      {/* Background ambient lights */}
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(111,114,242,0.15),transparent_45%)]' />
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.1),transparent_50%)]' />
      
      {/* Animated floating particles */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className='absolute w-1.5 h-1.5 bg-indigo-500/25 rounded-full'
            initial={{
              x: Math.random() * 1200,
              y: Math.random() * 800,
              scale: Math.random() * 2 + 1
            }}
            animate={{
              y: ['0px', '400px', '0px'],
              x: ['0px', '100px', '0px']
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <div className='grid gap-12 lg:grid-cols-12 items-center'>
          {/* Left Column: Title & Intro */}
          <div className='lg:col-span-7 space-y-6 text-left'>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-black uppercase tracking-widest'
            >
              <Sparkles className='h-3.5 w-3.5 animate-pulse' />
              Nền tảng việc làm đột phá
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] uppercase bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent'
            >
              D-SHIFTIFY
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='text-lg sm:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl'
            >
              Cầu nối nghề nghiệp tiếp cận chuẩn mực dành riêng cho người khuyết tật. Tự động đánh giá thiết bị tương thích, đo lường độ phù hợp thông minh và tích hợp trợ lý giọng nói toàn diện.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='flex flex-wrap items-center gap-4 pt-4'
            >
              <Link
                to={ROUTE.DISABILITY.JOBS}
                className='inline-flex h-13 items-center justify-center bg-indigo-600 px-7 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 hover:shadow-indigo-500/35 transition-all rounded-none'
              >
                Tìm việc ngay <ChevronRight className='ml-2 h-4 w-4' />
              </Link>
              <Link
                to={ROUTE.PUBLIC.REGISTER}
                className='inline-flex h-13 items-center justify-center border border-slate-700 bg-slate-900/50 px-7 text-xs font-black uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-600 transition-all rounded-none'
              >
                Dành cho doanh nghiệp
              </Link>
              <button
                type='button'
                onClick={handleSpeakIntro}
                aria-label='Đọc to nội dung giới thiệu'
                className='inline-flex h-13 w-13 items-center justify-center border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:text-white hover:bg-indigo-500/10 transition-all'
              >
                <Volume2 className='h-5 w-5' />
              </button>
            </motion.div>
          </div>

          {/* Right Column: Stunning Mock Card showing matching capability */}
          <div className='lg:col-span-5 flex justify-center relative'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='w-full max-w-[420px] bg-slate-950/80 border border-slate-800 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-md rounded-none'
            >
              {/* Highlight gradient borders */}
              <div className='absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500' />
              
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-2'>
                  <span className='h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse' />
                  <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Matching Simulator</span>
                </div>
                <div className='flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-emerald-400 text-xs font-black uppercase tracking-wider'>
                  98% Phù hợp
                </div>
              </div>

              <div className='space-y-5 text-left'>
                <div>
                  <h3 className='text-[16px] font-black uppercase text-white'>Chuyên viên phân tích dữ liệu</h3>
                  <p className='text-xs text-slate-400 font-medium mt-1'>Tập đoàn Công nghệ Alpha | Quận 1, TP. HCM</p>
                </div>

                <div className='border-t border-slate-900 pt-4 space-y-3.5'>
                  <p className='text-[10px] font-black uppercase tracking-wider text-slate-500'>Kiểm tra điều kiện tiếp cận</p>
                  
                  <div className='flex items-center justify-between text-xs text-slate-300'>
                    <span className='flex items-center gap-2'>
                      <Check className='h-4 w-4 text-emerald-500' />
                      Thiết bị: Laptop, Camera
                    </span>
                    <span className='text-emerald-500 font-bold'>Đạt</span>
                  </div>

                  <div className='flex items-center justify-between text-xs text-slate-300'>
                    <span className='flex items-center gap-2'>
                      <Check className='h-4 w-4 text-emerald-500' />
                      Hỗ trợ: Khiếm thị hoàn toàn
                    </span>
                    <span className='text-emerald-500 font-bold'>Đạt</span>
                  </div>

                  <div className='flex items-center justify-between text-xs text-slate-300'>
                    <span className='flex items-center gap-2'>
                      <Check className='h-4 w-4 text-emerald-500' />
                      Trình đọc màn hình (NVDA)
                    </span>
                    <span className='text-emerald-500 font-bold'>Sẵn sàng</span>
                  </div>
                </div>

                <div className='border-t border-slate-900 pt-4 flex gap-3 items-center'>
                  <div className='flex-1 h-10 border border-slate-800 bg-slate-900/40 text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center justify-center'>
                    Chi tiết
                  </div>
                  <div className='flex-1 h-10 bg-indigo-600 hover:bg-indigo-500 text-[11px] font-black uppercase tracking-wider text-white flex items-center justify-center shadow-md shadow-indigo-600/10'>
                    Ứng tuyển
                  </div>
                  <div className='h-10 w-10 border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white flex items-center justify-center'>
                    <Volume2 className='h-4 w-4' />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
