import axios from 'axios'

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
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
