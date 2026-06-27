import { type ReactNode } from 'react'

import { Outlet, useLocation } from 'react-router-dom'

import DisabilityLayout from './disability-layout'

interface LayoutClientProps {
  children?: ReactNode
}

// Route-aware shell: wraps authenticated pages in the role-specific top navigation
// that matches the Figma design. Disability routes (and the candidate-facing chat)
// get the blue DisabilityLayout header; other roles fall back to a bare main for now.
export default function LayoutClient({ children }: LayoutClientProps) {
  const { pathname } = useLocation()
  const content = children || <Outlet />

  const isDisability =
    pathname.startsWith('/disability') ||
    pathname === '/dashboard/disability' ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/call') ||
    pathname.startsWith('/video-call')

  if (isDisability) {
    return <DisabilityLayout>{content}</DisabilityLayout>
  }

  return <main>{content}</main>
}
