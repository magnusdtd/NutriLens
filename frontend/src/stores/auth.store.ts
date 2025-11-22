import { create } from 'zustand'
import { type UserProfile } from '@/types'

type AuthState = {
  isAuthenticated: boolean
  user: UserProfile | null
  token: string | null
  setIsAuthenticated: (state: boolean) => void
  setUser: (user: UserProfile | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  setIsAuthenticated: (state: boolean) => set(() => ({ isAuthenticated: state })),
  setUser: (user: UserProfile | null) => set(() => ({ user })),  
  setToken: (token: string | null) =>
    set(() => {
      if (token) {
        localStorage.setItem('accessToken', token)
      } else {
        localStorage.removeItem('accessToken')
      }
      return { token }
    }),
  logout: () => {
    localStorage.removeItem('accessToken')
    set(() => ({ isAuthenticated: false, user: null, token: null }))
  },
}))
