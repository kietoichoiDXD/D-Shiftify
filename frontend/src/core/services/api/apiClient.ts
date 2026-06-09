/**
 * API Client - Centralized Axios Instance
 *
 * This is the SINGLE SOURCE OF TRUTH for all API communication.
 * All HTTP requests MUST go through this client.
 *
 * Features:
 * - Automatic JWT token injection
 * - Global error handling
 * - Request/response logging
 * - Retry logic for failed requests
 * - Offline detection
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import { ApiError } from './errors'
import { useAuthStore } from '@/core/store/auth.store'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const REQUEST_TIMEOUT = 10000 // 10 seconds

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

/**
 * REQUEST INTERCEPTOR
 * - Inject JWT token
 * - Add request ID for tracking
 * - Add request timestamp
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from auth store
    const authStore = useAuthStore.getState()
    const token = authStore.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request ID for tracing
    config.headers['X-Request-ID'] = generateRequestId()

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      })
    }

    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * RESPONSE INTERCEPTOR
 * - Extract data from response
 * - Handle errors globally
 * - Auto-refresh token on 401
 * - Retry failed requests
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status}`, {
        data: response.data,
      })
    }

    // Return data (assuming backend returns { status, data, message })
    return response.data
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: number }
    const responseData = error.response?.data as Record<string, any> | undefined

    // Network error or timeout
    if (!error.response) {
      console.error('[API Network Error]', error.message)
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        statusCode: 0,
      })
    }

    // Handle specific status codes
    switch (error.response.status) {
      case 401: // Unauthorized
        return handle401Error()

      case 403: // Forbidden
        throw new ApiError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this resource.',
          statusCode: 403,
          details: responseData,
        })

      case 429: // Too Many Requests (Rate Limited)
        throw new ApiError({
          code: 'RATE_LIMIT',
          message: 'Too many requests. Please try again later.',
          statusCode: 429,
          details: {
            retryAfter: error.response.headers['retry-after'],
          },
        })

      case 422: // Unprocessable Entity (Validation Error)
        const validationDetails = responseData
        throw new ApiError({
          code: 'VALIDATION_ERROR',
          message: validationDetails?.message || 'Validation failed',
          statusCode: 422,
          details: validationDetails?.details,
        })

      case 500:
      case 502:
      case 503:
      case 504: // Server Errors - Retry
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

/**
 * Handle 401 Unauthorized errors
 * If token expired, try to refresh. Otherwise, redirect to login.
 */
async function handle401Error() {
  const authStore = useAuthStore.getState()

  // Clear session
  authStore.logout()

  // Redirect to login
  window.location.href = '/login'

  throw new ApiError({
    code: 'UNAUTHORIZED',
    message: 'Session expired. Please login again.',
    statusCode: 401,
  })
}

/**
 * Retry logic with exponential backoff
 * Retries failed requests up to 3 times with increasing delay
 */
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

  // Calculate exponential backoff delay
  const delay = Math.pow(2, config._retry) * 1000
  await new Promise((resolve) => setTimeout(resolve, delay))

  return apiClient(config)
}

/**
 * Utility: Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Utility: Check if user is online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Utility: Manually refresh token
 * Call this before making requests if token might be expired
 */
export async function refreshToken(): Promise<string> {
  try {
    const authStore = useAuthStore.getState()
    const refreshToken = authStore.refreshToken

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    })

    const newAccessToken = response.data.data.accessToken
    authStore.setAccessToken(newAccessToken)

    return newAccessToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    useAuthStore.getState().logout()
    throw error
  }
}

export default apiClient
