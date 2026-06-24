import { motion } from 'framer-motion'

export const DecorativeWave = () => (
  <div className='pointer-events-none absolute inset-x-0 bottom-0 h-[32%] w-full overflow-hidden' aria-hidden='true'>
    <svg
      className='absolute bottom-0 left-0 h-full w-full'
      viewBox='0 0 1440 280'
      preserveAspectRatio='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      {/* Lightest Back Wave */}
      <motion.path
        d='M0,180 C240,120 480,240 720,190 C960,140 1200,80 1440,130 L1440,280 L0,280 Z'
        fill='#D8E9FA'
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      {/* Medium Middle Wave */}
      <motion.path
        d='M0,120 C360,210 720,100 1080,170 C1260,205 1350,185 1440,160 L1440,280 L0,280 Z'
        fill='#B8CFE5'
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 0.75, y: 0 }}
        transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
      />
      {/* Main Front Wave */}
      <motion.path
        d='M0,195 C280,245 560,165 840,215 C1120,265 1280,205 1440,225 L1440,280 L0,280 Z'
        fill='#A9C6E0'
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
      />
    </svg>
  </div>
)
