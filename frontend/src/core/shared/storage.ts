import {
  ACCESS_TOKEN_LOCAL_STORAGE_KEY,
  REFRESH_TOKEN_LOCAL_STORAGE_KEY,
  USER_LOCAL_STORAGE_KEY
} from '@/core/helpers/common'

export const LocalStorageEventTarget = new EventTarget()

export const setToken = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, refreshToken)
}

export const setUserToLS = (user: any) => {
  localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user))
}

export const getUserFromLS = () => {
  const user = localStorage.getItem(USER_LOCAL_STORAGE_KEY)
  return user ? JSON.parse(user) : null
}

export const clearAuthClientState = () => {
  localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY)
  localStorage.removeItem(USER_LOCAL_STORAGE_KEY)

  const clearLSEvent = new Event('clearLS')
  LocalStorageEventTarget.dispatchEvent(clearLSEvent)
}

export const getAccessTokenFromLS = () => localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY) ?? ''

export const getRefreshTokenFromLS = () => localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY) ?? ''

export const setAccessTokenToLS = (token: string) =>
  localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, token)

export const setRefreshTokenToLS = (token: string) =>
  localStorage.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, token)

export const removeAccessTokenFromLS = () => localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY)

export const removeRefreshTokenFromLS = () => localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY)

