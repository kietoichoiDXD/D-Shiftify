import { create } from 'zustand'

import { authApi } from '@/core/services/auth.service'
import { getPersistedAuth } from '@/core/shared/auth'
import { clearAuthClientState, setAccessTokenToLS, setRefreshTokenToLS } from '@/core/shared/storage'
import { type LoginResponse } from '@/models/interface/auth.interfaces'

import { type AuthState, type AuthStore } from './types'

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,
  ...getPersistedAuth(),

  loginStart: () => {
    set({
      isLoading: true,
      error: null
    })
  },

  loginSuccess: (data: LoginResponse) => {
    set({
      isLoading: false,
      isAuthenticated: true,
      user: {
        ...data.user,
        name: data.user.fullName || data.user.email
      },
      error: null
    })
  },

  loginFailure: (error: string) => {
    set({
      isLoading: false,
      error
    })
  },

  logout: () => {
    void authApi.logout().finally(() => {
      clearAuthClientState()
      set({
        ...initialState
      })
    })
  },

  updateUser: (user: LoginResponse['user']) => {
    set({
      user
    })
  },

  setToken: (accessToken: string, refreshToken: string) => {
    setAccessTokenToLS(accessToken)
    setRefreshTokenToLS(refreshToken)
    set({ accessToken, refreshToken })
  },

  clearToken: () => {
    set({ accessToken: null, refreshToken: null })
  }
}))
