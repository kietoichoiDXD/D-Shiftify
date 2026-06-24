import { useState } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const testimonials = ['testimonial1', 'testimonial2', 'testimonial3']

export const TestimonialsSection = () => {
  const { t } = useTranslation('home')
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length)
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section id='testimonials' className='py-24 bg-brand-bg-end dark:bg-gray-900'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-16'
        >
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4'>
            {t('home.testimonials.title')}
          </h2>
          <p className='text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto'>
            {t('home.testimonials.description')}
          </p>
        </motion.div>

        {/* Testimonials carousel */}
        <div className='max-w-4xl mx-auto'>
          <div className='relative'>
            <AnimatePresence mode='wait'>
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-brand-border/50 dark:border-gray-700/50 shadow-lg'>
                  {/* Quote icon */}
                  <div className='w-12 h-12 bg-brand-primary/10 dark:bg-blue-500/10 rounded-xl flex items-center justify-center mb-6'>
                    <Quote className='w-6 h-6 text-brand-primary dark:text-blue-400' />
                  </div>

                  {/* Quote text */}
                  <p className='text-lg sm:text-xl text-gray-700 dark:text-gray-200 leading-relaxed mb-8 italic'>
                    "{t(`home.testimonials.${testimonials[current]}.quote`)}"
                  </p>

                  {/* Star rating */}
                  <div className='flex gap-1 mb-6'>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className='w-5 h-5 fill-amber-400 text-amber-400' />
                    ))}
                  </div>

                  {/* Author info */}
                  <div className='flex items-center gap-4'>
                    <div className='w-14 h-14 rounded-full bg-gradient-to-br from-brand-primary to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center shadow-lg'>
                      <User className='w-7 h-7 text-white' />
                    </div>
                    <div>
                      <h4 className='font-bold text-gray-900 dark:text-white text-lg'>
                        {t(`home.testimonials.${testimonials[current]}.name`)}
                      </h4>
                      <p className='text-gray-500 dark:text-gray-400'>
                        {t(`home.testimonials.${testimonials[current]}.role`)}{' '}
                        <span className='text-brand-primary dark:text-blue-400'>
                          @ {t(`home.testimonials.${testimonials[current]}.company`)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className='flex items-center justify-center gap-4 mt-8'>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prev}
                className='w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-brand-border dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 hover:border-brand-primary dark:hover:border-blue-400 transition-colors shadow-sm'
                aria-label='Previous testimonial'
              >
                <ChevronLeft className='w-5 h-5' />
              </motion.button>

              {/* Dots */}
              <div className='flex gap-2'>
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === current
                        ? 'w-8 bg-brand-primary dark:bg-blue-400'
                        : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={next}
                className='w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-brand-border dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-blue-400 hover:border-brand-primary dark:hover:border-blue-400 transition-colors shadow-sm'
                aria-label='Next testimonial'
              >
                <ChevronRight className='w-5 h-5' />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
