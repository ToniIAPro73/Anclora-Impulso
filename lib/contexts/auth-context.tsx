"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authApi, type User } from "@/lib/api/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const currentUser = await authApi.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error)
        // Si el token es inválido, limpiar
        authApi.logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    
    // Guardar refresh token
    localStorage.setItem('refreshToken', response.refreshToken)
    
    setUser(response.user)
  }

  const signup = async (email: string, password: string, fullName: string) => {
    const response = await authApi.register({ email, password, fullName })
    
    // Guardar refresh token
    localStorage.setItem('refreshToken', response.refreshToken)
    
    setUser(response.user)
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
