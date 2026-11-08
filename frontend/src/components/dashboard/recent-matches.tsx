"use client"

import Link from "next/link"
import { Calendar, Swords, Trophy } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatNaira } from "@/lib/format"
import type { Match, MatchResult } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

const RESULT_STYLES: Record<MatchResult, { label: string; badge: string; text: string }> = {
  win: { label: "Win", badge: "bg-green-500/20 text-green-500", text: "text-green-500" },
  loss: { label: "Loss", badge: "bg-red-500/20 text-red-500", text: "text-red-500" },
  draw: { label: "Draw", badge: "bg-yellow-500/20 text-yellow-500", text: "text-yellow-500" },
}

interface Props {
  matches: Match[]
  loading?: boolean
}

export function RecentMatches({ matches, loading }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent matches</h2>
        {!loading && matches.length > 0 && (
          <Link href="/dashboard/matches" className="text-sm text-primary hover:underline">
            View all
          </Link>
        )}
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-card/50 to-card backdrop-blur-sm">
        <CardContent className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
            ))
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Swords className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">No matches yet</p>
                <p className="text-sm text-foreground/60">
                  Join your first tournament and your results will show up here.
                </p>
              </div>
              <Link href="/dashboard/tournaments" className={cn(buttonVariants({ size: "sm" }))}>
                Browse tournaments
              </Link>
            </div>
          ) : (
            matches.map((match) => {
              const r = RESULT_STYLES[match.result]
              return (
                <div
                  key={match.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-primary/10 bg-primary/5 p-3 sm:p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        r.badge
                      )}
                    >
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold sm:text-base">
                        {match.tournament}
                      </h4>
                      <p className="truncate text-xs text-foreground/60 sm:text-sm">
                        vs {match.opponent}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground/60">
                        <Calendar className="h-3 w-3" />
                        {formatDate(match.date)}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={cn("text-sm font-semibold", r.text)}>{r.label}</div>
                    {match.prize > 0 && (
                      <div className="text-xs text-primary sm:text-sm">
                        +{formatNaira(match.prize)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </section>
  )
}