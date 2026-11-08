"use client"

import { Award, Target, TrendingUp, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNaira } from "@/lib/format"
import type { DashboardStatsData } from "@/lib/mock-data"
import { Skeleton } from "./skeleton"

interface Props {
  stats: DashboardStatsData | null
  loading?: boolean
}

const ZERO: DashboardStatsData = {
  totalMatches: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  totalWinnings: 0,
  tournamentsPlayed: 0,
  tournamentsWon: 0,
}

export function DashboardStats({ stats, loading }: Props) {
  if (loading) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold">Your stats</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-primary/20">
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  const s = stats ?? ZERO
  const winRate = s.totalMatches > 0 ? Math.round((s.wins / s.totalMatches) * 100) : 0

  const cards = [
    {
      title: "Total Matches",
      value: s.totalMatches,
      sub: `${s.wins}W · ${s.losses}L · ${s.draws}D`,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Win Rate",
      value: `${winRate}%`,
      sub: s.totalMatches > 0 ? `${s.wins} of ${s.totalMatches} matches` : "No matches yet",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Winnings",
      value: formatNaira(s.totalWinnings),
      sub: `${s.tournamentsPlayed} tournaments played`,
      icon: Wallet,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Tournaments Won",
      value: s.tournamentsWon,
      sub: `Out of ${s.tournamentsPlayed}`,
      icon: Award,
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Your stats</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="border-primary/20 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium text-foreground/70 sm:text-sm">
                {card.title}
              </CardTitle>
              <div className={`h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br ${card.color} p-1.5`}>
                <card.icon className="h-full w-full text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold sm:text-2xl">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}