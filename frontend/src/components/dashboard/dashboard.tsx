"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useDashboard } from "@/contexts/DashboardContext"
import { DashboardStats } from "./dashboard-stats"
import { RecentMatches } from "./recent-matches"
import { UpcomingTournaments } from "./upcoming-tournaments"
import { VerifyEmailBanner } from "./verify-email-banner"
import { WalletHero } from "./wallet-hero"

export default function Dashboard() {
  const { user } = useAuth()
  const { wallet, stats, tournaments, matches, loading, error, reload } = useDashboard()

  if (!user) return null

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold sm:text-3xl">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            { user.username}
          </span>
        </h1>
        <p className="mt-1 text-sm text-foreground/60">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </header>

      {!user.is_email_verified && <VerifyEmailBanner email={user.email} />}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
          <span className="text-red-500">{error}</span>
          <Button variant="outline" size="sm" onClick={reload}>
            Try again
          </Button>
        </div>
      )}

      <WalletHero wallet={wallet} loading={loading} />
      <UpcomingTournaments tournaments={tournaments} loading={loading} />
      <DashboardStats stats={stats} loading={loading} />
      <RecentMatches matches={matches} loading={loading} />
    </div>
  )
}