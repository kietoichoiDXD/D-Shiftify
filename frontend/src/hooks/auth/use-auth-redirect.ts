import { useEffect } from 'react'

import { useNavigate } from 'react-router-dom'

import { getDashboardRouteByRole } from '@/core/helpers/auth-route'
import { useAuthStore } from '@/core/store/features/auth/authStore'
import { useAuth } from '@/hooks/auth/use-auth'

export const useAuthRedirect = () => {
  const { isAuthenticated } = useAuth()
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDashboardRouteByRole(user?.role), { replace: true })
    }
  }, [isAuthenticated, navigate, user?.role])
}
