import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginApi, registerApi, type RegisterAdminResponseDto } from '../services/authService'

const TOKEN_KEY = 'systemDefault'

export interface AuthUser {
  admin_user_id: string
  id: string
  name: string
  email: string
  role: string
  active: boolean
  createdAt: string
  updatedAt: string
  iat: number
  exp: number
}

function decodeJwtPayload<T = any>(token: string): T {
  const parts = token.split('.')
  if (parts.length < 2) throw new Error('Geçersiz token')
  const base64Url = parts[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
  const json = decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join(''),
  )
  return JSON.parse(json) as T
}

function isTokenValid(token: string | null): boolean {
  if (!token) return false
  try {
    const payload = decodeJwtPayload<any>(token)
    const exp = Number(payload?.exp)
    if (!exp) return false
    return Date.now() < exp * 1000
  } catch {
    return false
  }
}

interface AuthContextValue {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<RegisterAdminResponseDto>
  logout: () => void
  token: string | null
  user: AuthUser | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }){
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<AuthUser | null>(() => {
    const t = localStorage.getItem(TOKEN_KEY)
    if (!t) return null
    try {
      return decodeJwtPayload<AuthUser>(t)
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  }, [token])

  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }
    try {
      setUser(decodeJwtPayload<AuthUser>(token))
    } catch {
      setUser(null)
    }
  }, [token])

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: isTokenValid(token),
    token,
    user,
    login: async (email: string, password: string) => {
      const res = await loginApi(email, password)
      localStorage.setItem(TOKEN_KEY, res.token)
      setToken(res.token)
    },
    register: async (name: string, email: string, password: string) => {
      return registerApi(name, email, password)
    },
    logout: () => {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    },
  }), [token, user])

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth(){
  const ctx = useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
