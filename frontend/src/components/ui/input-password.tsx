import { forwardRef, useState } from 'react'

import { Eye, EyeOff } from 'lucide-react'

import { PASSWORD_TYPE, TEXT_TYPE } from '@/core/configs/consts'

import { Input, type InputProps } from './input'

export const InputPassword = forwardRef<HTMLInputElement, InputProps>(({ iconLabel, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false)
  const ToggleIcon = isVisible ? EyeOff : Eye

  return (
    <Input
      ref={ref}
      type={isVisible ? TEXT_TYPE : PASSWORD_TYPE}
      icon={<ToggleIcon className='size-5' />}
      iconLabel={iconLabel || (isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu')}
      iconOnClick={() => setIsVisible((current) => !current)}
      {...props}
    />
  )
})

InputPassword.displayName = 'InputPassword'
