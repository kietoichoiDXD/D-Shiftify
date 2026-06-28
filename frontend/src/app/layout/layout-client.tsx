import { type ReactNode } from 'react'

import { Outlet, useLocation } from 'react-router-dom'

import AccessibilityChatbot from '@/components/accessibility/AccessibilityChatbot'
import AccessibilityToolbar from '@/components/accessibility/AccessibilityToolbar'

import DisabilityLayout from './disability-layout'

interface LayoutClientProps {
  children?: ReactNode
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const { pathname } = useLocation()
  const content = children || <Outlet />

  const isDisability =
    pathname.startsWith('/disability') ||
    pathname === '/dashboard/disability' ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/call') ||
    pathname.startsWith('/video-call')

  return (
    <>
      {isDisability ? <DisabilityLayout>{content}</DisabilityLayout> : <main>{content}</main>}
      <AccessibilityToolbar />
      <AccessibilityChatbot />
    </>

  )
}
