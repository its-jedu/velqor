"use client"

import { useState } from "react"
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
} from "lucide-react"

const card = "rounded-xl border border-border bg-card text-card-foreground"

type Tone = "warning" | "danger" | "primary"
const toneClass: Record<Tone, string> = {
  warning: "bg-warning/15 text-warning",
  danger: "bg-destructive/15 text-destructive",
  primary: "bg-primary/15 text-primary",
}

const attention: {
  label: string
  value: number
  hint: string
  href: string
  icon: LucideIcon
  tone: Tone
}[] = [
  { label: "Pending withdrawals", value: 7, hint: "₦1.2M waiting for approval", href: "/admin/transactions", icon: Banknote, tone: "warning" },
  { label: "Open disputes", value: 3, hint: "Oldest is 2 days old", href: "/admin/tournaments", icon: Swords, tone: "danger" },
  { label: "Flagged accounts", value: 5, hint: "Review before payouts", href: "/admin/users", icon: Flag, tone: "warning" },
  { label: "Results to confirm", value: 2, hint: "Tournaments just ended", href: "/admin/tournaments", icon: Trophy, tone: "primary" },
]

const kpis = [
  { title: "Total users", value: "12,345", change: "+15%", icon: Users, spark: [8, 9, 9, 11, 10, 13, 14, 16] },
  { title: "Active tournaments", value: "24", change: "+3", icon: Trophy, spark: [14, 16, 15, 18, 20, 19, 22, 24] },
  { title: "Total volume", value: "₦45.2M", change: "+22%", icon: Wallet, spark: [20, 24, 22, 28, 31, 30, 38, 45], money: true },
  { title: "Active players", value: "8,234", change: "+8%", icon: Activity, spark: [60, 64, 62, 70, 68, 74, 78, 82] },
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

const tournaments = [
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

const signups = [
  { name: "Gamer1", email: "gamer1@example.com", role: "player", joined: "Today", status: "Active" },
  { name: "Gamer2", email: "gamer2@example.com", role: "player", joined: "Today", status: "Unverified" },
  { name: "Gamer3", email: "gamer3@example.com", role: "player", joined: "Yesterday", status: "Active" },
  { name: "Gamer4", email: "gamer4@example.com", role: "player", joined: "2 days ago", status: "Banned" },
  { name: "Gamer5", email: "gamer5@example.com", role: "moderator", joined: "3 days ago", status: "Active" },
]
const userStatusClass: Record<string, string> = {
  Active: "bg-success/15 text-success",
  Unverified: "bg-warning/15 text-warning",
  Banned: "bg-destructive/15 text-destructive",
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

export default function Admin() {
  const [range, setRange] = useState<RangeKey>("7D")
  const data = ranges[range]
  const max = Math.max(...data.deposits, ...data.payouts)
  const totalIn = data.deposits.reduce((a, b) => a + b, 0).toFixed(1)
  const totalOut = data.payouts.reduce((a, b) => a + b, 0).toFixed(1)

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
        <Link
          href="/admin/tournaments"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Create tournament
        </Link>
      </div>

      {/* Needs attention */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Needs attention</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {attention.map((item) => (
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
        {kpis.map((kpi) => (
          <div key={kpi.title} className={`${card} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{kpi.title}</p>
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

      {/* Chart + tournaments */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={`${card} p-5 lg:col-span-2`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Deposits vs payouts</h2>
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
            {data.labels.map((label, i) => (
              <div key={label} className="flex h-full flex-1 items-end justify-center gap-1">
                <div
                  className="w-full max-w-5 rounded-t bg-primary"
                  style={{ height: `${(data.deposits[i] / max) * 100}%` }}
                  title={`Deposits ₦${data.deposits[i]}M`}
                />
                <div
                  className="w-full max-w-5 rounded-t bg-success"
                  style={{ height: `${(data.payouts[i] / max) * 100}%` }}
                  title={`Payouts ₦${data.payouts[i]}M`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
            {data.labels.map((label) => (
              <span key={label} className="flex-1 text-center">{label}</span>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Deposits</span>
            <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success" />Payouts</span>
          </div>
        </div>

        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tournaments</h2>
            <Link href="/admin/tournaments" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="mt-4 space-y-5">
            {tournaments.map((t) => (
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

      {/* Recent signups */}
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
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((u) => (
                <tr key={u.email} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-8 place-items-center rounded-full bg-linear-to-br from-primary to-purple-600 text-xs font-semibold text-white">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 capitalize text-muted-foreground">{u.role}</td>
                  <td className="py-3 text-muted-foreground">{u.joined}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${userStatusClass[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}