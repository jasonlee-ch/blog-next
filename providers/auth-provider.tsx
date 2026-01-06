"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

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
  signInWithWallet: (
    address: string,
    message: string,
    signature: string,
    ensName?: string | null,
    ensAvatar?: string | null
  ) => Promise<{ error: Error | null }>
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

  useEffect(() => {
    // 初始化时检查用户状态
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      // 根据
      console.log("Auth state changed:", session)
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
        scopes: "read:user user:email", // 明确请求用户邮箱权限
      },
    })
    return { error }
  }

  // 钱包登录
  const signInWithWallet = async (address: string, message: string, signature: string, ensName?: string | null, ensAvatar?: string | null) => {
    try {
      const response = await fetch('/auth/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature, ensName, ensAvatar }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Wallet login failed');

      const { error } = await supabase.auth.setSession(data.session);
      return { error };
    } catch (error: any) {
      return { error };
    }
  }

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
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGitHub, signInWithWallet, signUp, signOut }}>
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
