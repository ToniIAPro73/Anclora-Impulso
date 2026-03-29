"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { profileApi } from "@/lib/api"
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
  updateProfile: (nextProfile: Partial<UserProfile>) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function normalizeProfile(source?: Partial<UserProfile> | null) {
  const mergedProfile = mergeUserProfile(source)
  mergedProfile.recommendedPlan = buildRecommendedPlan(mergedProfile)
  return mergedProfile
}

function hasPersistedProfileData(source?: Partial<UserProfile> | null) {
  if (!source) {
    return false
  }

  const { recommendedPlan: _recommendedPlan, ...persistedFields } = source
  return Object.values(persistedFields).some((value) => value !== null && value !== undefined && value !== "")
}

function readLegacyProfile(userId: string) {
  if (typeof window === "undefined") {
    return null
  }

  const stored = window.localStorage.getItem(getProfileStorageKey(userId))
  if (!stored) {
    return null
  }

  try {
    return mergeUserProfile(JSON.parse(stored))
  } catch {
    return null
  }
}

function isNetworkSessionCheckError(error: unknown) {
  return error instanceof TypeError && error.message.toLowerCase().includes("fetch")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile>(mergeUserProfile())
  const [isLoading, setIsLoading] = useState(true)
  const hasCheckedSession = useRef(false)

  const loadProfile = async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(mergeUserProfile())
      return
    }

    const remoteProfile = await profileApi.get()
    const legacyProfile = readLegacyProfile(nextUser.id)

    if (!hasPersistedProfileData(remoteProfile) && hasPersistedProfileData(legacyProfile)) {
      const migratedProfile = await profileApi.update({
        avatarDataUrl: legacyProfile?.avatarDataUrl ?? null,
        sex: legacyProfile?.sex ?? null,
        age: legacyProfile?.age ?? null,
        heightCm: legacyProfile?.heightCm ?? null,
        weightKg: legacyProfile?.weightKg ?? null,
        targetWeightKg: legacyProfile?.targetWeightKg ?? null,
        timeframeWeeks: legacyProfile?.timeframeWeeks ?? null,
        trainingDaysPerWeek: legacyProfile?.trainingDaysPerWeek ?? null,
        trainingGoal: legacyProfile?.trainingGoal ?? null,
        preferredTrainingEnvironment: legacyProfile?.preferredTrainingEnvironment ?? null,
        experienceLevel: legacyProfile?.experienceLevel ?? null,
        limitations: legacyProfile?.limitations ?? [],
        onboardingCompletedAt: legacyProfile?.onboardingCompletedAt ?? null,
      })

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(getProfileStorageKey(nextUser.id))
      }

      setProfile(normalizeProfile(migratedProfile))
      return
    }

    setProfile(normalizeProfile(remoteProfile))
  }

  useEffect(() => {
    if (hasCheckedSession.current) {
      return
    }

    hasCheckedSession.current = true

    const checkSession = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await authApi.getCurrentUser()
        setUser(currentUser)
        await loadProfile(currentUser)
      } catch (error) {
        if (!isNetworkSessionCheckError(error)) {
          console.error("Error al verificar sesión:", error)
        }
        authApi.logout()
        setUser(null)
        setProfile(mergeUserProfile())
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })

    localStorage.setItem("refreshToken", response.refreshToken)
    setUser(response.user)
    await loadProfile(response.user)
  }

  const signup = async (email: string, password: string, fullName: string) => {
    const response = await authApi.register({ email, password, fullName })

    localStorage.setItem("refreshToken", response.refreshToken)
    setUser(response.user)
    await loadProfile(response.user)
  }

  const updateProfile = async (nextProfile: Partial<UserProfile>) => {
    const { recommendedPlan: _recommendedPlan, ...persistedFields } = nextProfile

    if (!user) {
      setProfile((currentProfile) => normalizeProfile({ ...currentProfile, ...persistedFields }))
      return
    }

    const updatedProfile = await profileApi.update(persistedFields)
    setProfile(normalizeProfile(updatedProfile))

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(getProfileStorageKey(user.id))
    }
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
