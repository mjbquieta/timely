import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Create axios instance
const api = axios.create({
  baseURL:
    (window as any).env?.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    // Add authorization header if token exists
    if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling auth errors and token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // Handle 401 Unauthorized errors, but skip for login and device endpoints
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't handle 401 errors for login endpoints - let the login component handle them
      if (
        originalRequest.url?.includes('/auth/branch/login') ||
        originalRequest.url?.includes('/auth/company/login') ||
        originalRequest.url?.includes('/auth/attendee/login')
      ) {
        return Promise.reject(error)
      }

      // Don't handle 401 errors for device endpoint - let the device component handle them
      if (originalRequest.url?.includes('/me/branch/device/')) {
        return Promise.reject(error)
      }

      originalRequest._retry = true

      // If we have a refresh token, try to refresh the access token
      if (authStore.refreshToken) {
        try {
          // You can implement token refresh logic here
          // const response = await api.post('/api/v1/auth/refresh', {
          //   refreshToken: authStore.refreshToken
          // })
          // authStore.updateTokens(response.data.accessToken, response.data.refreshToken)

          // For now, just logout the user
          authStore.logout()
          window.location.href = '/branch/login'
        } catch (refreshError) {
          // If refresh fails, logout the user
          authStore.logout()
          window.location.href = '/branch/login'
        }
      } else {
        // No refresh token, logout the user
        authStore.logout()
        window.location.href = '/branch/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
