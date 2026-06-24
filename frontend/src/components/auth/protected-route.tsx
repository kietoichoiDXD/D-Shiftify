import { type ReactNode } from 'react'

import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { useAuthStore } from '@/core/store/features/auth/authStore'

interface ProtectedRouteProps {
  children?: ReactNode
  redirectPath?: string
}

const ProtectedRoute = ({ children, redirectPath = ROUTE.PUBLIC.LOGIN }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
