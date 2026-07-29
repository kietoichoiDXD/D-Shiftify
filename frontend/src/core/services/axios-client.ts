import axios, { HttpStatusCode } from 'axios'

import { AUTH_ENDPOINTS } from '@/core/configs/consts'
import config from '@/core/configs/env'
import isEqual from '@/core/configs/is-equal'
import {
  getAccessTokenFromLS,
  getRefreshTokenFromLS,
  removeAccessTokenFromLS,
  removeRefreshTokenFromLS,
  setAccessTokenToLS,
  setRefreshTokenToLS
} from '@/core/shared/storage'
import { useAuthStore } from '@/core/store/features/auth/authStore'

const controllers = new Map<string, AbortController>()
let isRefreshing = false
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }[] = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const axiosClient = axios.create({
  baseURL: config.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

const refreshClient = axios.create({
  baseURL: config.baseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})
axiosClient.interceptors.request.use(
  (config) => {
    if (config.url) {
      const prevController = controllers.get(config.url)
      if (prevController) {
        prevController.abort()
      }
    }

    const controller = new AbortController()
    config.signal = controller.signal

    if (config.url) {
      controllers.set(config.url, controller)
    }

    const token = getAccessTokenFromLS()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    if (response.config.url) {
      controllers.delete(response.config.url)
    }
    return response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Check if the request is an auth request (login, register...)
    const isAuthRequest = AUTH_ENDPOINTS.some(
      (endpoint) => originalRequest.url && originalRequest.url.includes(endpoint)
    )

    // Only refresh token if it's not an auth request
    if (
      error.response &&
      isEqual(error.response.status, HttpStatusCode.Unauthorized) &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refresh_token = getRefreshTokenFromLS()
        if (!refresh_token) {
          removeAccessTokenFromLS()
          removeRefreshTokenFromLS()
          processQueue(new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại'), null)
          return Promise.reject(error)
        }

        const { data: refreshResponse } = await refreshClient.post('/api/v1/auth/refresh', {
          refresh_token
        })
        const access_token = refreshResponse?.data?.accessToken || refreshResponse?.accessToken
        const next_refresh_token = refreshResponse?.data?.refreshToken || refreshResponse?.refreshToken

        if (!access_token) {
          throw new Error('Refresh response is missing accessToken')
        }

        // Save access token to LocalStorage and update Zustand store state
        setAccessTokenToLS(access_token)
        useAuthStore.setState({ accessToken: access_token, isAuthenticated: true })

        // Save rotated refresh token if returned by backend to prevent token reuse failure
        if (next_refresh_token) {
          setRefreshTokenToLS(next_refresh_token)
          useAuthStore.setState({ refreshToken: next_refresh_token })
        }

        originalRequest.headers.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)
        return axiosClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        removeAccessTokenFromLS()
        removeRefreshTokenFromLS()
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    if (originalRequest?.url) {
      controllers.delete(originalRequest.url)
    }

    return Promise.reject(error)
  }
)

export default axiosClient
