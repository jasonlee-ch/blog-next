"use client"

import type React from "react"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Session, User } from "@supabase/supabase-js"
import { useDisconnect } from "wagmi"

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
  }>
  signInWithGitHub: () => Promise<{
    error: Error | null
  }>
  // 供 RainbowKit 认证适配器在 verify 成功后调用，将 session 同步到 Supabase 客户端
  setSessionFromWallet: (session: Session) => Promise<void>
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    error: Error | null
  }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabaseClient()

  const { disconnect } = useDisconnect();

  useEffect(() => {
    // 初始化时检查用户状态
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      console.log("Auth state changed:", _event, session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 邮箱&密码登录
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  // GitHub 登录
  const signInWithGitHub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "read:user user:email",
      },
    })
    return { error }
  }

  // 供 RainbowKit 认证适配器调用：将后端生成的 session 同步到前端 Supabase 客户端
  const setSessionFromWallet = useCallback(async (session: Session) => {
    const { error } = await supabase.auth.setSession(session)
    if (error) {
      console.error("Failed to set wallet session:", error)
      throw error
    }
  }, [supabase])

  // 邮箱&密码注册
  // TODO-LJJ: 当使用了邮箱注册后，同时又使用相同的github账号注册，最终怎么存储
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  // logout
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    disconnect()
  }, [supabase, disconnect])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGitHub, setSessionFromWallet, signUp, signOut }}>
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
