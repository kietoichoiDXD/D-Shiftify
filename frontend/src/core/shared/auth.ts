import { type AuthState } from '@/core/store/features/auth/types'
import { type AuthUser } from '@/models/interface/auth.interfaces'

export const getPersistedAuth = (): Partial<AuthState> => ({})

export const isAuthenticated = (): boolean => false

export const getCurrentUser = (): AuthUser | null => null
