import { type AxiosInstance } from 'axios'

import axiosClient from '@/core/services/axios-client'
import {
  type VerifyEmailReq,
  type LoginResponse,
  type RegisterReponse,
  type VerifyEmailRes,
  type LoginRequest,
  type RegisterRequest,
  type ForgotPasswordRequest,
  type ForgotPasswordResponse
} from '@/models/interface/auth.interfaces'

const API_AUTH_BASE_URL = '/api/v1/auth'
const API_LOGIN_URL = `${API_AUTH_BASE_URL}/login`
const API_REGISTER_URL = `${API_AUTH_BASE_URL}/register`
const API_REFRESH_TOKEN_URL = `${API_AUTH_BASE_URL}/refresh`
const API_VERIFY_EMAIL_URL = `${API_AUTH_BASE_URL}/verify-email`
const API_FORGOT_PASSWORD_URL = `${API_AUTH_BASE_URL}/forgot-password`
const API_RESEND_CODE_URL = `${API_AUTH_BASE_URL}/resend-verification-email`
const API_LOGOUT_URL = `${API_AUTH_BASE_URL}/logout`

export type AuthApi = {
  login: (params: LoginRequest) => Promise<LoginResponse>
  register: (params: RegisterRequest) => Promise<RegisterReponse>
  refreshToken: (refreshToken: string) => Promise<LoginResponse>
  verifyEmail: (params: VerifyEmailReq) => Promise<VerifyEmailRes>
  forgotPassword: (params: ForgotPasswordRequest) => Promise<ForgotPasswordResponse>
  resendVerificationCode: (email: string) => Promise<{ message: string }>
  logout: () => Promise<void>
}

export const createAuthApi = (client: AxiosInstance): AuthApi => ({
  login(params) {
    return client.post(API_LOGIN_URL, params, { withCredentials: true }) as Promise<LoginResponse>
  },
  register(params) {
    return client.post(API_REGISTER_URL, params) as Promise<RegisterReponse>
  },
  refreshToken(refreshToken) {
    return client.post(API_REFRESH_TOKEN_URL, { refresh_token: refreshToken }) as Promise<LoginResponse>
  },
  verifyEmail(params) {
    return client.post(API_VERIFY_EMAIL_URL, params) as Promise<VerifyEmailRes>
  },
  forgotPassword(params) {
    return client.post(API_FORGOT_PASSWORD_URL, params) as Promise<ForgotPasswordResponse>
  },
  resendVerificationCode(email) {
    return client.post(API_RESEND_CODE_URL, { email }) as Promise<{ message: string }>
  },
  logout() {
    return client.post(API_LOGOUT_URL, undefined, { withCredentials: true }) as Promise<void>
  }
})

export const authApi: AuthApi = createAuthApi(axiosClient)
