"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { formatNaira } from "@/lib/format"
import type { Tournament } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Skeleton } from "./skeleton"

function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, new Date(to).getTime() - now)
  if (diff === 0) return <span>Starting now</span>

  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1000)

  return (
    <span className="tabular-nums">
      Starts in {h}h {m}m {s}s
    </span>
  )
}

interface Props {
  tournaments: Tournament[]
  loading?: boolean
}

export function UpcomingTournaments({ tournaments, loading }: Props) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Live &amp; upcoming tournaments</h2>
        <Link href="/dashboard/tournaments" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <Card className="border-primary/20">
          <CardContent className="py-8 text-center text-sm text-foreground/60">
            No tournaments are open right now. Check back soon.
          </CardContent>
        </Card>
      ) : (
        <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {tournaments.map((t) => {
            const pct = Math.min(100, Math.round((t.players / t.maxPlayers) * 100))
            return (
              <Card
                key={t.id}
                className="min-w-[280px] snap-start border-primary/20 bg-gradient-to-br from-card/50 to-card md:min-w-0"
              >
                <CardContent className="flex h-full flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                      {t.game}
                    </span>
                    {t.status === "live" ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        LIVE
                      </span>
                    ) : (
                      <span className="text-xs text-foreground/60">
                        <Countdown to={t.startsAt} />
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold leading-snug">{t.name}</h3>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-foreground/60">Entry fee</p>
                      <p className="font-semibold">{formatNaira(t.entryFee)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/60">Prize pool</p>
                      <p className="font-semibold text-primary">{formatNaira(t.prizePool)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs text-foreground/60">
                      <span>
                        {t.players}/{t.maxPlayers} players
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-purple-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/tournaments/${t.id}`}
                    className={cn(buttonVariants({ size: "sm" }), "mt-auto w-full")}
                  >
                    View &amp; Join
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </section>
  )
}