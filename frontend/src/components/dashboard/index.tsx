"use client"

import { useAuth } from "@/contexts/AuthContext"
import { DashboardStats } from "./dashboard-stats"
import { RecentMatches } from "./recent-matches"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, TrendingUp, Medal } from "lucide-react"

export default function Dashboard() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-600/10 pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user.username}!
          </h1>
          <p className="text-foreground/60 mt-2">
            Ready to compete? Check out your gaming stats below.
          </p>
        </div>

        <DashboardStats stats={user.stats} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-purple-600/10 cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Join Tournament</p>
                  <p className="text-2xl font-bold mt-2">Start Competing</p>
                </div>
                <Trophy className="w-12 h-12 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-purple-600/10 cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Wallet Balance</p>
                  <p className="text-2xl font-bold mt-2">₦0.00</p>
                </div>
                <TrendingUp className="w-12 h-12 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-purple-600/10 cursor-pointer hover:scale-105 transition-transform">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/60">Leaderboard Rank</p>
                  <p className="text-2xl font-bold mt-2">#1,234</p>
                </div>
                <Medal className="w-12 h-12 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <RecentMatches />
      </div>
    </div>
  )
}