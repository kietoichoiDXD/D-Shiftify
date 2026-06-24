import { motion } from 'framer-motion'

import mainLoginImage from '@/assets/images/main-login.png'

export const AuthBrandPanel = () => (
  <section className='hidden min-w-0 flex-1 flex-col items-center justify-center px-10 py-8 text-center lg:flex'>
    <motion.img
      src='/logo.svg'
      alt='D Shiftify'
      className='mb-4 h-20 w-auto'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
    <motion.h1
      className='mb-6 text-2xl font-bold uppercase text-brand-primary'
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
    >
      Trao cơ hội - Nhận giá trị
    </motion.h1>
    <motion.img
      src={mainLoginImage}
      alt='Minh họa người dùng D-SHIFTIFY ghi âm hồ sơ ứng tuyển'
      className='w-full max-w-[480px] object-cover shadow-sm'
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
    />
  </section>
)
