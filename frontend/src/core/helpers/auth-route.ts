import { ROLE_ADMIN, ROLE_EMPLOYEE } from '@/core/configs/consts'
import { ROUTE } from '@/core/constants/path'

export const getDashboardRouteByRole = (role?: string | null) => {
  const normalizedRole = role?.trim().toLowerCase()

  if (!normalizedRole) {
    return ROUTE.DISABILITY.JOBS
  }

  if ([ROLE_ADMIN, ROLE_EMPLOYEE].some((adminRole) => adminRole.toLowerCase() === normalizedRole)) {
    return `${ROUTE.ADMIN.ROOT}/${ROUTE.ADMIN.DASHBOARD}`
  }

  if (['business', 'recruiter', 'employer', 'company'].includes(normalizedRole)) {
    return ROUTE.BUSINESS.MATCHED_CANDIDATES
  }

  if (['training_center', 'educator', 'education'].includes(normalizedRole)) {
    return ROUTE.EDUCATOR.PROFILE_UPDATE
  }

  return ROUTE.DISABILITY.JOBS
}

export const getMatchingRouteByRole = (role?: string | null) => {
  const normalizedRole = role?.trim().toLowerCase()

  if (['business', 'recruiter', 'employer', 'company'].includes(normalizedRole || '')) {
    return ROUTE.BUSINESS.MATCHED_CANDIDATES
  }

  return ROUTE.DISABILITY.JOBS
}

