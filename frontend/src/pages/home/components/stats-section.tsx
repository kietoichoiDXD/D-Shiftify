import { useEffect, useRef, useState } from 'react'

import { motion, useInView } from 'framer-motion'
import { Briefcase, Building2, TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const stats = [
  { key: 'jobsPosted', valueKey: 'jobsPostedValue', Icon: Briefcase, numericEnd: 2500 },
  { key: 'candidatesHelped', valueKey: 'candidatesHelpedValue', Icon: Users, numericEnd: 10000 },
  { key: 'companiesOnboard', valueKey: 'companiesOnboardValue', Icon: Building2, numericEnd: 350 },
  { key: 'matchRate', valueKey: 'matchRateValue', Icon: TrendingUp, numericEnd: 94 },
]

const CountUp = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let startTime: number | null = null
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(eased * end))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [isInView, end, duration])

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export const StatsSection = () => {
  const { t } = useTranslation('home')

  return (
    <section id='stats' className='relative py-20 overflow-hidden'>
      {/* Gradient background */}
      <div className='absolute inset-0 bg-gradient-to-r from-brand-primary via-blue-700 to-blue-600 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800' />

      {/* Decorative pattern */}
      <div className='absolute inset-0 opacity-10'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          }}
        />
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className='text-center group'
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className='bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/20 dark:border-white/10'
              >
                <div className='w-14 h-14 mx-auto mb-4 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center'>
                  <stat.Icon className='w-7 h-7 text-white' />
                </div>
                <div className='text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2'>
                  <CountUp
                    end={stat.numericEnd}
                    suffix={stat.key === 'matchRate' ? '%' : '+'}
                  />
                </div>
                <p className='text-blue-100 dark:text-gray-300 font-medium text-sm sm:text-base'>
                  {t(`home.stats.${stat.key}`)}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
