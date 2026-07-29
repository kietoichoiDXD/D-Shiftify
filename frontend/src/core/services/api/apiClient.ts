import axios, { type AxiosInstance, type AxiosError, type AxiosRequestConfig } from 'axios'

import {
  getAccessTokenFromLS,
  getRefreshTokenFromLS,
  setAccessTokenToLS,
  removeAccessTokenFromLS,
  removeRefreshTokenFromLS,
  LocalStorageEventTarget
} from '@/core/shared/storage'

import { ApiError } from './errors'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const REQUEST_TIMEOUT = 10000

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessTokenFromLS()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    config.headers['X-Request-ID'] = generateRequestId()
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: number }
    const responseData = error.response?.data as Record<string, any> | undefined

    if (!error.response) {
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      })
    }

    switch (error.response.status) {
      case 401:
        return handle401Error(originalRequest)

      case 403:
        throw new ApiError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource.',
          statusCode: 403,
          details: responseData,
        })

      case 429:
        throw new ApiError({
          code: 'RATE_LIMIT',
          message: 'Too many requests. Please try again later.',
          statusCode: 429,
          details: {
            retryAfter: error.response.headers['retry-after'],
          },
        })

      case 422: {
        const validationDetails = responseData
        throw new ApiError({
          code: 'VALIDATION_ERROR',
          message: validationDetails?.message || 'Validation failed',
          statusCode: 422,
          details: validationDetails?.details,
        })
      }

      case 500:
      case 502:
      case 503:
      case 504:
        return retryRequest(originalRequest, error)

      default:
        throw new ApiError({
          code: responseData?.code || 'UNKNOWN_ERROR',
          message: responseData?.message || error.message,
          statusCode: error.response.status,
          details: responseData,
        })
    }
  }
)

async function handle401Error(
  config: AxiosRequestConfig & { _authRetry?: boolean }
): Promise<never> {
  const storedRefreshToken = getRefreshTokenFromLS()

  if (!config._authRetry && storedRefreshToken) {
    try {
      config._authRetry = true
      const newAccessToken = await refreshToken()
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${newAccessToken}`,
      }
      return apiClient(config)
    } catch (_error) {
      triggerLogout()
    }
  } else {
    triggerLogout()
  }

  throw new ApiError({
    code: 'UNAUTHORIZED',
    message: 'Session expired. Please login again.',
    statusCode: 401,
  })
}

function triggerLogout() {
  removeAccessTokenFromLS()
  removeRefreshTokenFromLS()
  const clearLSEvent = new Event('clearLS')
  LocalStorageEventTarget.dispatchEvent(clearLSEvent)
}

async function retryRequest(
  config: AxiosRequestConfig & { _retry?: number },
  error: AxiosError
): Promise<never> {
  config._retry = (config._retry || 0) + 1

  if (config._retry > 3) {
    throw new ApiError({
      code: 'MAX_RETRIES_EXCEEDED',
      message: 'Request failed after multiple attempts.',
      statusCode: error.response?.status || 500,
    })
  }

  const delay = Math.pow(2, config._retry) * 1000
  await new Promise((resolve) => setTimeout(resolve, delay))

  return apiClient(config)
}

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function isOnline(): boolean {
  return navigator.onLine
}

export async function refreshToken(): Promise<string> {
  const storedRefreshToken = getRefreshTokenFromLS()

  if (!storedRefreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
    refresh_token: storedRefreshToken,
  })

  const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken
  if (!newAccessToken) {
    throw new Error('Refresh response missing accessToken')
  }

  setAccessTokenToLS(newAccessToken)

  const newRefreshToken = response.data?.data?.refreshToken || response.data?.refreshToken
  if (newRefreshToken) {
    const { setRefreshTokenToLS } = await import('@/core/shared/storage')
    setRefreshTokenToLS(newRefreshToken)
  }

  return newAccessToken
}

export default apiClient
