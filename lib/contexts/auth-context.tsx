"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authApi, type User } from "@/lib/api/auth"
import {
  buildRecommendedPlan,
  getProfileStorageKey,
  mergeUserProfile,
  type UserProfile,
} from "@/lib/user-profile"

interface AuthContextType {
  user: User | null
  profile: UserProfile
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, fullName: string) => Promise<void>
  updateProfile: (nextProfile: Partial<UserProfile>) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile>(mergeUserProfile())
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = (nextUser: User | null) => {
    if (typeof window === "undefined" || !nextUser) {
      setProfile(mergeUserProfile())
      return
    }

    const stored = window.localStorage.getItem(getProfileStorageKey(nextUser.id))
    const mergedProfile = mergeUserProfile(stored ? JSON.parse(stored) : null)
    mergedProfile.recommendedPlan = buildRecommendedPlan(mergedProfile)
    setProfile(mergedProfile)
  }

  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
        loadProfile(currentUser)
      } catch (error) {
        console.error('Error al verificar sesión:', error)
        // Si el token es inválido, limpiar
        authApi.logout()
        setProfile(mergeUserProfile())
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
    loadProfile(response.user)
  }

  const signup = async (email: string, password: string, fullName: string) => {
    const response = await authApi.register({ email, password, fullName })
    
    // Guardar refresh token
    localStorage.setItem('refreshToken', response.refreshToken)
    
    setUser(response.user)
    loadProfile(response.user)
  }

  const updateProfile = (nextProfile: Partial<UserProfile>) => {
    setProfile((currentProfile) => {
      const mergedProfile = mergeUserProfile({
        ...currentProfile,
        ...nextProfile,
      })

      mergedProfile.recommendedPlan = buildRecommendedPlan(mergedProfile)

      if (typeof window !== "undefined" && user) {
        window.localStorage.setItem(getProfileStorageKey(user.id), JSON.stringify(mergedProfile))
      }

      return mergedProfile
    })
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
    setProfile(mergeUserProfile())
  }

  return (
    <AuthContext.Provider value={{ user, profile, login, signup, updateProfile, logout, isLoading }}>
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
