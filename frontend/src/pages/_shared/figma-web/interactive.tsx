import { type ComponentPropsWithoutRef, type ReactNode } from 'react'

import { motion, useReducedMotion } from 'framer-motion'

import { cn } from '@/core/lib/utils'

type AnimatedButtonProps = ComponentPropsWithoutRef<typeof motion.button> & {
  children: ReactNode
}

export function AnimatedButton({ children, className, type = 'button', ...props }: AnimatedButtonProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.button
      type={type}
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className={cn(
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

type AnimatedCardProps = ComponentPropsWithoutRef<typeof motion.article> & {
  children: ReactNode
}

export function AnimatedCard({ children, className, ...props }: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.article
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn('transition-shadow focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2', className)}
      {...props}
    >
      {children}
    </motion.article>
  )
}
