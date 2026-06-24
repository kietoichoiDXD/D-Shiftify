import { type ReactNode } from 'react'

import { Outlet } from 'react-router-dom'

interface LayoutClientProps {
  children?: ReactNode
}

export default function LayoutClient({ children }: LayoutClientProps) {
  return <main>{children || <Outlet />}</main>
}
