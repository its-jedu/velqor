"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (identifier: string, password: string, type: "username" | "email") => Promise<User>
  register: (data: any) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      if (api.isAuthenticated()) {
        const response = await api.getMe()
        if (response.success) {
          setUser(response.data.user)
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error)
      api.clearToken()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (
    identifier: string,
    password: string,
    type: "username" | "email"
  ): Promise<User> => {
    const response = await api.login(identifier, password, type)
    if (!response.success) throw new Error(response.message)
    setUser(response.data.user)
    return response.data.user
  }

  const register = async (data: any) => {
    const response = await api.register(data)
    if (response.success) {
      setUser(response.data.user)
    } else {
      throw new Error(response.message)
    }
  }

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}