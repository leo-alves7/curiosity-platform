import axios, { InternalAxiosRequestConfig } from 'axios'
import { signOut } from 'firebase/auth'
import { auth } from '../auth/firebase'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8081',
})

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as {
      config: InternalAxiosRequestConfig & { _retry?: boolean }
      response?: { status: number }
    }
    const originalRequest = axiosError.config
    if (axiosError.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const user = auth.currentUser
      if (user) {
        try {
          const token = await user.getIdToken(true)
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        } catch {
          await signOut(auth).catch(() => {})
          return Promise.reject(error)
        }
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
