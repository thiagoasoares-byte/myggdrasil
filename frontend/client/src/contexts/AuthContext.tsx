import { createContext, useContext, useCallback, useEffect, useState } from "react"
import { api, type User } from "@/api"

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, birth_dt?: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<Pick<User, "name" | "email" | "birth_dt">>) => Promise<void>
  deleteAccount: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkSession = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: User }>("/auth/me")
      setUser(data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const login = async (email: string, password: string) => {
    await api.post("/auth/login", { email, password })
    const { data } = await api.get<{ user: User }>("/auth/me")
    setUser(data.user)
  }

  const signup = async (name: string, email: string, password: string, birth_dt?: string) => {
    await api.post("/user/signup", { name, email, password, birth_dt })
  }

  const logout = async () => {
    await api.post("/auth/logout")
    setUser(null)
  }

  const updateProfile = async (data: Partial<Pick<User, "name" | "email" | "birth_dt">>) => {
    await api.put("/user/profile/update", data)
    await checkSession()
  }

  const deleteAccount = async (password: string) => {
    await api.delete("/user/profile/delete", { data: { password } })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
