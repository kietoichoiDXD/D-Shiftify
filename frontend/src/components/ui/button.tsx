import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'
import { motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { cn } from '@/core/lib/utils'

import { buttonVariants } from './button-variants'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  iconStart?: React.ReactNode
  iconEnd?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, asChild = false, children, iconStart, iconEnd, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const MotionButton = motion.button as unknown as React.ElementType

    if (asChild) {
      return (
        <Slot disabled={loading} className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Slot>
      )
    }

    return (
      <MotionButton
        disabled={loading}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        {...props}
      >
        {iconStart && <span className='mr-2'>{iconStart}</span>}
        {loading && <Loader2 data-testid='loader' className='w-4 h-4 mr-2 animate-spin' />}
        {children}
        {iconEnd && <span className='ml-2'>{iconEnd}</span>}
      </MotionButton>
    )
  }
)
Button.displayName = 'Button'

export { Button }
