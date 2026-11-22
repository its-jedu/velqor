"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  Users,
  Trophy,
  Wallet,
  Activity,
  ArrowUpRight,
  Banknote,
  Flag,
  Swords,
  Plus,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  UserCheck,
} from "lucide-react"
import { api, type AdminDashboard } from "@/lib/api"
import { Button } from "@/components/ui/button"

const card = "rounded-xl border border-border bg-card text-card-foreground"
const NOT_API = "(not from api)"

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

// ---------- Mock data (NOT from the API yet) ----------

const mockKpis = [
  { title: "Active tournaments", value: "24", change: "+3", icon: Trophy, spark: [14, 16, 15, 18, 20, 19, 22, 24] },
  { title: "Total volume", value: "₦45.2M", change: "+22%", icon: Wallet, spark: [20, 24, 22, 28, 31, 30, 38, 45], money: true },
]

const ranges = {
  "7D": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    deposits: [3.1, 2.8, 3.6, 4.2, 5.1, 6.4, 5.2],
    payouts: [2.2, 1.9, 2.6, 3.1, 3.8, 4.9, 3.7],
  },
  "30D": {
    labels: ["1", "4", "7", "10", "13", "16", "19", "22", "25", "28"],
    deposits: [3.0, 3.4, 2.9, 4.1, 4.8, 4.4, 5.6, 5.1, 6.2, 6.8],
    payouts: [2.1, 2.4, 2.0, 3.0, 3.5, 3.2, 4.1, 3.9, 4.6, 5.0],
  },
  "90D": {
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"],
    deposits: [9, 10, 9.5, 12, 13, 12.4, 15, 14, 16.5, 17, 18.2, 20],
    payouts: [6, 7, 6.8, 8.5, 9.2, 8.8, 10.6, 10, 11.7, 12.1, 13, 14.2],
  },
}
type RangeKey = keyof typeof ranges

const mockTournaments = [
  { name: "eFootball Naija Cup", game: "eFootball", joined: 96, cap: 128, prize: "₦500k", status: "Live" },
  { name: "8 Ball Pool Weekly", game: "8 Ball Pool", joined: 64, cap: 64, prize: "₦150k", status: "Full" },
  { name: "COD Mobile Squad Clash", game: "COD Mobile", joined: 41, cap: 100, prize: "₦300k", status: "Open" },
  { name: "Midweek Blitz", game: "eFootball", joined: 18, cap: 32, prize: "₦50k", status: "Open" },
]
const statusClass: Record<string, string> = {
  Live: "bg-success/15 text-success",
  Full: "bg-primary/15 text-primary",
  Open: "bg-warning/15 text-warning",
}

// ---------- Helpers ----------

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

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${26 - ((v - min) / (max - min || 1)) * 22}`)
    .join(" ")
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className={className} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function RegistrationsChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const step = Math.ceil(data.length / 6)
  return (
    <div>
      <div className="flex h-48 items-end gap-1">
        {data.map((d, i) => (
          <div key={i} className="flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t bg-primary"
              style={{ height: `${d.value === 0 ? 1 : (d.value / max) * 100}%` }}
              title={`${d.label}: ${d.value}`}
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

// ---------- Page ----------

export default function Admin() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<RangeKey>("7D")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await api.adminDashboard())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const registrations = useMemo(
    () =>
      fillLast30Days(
        (data?.charts.registrations_last_30_days ?? []).map((p) => ({
          date: p.date,
          value: p.count,
        }))
      ),
    [data]
  )

  // Mock chart numbers (not from api)
  const chart = ranges[range]
  const chartMax = Math.max(...chart.deposits, ...chart.payouts)
  const totalIn = chart.deposits.reduce((a, b) => a + b, 0).toFixed(1)
  const totalOut = chart.payouts.reduce((a, b) => a + b, 0).toFixed(1)

  if (error && !data) {
    return (
      <div className={`${card} flex flex-col items-center px-6 py-16 text-center`}>
        <div className="grid size-12 place-items-center rounded-full bg-destructive/15 text-destructive">
          <AlertCircle className="size-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Couldn&apos;t load the dashboard</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" onClick={load}>
          Try again
        </Button>
      </div>
    )
  }

  const s = data?.stats

  const attention: {
    label: string
    value: number
    hint: string
    href: string
    icon: LucideIcon
    tone: Tone
  }[] = s
    ? [
        { label: "Pending withdrawals", value: s.pending_withdrawals, hint: "Waiting for approval", href: "/admin/transactions", icon: Banknote, tone: "warning" },
        { label: "Open disputes", value: s.open_disputes, hint: "Need a ruling", href: "/admin/tournaments", icon: Swords, tone: "danger" },
        { label: "Flagged accounts", value: s.flagged_accounts, hint: "Review before payouts", href: "/admin/users", icon: Flag, tone: "warning" },
        { label: "Results to confirm", value: s.results_to_confirm, hint: "Tournaments just ended", href: "/admin/tournaments", icon: Trophy, tone: "primary" },
      ]
    : []

  const signups = data?.recent_signups ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What needs your attention and how the platform is doing.
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

      {/* Needs attention (from api) */}
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
        {/* From api */}
        {!data ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={`${card} space-y-3 p-5`}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))
        ) : (
          <>
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total users</p>
                <Users className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">{s!.total_users.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {s!.verified_users} email-verified
              </p>
            </div>

            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Active users</p>
                <UserCheck className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-2xl font-semibold">{s!.active_users.toLocaleString()}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                of {s!.total_users} total accounts
              </p>
            </div>
          </>
        )}

        {/* Not from api */}
        {mockKpis.map((kpi) => (
          <div key={kpi.title} className={`${card} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {kpi.title} <span className="text-warning">{NOT_API}</span>
              </p>
              <kpi.icon className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className={`text-2xl font-semibold ${kpi.money ? "text-success" : ""}`}>{kpi.value}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-success">
                  <ArrowUpRight className="size-3" />
                  {kpi.change} vs last month
                </p>
              </div>
              <Sparkline data={kpi.spark} className="h-8 w-24 text-primary" />
            </div>
          </div>
        ))}
      </section>

      {/* New registrations (from api) */}
      <section className={`${card} p-5`}>
        <h2 className="font-semibold">New registrations</h2>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Last 30 days</p>
        {!data ? <Skeleton className="h-48 w-full" /> : <RegistrationsChart data={registrations} />}
      </section>

      {/* Chart + tournaments (not from api) */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${card} p-5 lg:col-span-2`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">
                Deposits vs payouts <span className="text-warning">{NOT_API}</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ₦{totalIn}M in · ₦{totalOut}M out
              </p>
            </div>
            <div className="flex rounded-lg bg-muted p-1">
              {(Object.keys(ranges) as RangeKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setRange(key)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    range === key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex h-56 items-end gap-2">
            {chart.labels.map((label, i) => (
              <div key={label} className="flex h-full flex-1 items-end justify-center gap-1">
                <div
                  className="w-full max-w-5 rounded-t bg-primary"
                  style={{ height: `${(chart.deposits[i] / chartMax) * 100}%` }}
                  title={`Deposits ₦${chart.deposits[i]}M`}
                />
                <div
                  className="w-full max-w-5 rounded-t bg-success"
                  style={{ height: `${(chart.payouts[i] / chartMax) * 100}%` }}
                  title={`Payouts ₦${chart.payouts[i]}M`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
            {chart.labels.map((label) => (
              <span key={label} className="flex-1 text-center">{label}</span>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Deposits</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" />Payouts</span>
          </div>
        </div>

        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">
              Tournaments <span className="text-warning">{NOT_API}</span>
            </h2>
            <Link href="/admin/tournaments" className="shrink-0 text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-5">
            {mockTournaments.map((t) => (
              <div key={t.name}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.game} · {t.prize} prize</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[t.status]}`}>
                    {t.status}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(t.joined / t.cap) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.joined}/{t.cap} players</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent signups (from api) */}
      <section className={`${card} p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent signups</h2>
          <Link href="/admin/users" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {!data &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3"><Skeleton className="h-8 w-48" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-16" /></td>
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
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.is_email_verified
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {u.is_email_verified ? "Verified" : "Unverified"}
                    </span>
                  </td>
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