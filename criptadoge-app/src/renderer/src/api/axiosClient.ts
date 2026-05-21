import axios from 'axios'

const defaultApiUrl = 'http://localhost:8080/api'
const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || defaultApiUrl

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 5000
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cripta_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)
