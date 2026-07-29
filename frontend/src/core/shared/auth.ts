import { type AuthState } from '@/core/store/features/auth/types'
import {
  getAccessTokenFromLS,
  getRefreshTokenFromLS,
  getUserFromLS
} from '@/core/shared/storage'
import { type AuthUser } from '@/models/interface/auth.interfaces'

export const getPersistedAuth = (): Partial<AuthState> => {
  const accessToken = getAccessTokenFromLS()
  const refreshToken = getRefreshTokenFromLS()
  const user = getUserFromLS()

  return {
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
    user: user || null,
    isAuthenticated: !!(accessToken && user)
  }
}

export const isAuthenticated = (): boolean => !!getAccessTokenFromLS() && !!getUserFromLS()

export const getCurrentUser = (): AuthUser | null => getUserFromLS()
