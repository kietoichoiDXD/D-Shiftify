import { useCallback, useEffect } from 'react'

import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import {
  SiEslint,
  SiGit,
  SiGithub,
  SiJest,
  SiPrettier,
  SiReact,
  SiReactquery,
  SiShadcnui,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite
} from 'react-icons/si'

import { speakAccessibleText } from '@/core/services/speech.service'

const techStack = [
  { name: 'React', icon: SiReact, color: 'text-brand-primary' },
  { name: 'TypeScript', icon: SiTypescript, color: 'text-brand-primary' },
  { name: 'TailwindCSS', icon: SiTailwindcss, color: 'text-brand-primary' },
  { name: 'Vite', icon: SiVite, color: 'text-brand-primary' },
  { name: 'React Query', icon: SiReactquery, color: 'text-brand-primary' },
  { name: 'Jest', icon: SiJest, color: 'text-brand-primary' },
  { name: 'ESLint', icon: SiEslint, color: 'text-brand-primary' },
  { name: 'Prettier', icon: SiPrettier, color: 'text-brand-primary' },
  { name: 'Git', icon: SiGit, color: 'text-brand-primary' },
  { name: 'GitHub', icon: SiGithub, color: 'text-brand-primary' },
  { name: 'Shadcn/UI', icon: SiShadcnui, color: 'text-brand-primary' },
  { name: 'Vercel', icon: SiVercel, color: 'text-brand-primary' }
]

export const TechStackSection = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    dragFree: true
  })

  const autoplay = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const interval = setInterval(autoplay, 2500)
    return () => clearInterval(interval)
  }, [emblaApi, autoplay])

  const handleSpeakTech = () => {
    speakAccessibleText(
      'Công nghệ chính của Shiftify bao gồm: React mười chín, Express, PostgreSQL, Supabase, Google Cloud Speech AI, và Tailwind CSS.'
    )
  }

  return (
    <section id='tech-stack' className='py-20 bg-[#0A0A0C] border-t border-slate-900 overflow-hidden text-white relative'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16 space-y-4'>
          <h2 className='text-3xl sm:text-4xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-2'>
            Công nghệ cốt lõi
            <button
              type='button'
              onClick={handleSpeakTech}
              aria-label='Đọc danh sách công nghệ'
              className='text-slate-400 hover:text-white transition focus:outline-none'
            >
              <Volume2 className='w-5 h-5' />
            </button>
          </h2>
          <p className='text-lg text-slate-400 font-medium max-w-3xl mx-auto'>
            Xây dựng trên nền tảng kỹ thuật tối tân, đảm bảo tốc độ phản hồi cực nhanh và trợ năng tối đa.
          </p>
        </div>

        <div className='relative'>
          <div className='overflow-hidden' ref={emblaRef}>
            <div className='flex gap-4'>
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className='flex-[0_0_40%] sm:flex-[0_0_25%] md:flex-[0_0_20%] lg:flex-[0_0_16%] px-1'
                >
                  <div className='flex flex-col items-center p-6 border border-slate-900 bg-slate-950/40 hover:border-indigo-500/30 hover:bg-[#111115]/60 transition-all rounded-none'>
                    <div className='w-12 h-12 mb-3'>
                      <tech.icon className='w-full h-full text-indigo-500 hover:text-indigo-400 transition-colors' />
                    </div>
                    <span className='text-[10px] font-black uppercase tracking-wider text-slate-400 text-center'>
                      {tech.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
