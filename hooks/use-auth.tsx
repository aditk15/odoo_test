"use client"
import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient, isSupabaseConfigured } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null)
      return
    }
    
    const supabase = createClient()
    if (supabase) {
      await supabase.auth.signOut()
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      if (!isSupabaseConfigured()) {
        // Mock user when Supabase is not configured
        if (mounted) {
          setUser({
            id: "mock-user-id",
            email: "demo@example.com",
            user_metadata: { username: "demo_user" },
          } as any)
          setLoading(false)
        }
        return
      }

      const supabase = createClient()
      if (!supabase) {
        if (mounted) {
          setLoading(false)
        }
        return
      }

      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        }
        
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          (
            event: import("@supabase/supabase-js").AuthChangeEvent,
            session: import("@supabase/supabase-js").Session | null
          ) => {
            console.log("Auth state changed:", event, session?.user?.email)
            if (mounted) {
              setUser(session?.user ?? null)
              setLoading(false)
            }
          }
        )

        return () => subscription.unsubscribe()
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const cleanup = initializeAuth()

    return () => {
      mounted = false
      cleanup?.then(fn => fn?.())
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}