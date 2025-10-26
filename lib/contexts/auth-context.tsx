"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { db, type User } from "@/lib/storage/db"
import { seedExercises } from "@/lib/storage/seed-exercises"

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
    // Initialize database and seed exercises
    db.init().then(() => {
      seedExercises()
    })

    // Check for existing session
    const userId = localStorage.getItem("userId")
    if (userId) {
      db.get<User>("users", userId).then((user) => {
        if (user) {
          setUser(user)
        } else {
          localStorage.removeItem("userId")
        }
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const users = await db.getAll<User>("users")
    const user = users.find((u) => u.email === email && u.password === password)

    if (!user) {
      throw new Error("Invalid email or password")
    }

    setUser(user)
    localStorage.setItem("userId", user.id)
  }

  const signup = async (email: string, password: string, fullName: string) => {
    const users = await db.getAll<User>("users")
    const existingUser = users.find((u) => u.email === email)

    if (existingUser) {
      throw new Error("User already exists")
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password,
      fullName,
      createdAt: new Date().toISOString(),
    }

    await db.add("users", newUser)
    setUser(newUser)
    localStorage.setItem("userId", newUser.id)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("userId")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
