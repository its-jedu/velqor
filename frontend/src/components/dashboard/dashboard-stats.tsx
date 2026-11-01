"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Wallet, Users, Target, TrendingUp, Award } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalMatches: number
    wins: number
    losses: number
    draws: number
    totalWinnings: number
    tournamentsPlayed: number
    tournamentsWon: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const winRate = stats.totalMatches > 0 
    ? Math.round((stats.wins / stats.totalMatches) * 100) 
    : 0

  const statsCards = [
    {
      title: "Total Matches",
      value: stats.totalMatches,
      subValue: `Wins: ${stats.wins} | Losses: ${stats.losses}`,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Win Rate",
      value: `${winRate}%`,
      subValue: `${stats.draws} draws`,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Total Winnings",
      value: `₦${stats.totalWinnings.toLocaleString()}`,
      subValue: `${stats.tournamentsPlayed} tournaments played`,
      icon: Wallet,
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Tournaments Won",
      value: stats.tournamentsWon,
      subValue: `Out of ${stats.tournamentsPlayed}`,
      icon: Award,
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card, index) => (
        <Card key={index} className="border-primary/20 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} p-1.5`}>
              <card.icon className="w-full h-full text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.subValue}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}