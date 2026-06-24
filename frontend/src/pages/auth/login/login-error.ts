import { AxiosError } from 'axios'

import { ApiErrorSchema } from '@/core/zod'

export const LOGIN_NETWORK_ERROR = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.'
export const LOGIN_SERVER_ERROR = 'Hiện chưa thể đăng nhập. Vui lòng thử lại sau.'
export const LOGIN_UNAUTHORIZED_ERROR = 'Email hoặc mật khẩu không chính xác.'

export const getLoginErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const parsedError = ApiErrorSchema.safeParse(error.response?.data)

    if (status === 401) {
      return LOGIN_UNAUTHORIZED_ERROR
    }

    if (status === 400 && parsedError.success) {
      return parsedError.data.message
    }

    if (status === 500) {
      return LOGIN_SERVER_ERROR
    }

    return LOGIN_NETWORK_ERROR
  }

  return LOGIN_NETWORK_ERROR
}
