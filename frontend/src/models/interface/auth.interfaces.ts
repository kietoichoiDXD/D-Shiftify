import { type User } from './user.interfaces'

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  role: string
  fullName: string | null
  name?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: AuthUser
}

export interface ApiError {
  status: number
  code: string
  message: string
}

export interface RegisterRequest {
  email: string
  phone: string
  password: string
  role: string
  full_name: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  loading: boolean
}

export interface APIResponse<T> {
  data: T
  message: string
  status: number
  success?: boolean
}

export interface RegisterReponse {
  fullName?: string
  full_name?: string
  email: string
  phone: string
  role: string
}

export interface VerifyEmailReq {
  email: string
  verificationCode: string
}

export interface VerifyEmailRes {
  message: string
}
