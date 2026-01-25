import { create } from 'zustand'
import type { TokenData, LogEntry } from '../api'

interface AuthState {
  token: string | null
  username: string | null
  setAuth: (token: string, username: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('adminToken'),
  username: localStorage.getItem('username'),
  setAuth: (token, username) => {
    localStorage.setItem('adminToken', token)
    localStorage.setItem('username', username)
    set({ token, username })
  },
  logout: () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('username')
    set({ token: null, username: null })
  },
  isAuthenticated: () => !!get().token,
}))

export type { TokenData as Token }

interface TokenState {
  tokens: TokenData[]
  loading: boolean
  selectedIds: Set<number>
  statusFilter: 'all' | 'active' | 'disabled' | 'expired'
  setTokens: (tokens: TokenData[]) => void
  setLoading: (loading: boolean) => void
  setSelectedIds: (ids: Set<number>) => void
  toggleSelect: (id: number) => void
  selectAll: () => void
  clearSelection: () => void
  setStatusFilter: (filter: 'all' | 'active' | 'disabled' | 'expired') => void
  filteredTokens: () => TokenData[]
}

export const useTokenStore = create<TokenState>((set, get) => ({
  tokens: [],
  loading: false,
  selectedIds: new Set(),
  statusFilter: 'all',
  setTokens: (tokens) => set({ tokens: Array.isArray(tokens) ? tokens : [] }),
  setLoading: (loading) => set({ loading }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelect: (id) => {
    const newSet = new Set(get().selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    set({ selectedIds: newSet })
  },
  selectAll: () => {
    const filtered = get().filteredTokens()
    set({ selectedIds: new Set(filtered.map((t) => t.id)) })
  },
  clearSelection: () => set({ selectedIds: new Set() }),
  setStatusFilter: (filter) => set({ statusFilter: filter, selectedIds: new Set() }),
  filteredTokens: () => {
    const { tokens, statusFilter } = get()
    const tokenArray = Array.isArray(tokens) ? tokens : []
    if (statusFilter === 'all') return tokenArray
    if (statusFilter === 'active') return tokenArray.filter((t) => t.is_active && !t.is_expired)
    if (statusFilter === 'disabled') return tokenArray.filter((t) => !t.is_active)
    if (statusFilter === 'expired') return tokenArray.filter((t) => t.is_expired)
    return tokenArray
  },
}))

interface Stats {
  total_tokens: number
  active_tokens: number
  total_images: number
  total_videos: number
  total_errors: number
  today_images: number
  today_videos: number
  today_errors: number
}

interface StatsState {
  stats: Stats | null
  setStats: (stats: Stats) => void
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  setStats: (stats) => set({ stats }),
}))

interface LogState {
  logs: LogEntry[]
  loading: boolean
  setLogs: (logs: LogEntry[]) => void
  setLoading: (loading: boolean) => void
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  loading: false,
  setLogs: (logs) => set({ logs: Array.isArray(logs) ? logs : [] }),
  setLoading: (loading) => set({ loading }),
}))

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: number) => void
}

let toastId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = ++toastId
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
