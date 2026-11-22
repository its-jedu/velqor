"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  AlertCircle,
  Banknote,
  ChevronRight,
  Flag,
  Plus,
  RefreshCw,
  Swords,
  Trophy,
  Users,
  Wallet,
} from "lucide-react"
import { api, type AdminAnalytics } from "@/lib/api"
import { Button } from "@/components/ui/button"

const card = "rounded-xl border border-border bg-card text-card-foreground"

type Tone = "warning" | "danger" | "primary"
const toneClass: Record<Tone, string> = {
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  primary: "bg-primary/15 text-primary",
}

const roleClass: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  moderator: "bg-warning/15 text-warning",
  player: "bg-muted text-muted-foreground",
}

const naira = (n: number) =>
  `₦${new Intl.NumberFormat("en-NG", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)}`

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" })

const fullDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

/** The API only returns days that have data, so fill the gaps with zeros. */
function fillLast30Days(points: { date: string; value: number }[]) {
  const byDate = new Map(points.map((p) => [p.date, p.value]))
  const out: { label: string; value: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ label: shortDate(key), value: byDate.get(key) ?? 0 })
  }
  return out
}

function BarChart({
  data,
  format = (n) => String(n),
  barClass = "bg-primary",
}: {
  data: { label: string; value: number }[]
  format?: (n: number) => string
  barClass?: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const step = Math.ceil(data.length / 6)

  return (
    <div>
      <div className="flex h-48 items-end gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 items-end">
            <div
              className={`w-full rounded-t ${barClass}`}
              style={{ height: `${d.value === 0 ? 1 : (d.value / max) * 100}%` }}
              title={`${d.label}: ${format(d.value)}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1 text-[10px] text-muted-foreground">
        {data.map((d, i) => (
          <span key={i} className="flex-1 truncate text-center">
            {i % step === 0 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  )
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export default function Analytics() {
  const [data, setData] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await api.adminAnalytics())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const userGrowth = useMemo(
    () =>
      fillLast30Days(
        (data?.charts.user_growth_last_30_days ?? []).map((p) => ({
          date: p.date,
          value: p.count,
        }))
      ),
    [data]
  )

  const depositVolume = useMemo(
    () =>
      fillLast30Days(
        (data?.charts.deposit_volume_last_30_days ?? []).map((p) => ({
          date: p.date,
          value: p.amount,
        }))
      ),
    [data]
  )

  if (error && !data) {
    return (
      <div className={`${card} flex flex-col items-center px-6 py-16 text-center`}>
        <div className="grid size-12 place-items-center rounded-full bg-destructive/15 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Couldn&apos;t load analytics</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" onClick={load}>
          Try again
        </Button>
      </div>
    )
  }

  const k = data?.kpis

  const attention: {
    label: string
    value: number
    hint: string
    href: string
    icon: LucideIcon
    tone: Tone
  }[] = k
    ? [
        { label: "Pending withdrawals", value: k.pending_withdrawals, hint: "Waiting for approval", href: "/admin/transactions", icon: Banknote, tone: "warning" },
        { label: "Open disputes", value: k.open_disputes, hint: "Need a ruling", href: "/admin/tournaments", icon: Swords, tone: "danger" },
        { label: "Flagged accounts", value: k.flagged_accounts, hint: "Review before payouts", href: "/admin/users", icon: Flag, tone: "warning" },
        { label: "Results to confirm", value: k.results_to_confirm, hint: "Tournaments just ended", href: "/admin/tournaments", icon: Trophy, tone: "primary" },
      ]
    : []

  const newUsers30d = (data?.charts.user_growth_last_30_days ?? []).reduce(
    (sum, p) => sum + p.count,
    0
  )

  const kpis = k
    ? [
        { title: "Total users", value: k.total_users.toLocaleString(), sub: `${newUsers30d} new in 30 days`, icon: Users },
        { title: "Active tournaments", value: k.active_tournaments.toLocaleString(), sub: `${k.upcoming_tournaments} upcoming · ${k.completed_tournaments} completed`, icon: Trophy },
        { title: "Total volume", value: naira(k.total_volume), sub: `${naira(k.total_deposits)} in · ${naira(k.total_payouts)} out`, icon: Wallet, money: true },
        { title: "Active players", value: k.active_players.toLocaleString(), sub: `${k.completed_withdrawals} withdrawals completed`, icon: Activity },
      ]
    : []

  const distribution = data?.charts.tournament_distribution ?? []
  const distributionTotal = distribution.reduce((s, d) => s + d.count, 0)
  const signups = data?.recent_signups ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
<p className="mt-1 text-sm text-muted-foreground">
  Platform activity and what needs your attention.
</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link
            href="/admin/tournaments"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Create tournament
          </Link>
        </div>
      </div>

      {/* Needs attention */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Needs attention</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {!data
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${card} flex items-center gap-4 p-4`}>
                  <Skeleton className="size-11 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))
            : attention.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${card} group flex items-center gap-4 p-4 transition-colors hover:border-primary/40`}
                >
                  <div className={`grid size-11 shrink-0 place-items-center rounded-lg ${toneClass[item.tone]}`}>
                    <item.icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-semibold leading-none">{item.value}</p>
                    <p className="mt-1 truncate text-sm font-medium">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.hint}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {!data
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${card} space-y-3 p-5`}>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-36" />
              </div>
            ))
          : kpis.map((kpi) => (
              <div key={kpi.title} className={`${card} p-5`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <kpi.icon className="size-4 text-muted-foreground" />
                </div>
                <p className={`mt-3 text-2xl font-semibold ${kpi.money ? "text-success" : ""}`}>
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
            ))}
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${card} p-5 lg:col-span-2`}>
          <h2 className="font-semibold">New users</h2>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">Last 30 days</p>
          {!data ? <Skeleton className="h-48 w-full" /> : <BarChart data={userGrowth} />}
        </div>

        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tournaments</h2>
            <Link href="/admin/tournaments" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-5">
            {!data ? (
              <Skeleton className="h-32 w-full" />
            ) : distribution.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No tournaments yet.
              </p>
            ) : (
              distribution.map((d) => (
                <div key={d.status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{d.status}</span>
                    <span className="text-muted-foreground">{d.count}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(d.count / (distributionTotal || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className={`${card} p-5`}>
        <h2 className="font-semibold">Deposit volume</h2>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Last 30 days</p>
        {!data ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <BarChart data={depositVolume} format={naira} barClass="bg-success" />
        )}
      </section>

      {/* Recent signups */}
      <section className={`${card} p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent signups</h2>
          <Link href="/admin/users" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {!data &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3"><Skeleton className="h-8 w-48" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))}
              {signups.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-full bg-linear-to-br from-primary to-purple-600 text-xs font-semibold text-white">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${roleClass[u.role] ?? roleClass.player}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{fullDate(u.date_joined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data && signups.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No signups yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}