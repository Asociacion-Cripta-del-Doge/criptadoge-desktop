import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiClient } from '../api/axiosClient'

export interface User {
  id: number | string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('cripta_token')
    localStorage.removeItem('cripta_user')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('cripta_token', token)
    localStorage.setItem('cripta_user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('cripta_token')
      const storedUser = localStorage.getItem('cripta_user')

      if (!token || !storedUser) {
        setIsLoading(false)
        return
      }

      try {
        const parsed = JSON.parse(storedUser)
        const { data } = await apiClient.get(`/usuarios/${parsed.id}`)
        setUser(data)
        setIsAuthenticated(true)
      } catch {
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    validateSession()
  }, [logout])

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout)
    return () => window.removeEventListener('auth:unauthorized', logout)
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
