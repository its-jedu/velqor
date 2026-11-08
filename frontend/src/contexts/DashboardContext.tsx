"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  fetchMatches,
  fetchStats,
  fetchTournaments,
  fetchWallet,
  type DashboardStatsData,
  type Match,
  type Tournament,
  type WalletData,
} from "@/lib/mock-data"

interface DashboardState {
  wallet: WalletData | null
  stats: DashboardStatsData | null
  tournaments: Tournament[]
  matches: Match[]
  loading: boolean
  error: string | null
  reload: () => void
}

const DashboardContext = createContext<DashboardState | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [stats, setStats] = useState<DashboardStatsData | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([fetchWallet(), fetchStats(), fetchTournaments(), fetchMatches()])
      .then(([w, s, t, m]) => {
        if (cancelled) return
        setWallet(w)
        setStats(s)
        setTournaments(t)
        setMatches(m)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Could not load your dashboard")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  const reload = useCallback(() => setAttempt((a) => a + 1), [])

  return (
    <DashboardContext.Provider
      value={{ wallet, stats, tournaments, matches, loading, error, reload }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error("useDashboard must be used within a DashboardProvider")
  return ctx
}