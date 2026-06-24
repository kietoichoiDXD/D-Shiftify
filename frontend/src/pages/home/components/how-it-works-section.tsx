import { motion } from 'framer-motion'
import { ArrowRight, Rocket, Search, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const steps = [
  { key: 'step1', Icon: UserPlus, number: '01' },
  { key: 'step2', Icon: Search, number: '02' },
  { key: 'step3', Icon: Rocket, number: '03' },
]

export const HowItWorksSection = () => {
  const { t } = useTranslation('home')

  return (
    <section id='how-it-works' className='py-24 bg-white dark:bg-gray-800'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-20'
        >
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4'>
            {t('home.howItWorks.title')}
          </h2>
          <p className='text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            {t('home.howItWorks.description')}
          </p>
        </motion.div>

        {/* Steps */}
        <div className='relative max-w-5xl mx-auto'>
          {/* Connecting line (desktop) */}
          <div className='hidden lg:block absolute top-24 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-brand-primary/20 via-brand-primary/40 to-brand-primary/20 dark:from-blue-500/20 dark:via-blue-500/40 dark:to-blue-500/20' />

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8'>
            {steps.map((step, index) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className='relative text-center'
              >
                {/* Step number circle */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className='relative mx-auto w-20 h-20 mb-8'
                >
                  <div className='absolute inset-0 rounded-full bg-gradient-to-br from-brand-primary to-blue-600 dark:from-blue-500 dark:to-blue-700 shadow-lg shadow-brand-primary/30 dark:shadow-blue-500/30' />
                  <div className='absolute inset-0 rounded-full flex items-center justify-center'>
                    <step.Icon className='w-8 h-8 text-white' />
                  </div>
                  {/* Pulse ring */}
                  <motion.div
                    className='absolute inset-0 rounded-full border-2 border-brand-primary/30 dark:border-blue-400/30'
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.5 }}
                  />
                </motion.div>

                {/* Step number label */}
                <span className='inline-block text-sm font-bold text-brand-primary dark:text-blue-400 bg-brand-bg-end dark:bg-blue-900/30 px-3 py-1 rounded-full mb-4'>
                  {step.number}
                </span>

                <h3 className='text-xl font-bold text-gray-900 dark:text-white mb-3'>
                  {t(`home.howItWorks.${step.key}.title`)}
                </h3>
                <p className='text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs mx-auto'>
                  {t(`home.howItWorks.${step.key}.description`)}
                </p>

                {/* Arrow between steps (mobile) */}
                {index < steps.length - 1 && (
                  <div className='lg:hidden flex justify-center my-6'>
                    <ArrowRight className='w-6 h-6 text-brand-primary/40 dark:text-blue-400/40 rotate-90' />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
